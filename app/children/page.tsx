"use client";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function ChildrenList() {
  const children = useQuery(api.children.getChildrenWithPrimaryGuardian);
  return (
    <>
      <header>
        <Link href="/">&lt;-</Link>
        Children
      </header>
      <main>
        <div style={{ display: "grid", gap: "1rem" }}>
          {children?.map((child) => (
            <details key={child._id}>
              <summary
                style={{ display: "flex", gap: "1rem", alignItems: "start" }}
              >
                <Link
                  href={`/children/${child._id}`}
                  style={{
                    width: "5rem",
                    aspectRatio: "1/1",
                    borderRadius: "50%",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={child.avatar}
                    alt="child avatar"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Link>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <div>
                    <p>{child.fullName}</p>
                    <p>{child.gender}</p>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "end",
                    }}
                  >
                    <p className={`pill ${child.ageGroup}`}>{child.ageGroup}</p>
                    <p>{child.dateOfBirth}</p>
                  </div>
                </div>
              </summary>
              <div style={{ padding: "1rem 2rem" }}>
                <p>{child.primaryGuardianFullName}</p>
                <p>{child.primaryGuardianPhoneNumber}</p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "0.5rem",
                  }}
                >
                  <button>
                    <Link href={`tel:${child.primaryGuardianPhoneNumber}`}>
                      Call
                    </Link>
                  </button>
                  <button>
                    <Link href={`/children/${child._id}`}>Info</Link>
                  </button>
                </div>
              </div>
            </details>
          ))}
        </div>
      </main>
    </>
  );
}
