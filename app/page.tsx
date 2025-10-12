"use client";

import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <header>
        Emamaye Daycare Pro
        <SignOutButton />
      </header>
      <main>
        <h1>Emamaye Daycare Pro</h1>
      </main>
      <footer>
        <Link href="/attendance">Attendance</Link>
        <Link href="/register">Register</Link>
      </footer>
    </>
  );
}

function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  return (
    <>
      {isAuthenticated && (
        <button
          onClick={() =>
            void signOut().then(() => {
              router.push("/signin");
            })
          }
        >
          Sign out
        </button>
      )}
    </>
  );
}
