"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignIn() {
  const { signIn } = useAuthActions();
  const [flow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  return (
    <main className="center">
      <h1>
        Emamaye daycare <span>Pro</span>
      </h1>
      <p className="subheader">the least I can do for emamaye</p>
      <form
        style={{ display: "grid", gap: "1rem" }}
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          formData.set("flow", flow);
          void signIn("password", formData)
            .catch((error) => {
              setError(error.message);
            })
            .then(() => {
              router.push("/");
            });
        }}
      >
        <input type="email" name="email" placeholder="Email" />
        <input type="password" name="password" placeholder="Password" />
        <button type="submit" className="primary-button">
          {flow === "signIn" ? "Sign in" : "Sign up"}
        </button>
        {/* <div className="inline-flex">
          <p>
            {flow === "signIn"
              ? "Don't have an account?"
              : "Already have an account?"}
          </p>
          <a href={flow === "signIn" ? "/signup" : "/signin"}>
            {flow === "signIn" ? "Sign up instead" : "Sign in instead"}
          </a>
        </div> */}
        {error && (
          <div className="bg-red-500/20 border-2 border-red-500/50 rounded-md p-2">
            <p className="text-foreground font-mono text-xs">
              Oops!😯Error signing in!
            </p>
          </div>
        )}
      </form>
    </main>
  );
}
