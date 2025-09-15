import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import axios from "axios";
import { User } from "@prisma/client";

export function useSaveUser() {
  const { user } = useUser();
  const [userInfo, setUserInfo] = useState<User | null>(null);

  useEffect(() => {
    if (!user) return;
    const saveUser = async () => {

      try {
        const res = await axios.post("/api/user", {
          name: user.fullName,
          email: user.emailAddresses[0]?.emailAddress || null,
        });

        setUserInfo(res?.data)
 
      } catch (err: any) {
        console.error(err);
      }
    };

    saveUser();
  }, [user]);

  return {user:userInfo};
}
