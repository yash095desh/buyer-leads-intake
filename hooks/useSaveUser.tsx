"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";

export function useSaveUser() {
  const { user } = useUser();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const saveUser = async () => {
      setStatus("saving");
      setErrorMessage(null);

      try {
        const res = await axios.post("/api/user", {
          name: user.fullName,
          email: user.emailAddresses[0]?.emailAddress || null,
        });

        if (res.status === 200) {
          setStatus("saved");
        } else {
          setStatus("error");
          setErrorMessage(res.data?.error || "Unknown error");
        }
      } catch (err: any) {
        console.error(err);
        setStatus("error");
        setErrorMessage(err.response?.data?.error || err.message || "Unknown error");
      }
    };

    saveUser();
  }, [user]);

  return { status, errorMessage };
}
