"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

export default function SignIn() {
  const { signIn } = useAuthActions();
  const [isLoading, setIsLoading] = useState(false);
  const [flow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <main className="signin-container">
      <header className="signin-header">
        <div className="signin-header-bg">
          <svg style={{ flexShrink: 0 }} width="167" height="332" viewBox="0 0 167 332" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M166.5 275C70.5 275 20.6674 312.004 0 332V0H166.5V275Z" fill="url(#paint0_linear_167_19)" />
            <defs>
              <linearGradient id="paint0_linear_167_19" x1="83.25" y1="-4.94719e-06" x2="83.25" y2="332" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FEA4AB" />
                <stop offset="0.827875" stopColor="#F6465A" />
              </linearGradient>
            </defs>
          </svg>
          <svg style={{ flexGrow: 1, minWidth: 0, height: 275, marginInline: "-1px" }} height="275" viewBox="0 0 61 275" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M61 275H0V0H61V275Z" fill="url(#paint0_linear_167_21)" />
            <defs>
              <linearGradient id="paint0_linear_167_21" x1="30.5" y1="2.74043e-07" x2="30.5" y2="275" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FEA4AB" />
                <stop offset="1" stopColor="#F6465A" />
              </linearGradient>
            </defs>
          </svg>
          <svg style={{ flexShrink: 0 }} width="181" height="275" viewBox="0 0 181 275" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M180.5 182.5C164.101 238.166 69 274.971 0 274.971V0H180.5V182.5Z" fill="url(#paint0_linear_167_25)" />
            <defs>
              <linearGradient id="paint0_linear_167_25" x1="90.25" y1="2.42102e-06" x2="90.25" y2="274.971" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FEA4AB" />
                <stop offset="1" stopColor="#F6465A" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="signin-icon-wrapper">
          <Image
            src="/references/family.png"
            alt="Family"
            fill
            className="object-contain"
          />
        </div>

        <div className="signin-title-wrapper">
          <h1 className="signin-title">
            Emamaye Daycare <span>Pro</span>
          </h1>
          <p className="signin-subtitle">The least I can do for Emamaye</p>
        </div>
      </header>

      <div className="signin-content">

        <form
          className="signin-form"
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target as HTMLFormElement);
            formData.set("flow", flow);
            try {
              setIsLoading(true);
              await signIn("password", formData);
              router.push("/");
            } catch (error) {
              console.error(error);
              setError("Oops!😯 Error signing in!");
            } finally {
              setIsLoading(false);
            }
          }}
        >
          <input type="email" name="email" placeholder="Email" required />
          <input type="password" name="password" placeholder="Password" required />

          <button type="submit" className="primary">
            {isLoading ? "Signing In..." : "Sign in"}
            {!isLoading && (
              <Image
                src="/references/arrow.png"
                width={20}
                height={20}
                alt="Arrow"
                className="arrow-icon"
              />
            )}
          </button>

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
