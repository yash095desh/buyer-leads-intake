'use client';

import { useSaveUser } from "@/hooks/useSaveUser";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Header() {
  useSaveUser();
  const router = useRouter();

  const handleCreateBuyer = () => {
    router.push('/buyers/new');
  };

  return (
    <header className="flex justify-between items-center px-6 py-4 shadow-md bg-white dark:bg-gray-900">
      <Link href={'/'}>
        <div className="text-xl font-bold text-gray-900 dark:text-white">
          BuyerLead Intake
        </div>
      </Link>

      <div className="flex items-center gap-4">
        <SignedIn>
          <Button onClick={handleCreateBuyer} variant="outline" size="sm">
            Create Buyer Profile
          </Button>
          <UserButton />
        </SignedIn>
        <SignedOut>
          <SignInButton />
        </SignedOut>
      </div>
    </header>
  );
}
