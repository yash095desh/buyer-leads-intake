"use client";

import { useSaveUser } from "@/hooks/useSaveUser";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Header() {
  const { status, errorMessage } = useSaveUser();

  return (
    <header className="flex justify-between items-center px-6 py-4 shadow-md bg-white dark:bg-gray-900">
      <div className="text-xl font-bold text-gray-900 dark:text-white">
        BuyerLead Intake
      </div>

      <div className="flex items-center gap-4">
        <SignedIn>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </div>
    </header>
  );
}
