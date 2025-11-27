"use client";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import GlassHeader from "@/components/GlassHeader";

export default function ChildInfo() {
  const { childId } = useParams();

  const child = useQuery(api.children.getChild, {
    id: childId as Id<"children">,
  });
  return (
    <>
      <GlassHeader title="Child Info" backHref="/children" />
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
