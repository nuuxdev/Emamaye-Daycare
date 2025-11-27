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
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 360 309"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMin slice"
          >
            <g filter="url(#filter0_if_97_55)">
              <path
                d="M166.5 250.5C70.5 250.5 20.6674 288.004 0 308V0H361V158.029C343.46 217.57 235.915 250.5 166.5 250.5Z"
                fill="url(#paint0_linear_97_55)"
              />
            </g>
            <defs>
              <filter
                id="filter0_if_97_55"
                x="-1"
                y="-15"
                width="363"
                height="324"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend
                  mode="normal"
                  in="SourceGraphic"
                  in2="BackgroundImageFix"
                  result="shape"
                />
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                  result="hardAlpha"
                />
                <feOffset dy="-15" />
                <feGaussianBlur stdDeviation="12.5" />
                <feComposite
                  in2="hardAlpha"
                  operator="arithmetic"
                  k2="-1"
                  k3="1"
                />
                <feColorMatrix
                  type="matrix"
                  values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"
                />
                <feBlend
                  mode="normal"
                  in2="shape"
                  result="effect1_innerShadow_97_55"
                />
                <feGaussianBlur
                  stdDeviation="0.5"
                  result="effect2_foregroundBlur_97_55"
                />
              </filter>
              <linearGradient
                id="paint0_linear_97_55"
                x1="361"
                y1="0"
                x2="56.8421"
                y2="356.497"
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0.119284" stopColor="#FEA4AB" />
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
