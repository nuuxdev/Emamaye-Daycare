"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function ChildInfo() {
  const { childId } = useParams();

  const child = useQuery(api.children.getChild, {
    id: childId as Id<"children">,
  });
  return (
    <>
      <header>
        <Link href="/children">&lt;-</Link>
        Child Info
      </header>
      <main>
        <h4>ChildId: {childId}</h4>
        <img
          src={child?.avatar}
          alt={child?.fullName}
          style={{
            width: "10rem",
            height: "10rem",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
        <h3>ChildName: {child?.fullName}</h3>
        <p>Gender: {child?.gender}</p>
        <p>Age Group: {child?.ageGroup}</p>
        <p>Date of Birth: {child?.dateOfBirth}</p>
        <p>Primary Guardian Id: {child?.primaryGuardian}</p>
        <p>Payment Amount: {child?.paymentAmount}</p>
      </main>
    </>
  );
}
