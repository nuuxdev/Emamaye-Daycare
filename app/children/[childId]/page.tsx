"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import GlassHeader from "@/components/GlassHeader";
import { JSX } from "react";
import { ArrowRight, CallIcon, InfantIcon, MessageIcon, PreschoolerIcon, ToddlerIcon } from "@/components/Icons";
import { formatEthiopianDate } from "@/utils/calendar";
import { calculateAge } from "@/utils/calculateAge";
import { parseDate } from "@internationalized/date";

export default function ChildInfo() {
  const { childId } = useParams();

  const child = useQuery(api.children.getChild, {
    id: childId as Id<"children">,
  });

  if (!child) return null;

  // Format birthdate to Ethiopian/Amharic format
  const ethiopianBirthdate = formatEthiopianDate(child.dateOfBirth);

  // Calculate age in Amharic
  const birthDate = parseDate(child.dateOfBirth);
  const ageResult = calculateAge(birthDate);
  const ageInAmharic = ageResult?.age || "";

  const ageGroupIcons: Record<string, JSX.Element> = {
    infant: <InfantIcon />,
    toddler: <ToddlerIcon />,
    preschooler: <PreschoolerIcon />,
  };

  return (
    <>
      <GlassHeader title="Child Info" backHref="/children" />
      <main style={{ width: "100%", maxWidth: "600px", marginInline: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
          {/* Child Info Box */}
          <div className="neo-box">
            <img
              src={child.avatar}
              alt={child.fullName}
              style={{
                width: "10rem",
                height: "10rem",
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
              <h3 style={{ margin: 0 }}>{child.fullName}</h3>
              <div
                className={`tabs secondary ${child.ageGroup}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  borderRadius: "16px",
                  padding: "0.5rem 1rem",
                  width: "fit-content"
                }}
              >
                {ageGroupIcons[child.ageGroup]}
                <span style={{ textTransform: "capitalize" }}>{child.ageGroup}</span>
              </div>
            </div>

            {/* Age and Birthdate in Amharic */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", opacity: 0.7 }}>
              {ageInAmharic && <span style={{ fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: ageInAmharic }} />}
              <span>🎂{ethiopianBirthdate}🎂</span>
            </div>
          </div>

          {/* Guardian Info Box */}
          {child.primaryGuardian && (
            <div className="neo-box" style={{ alignItems: "stretch" }}>
              <h4 style={{ textAlign: "center", marginBottom: "1rem" }}>Primary Guardian</h4>

              <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1rem" }}>
                <img
                  src={child.primaryGuardian.avatar}
                  alt={child.primaryGuardian.fullName}
                  style={{
                    width: "4rem",
                    height: "4rem",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
                <div>
                  <h4 style={{ margin: 0, fontSize: "1.1rem" }}>{child.primaryGuardian.fullName}</h4>
                  <p style={{ margin: 0, opacity: 0.7, textTransform: "capitalize" }}>
                    {child.primaryGuardian.relationToChild}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                <a
                  href={`tel:${child.primaryGuardian.phoneNumber}`}
                  className="glass-pill"
                  style={{
                    color: "var(--success-color)",
                    aspectRatio: "1/1",
                    padding: 0,
                    width: "3.5rem",
                    height: "3.5rem"
                  }}
                >
                  <CallIcon />
                </a>

                <a
                  href={`sms:${child.primaryGuardian.phoneNumber}`}
                  className="glass-pill"
                  style={{
                    color: "var(--info-color)",
                    aspectRatio: "1/1",
                    padding: 0,
                    width: "3.5rem",
                    height: "3.5rem"
                  }}
                >
                  <MessageIcon />
                </a>

                <Link
                  // href={`/guardians/${child.primaryGuardian._id}`}
                  href="#"
                  className="glass-pill"
                  style={{
                    color: "var(--foreground)",
                    aspectRatio: "1/1",
                    padding: 0,
                    width: "3.5rem",
                    height: "3.5rem"
                  }}
                >
                  <ArrowRight />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main >
    </>
  );
}
