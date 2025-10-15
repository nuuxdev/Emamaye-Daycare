"use client";
import Link from "next/link";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";

export default function ChildrenList() {
  const [guardianPhoneNumber, setGuardianPhoneNumber] = useState<
    Record<Id<"guardians">, string>
  >({});
  const children = useQuery(api.children.getChildren);
  const getPhoneNumber = useAction(api.guardians.getPhoneNumber);
  return (
    <>
      <header>
        <Link href="/">&lt;-</Link>
        Children
      </header>
      <main>
        <div>
          {children?.map((child) => (
            <details
              key={child._id}
              onToggle={async (e) => {
                const details = e.currentTarget;
                if (details.open) {
                  const phoneNumber = await getPhoneNumber({
                    field: "phoneNumber",
                    id: child.primaryGuardian,
                  });
                  setGuardianPhoneNumber((prev) => ({
                    ...prev,
                    [child.primaryGuardian]: phoneNumber,
                  }));
                }
              }}
            >
              <summary style={{ display: "flex", gap: "1rem" }}>
                <img
                  src={child.avatar}
                  alt="child avatar"
                  style={{
                    width: "5rem",
                    height: "5rem",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
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
                    <p>{child.ageGroup}</p>
                    <p>{child.dateOfBirth}</p>
                  </div>
                </div>
              </summary>

              <p>child avatar: {child.avatar}</p>
              <p>child primary guardian: {child.primaryGuardian}</p>
              <Link href={`tel:${guardianPhoneNumber[child.primaryGuardian]}`}>
                Call
              </Link>
            </details>
          ))}
        </div>
      </main>
    </>
  );
}
