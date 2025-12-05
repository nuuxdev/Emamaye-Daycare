"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import GlassHeader from "@/components/GlassHeader";
import { JSX, useEffect, useState } from "react";
import { ArrowRight, CallIcon, InfantIcon, MessageIcon, PreschoolerIcon, ToddlerIcon } from "@/components/Icons";
import { formatEthiopianDate } from "@/utils/calendar";
import { calculateAge } from "@/utils/calculateAge";
import { parseDate } from "@internationalized/date";

// Simple confetti component
const Confetti = () => {
  const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#1dd1a1'];
  const confettiPieces = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360
  }));

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      overflow: 'hidden',
      zIndex: 9999
    }}>
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          style={{
            position: 'absolute',
            left: `${piece.left}%`,
            top: '-20px',
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            backgroundColor: piece.color,
            borderRadius: piece.id % 3 === 0 ? '50%' : '2px',
            transform: `rotate(${piece.rotation}deg)`,
            animation: `confetti-fall ${piece.duration}s ease-in forwards`,
            animationDelay: `${piece.delay}s`,
            opacity: 0
          }}
        />
      ))}
      <style>{`
        @keyframes confetti-fall {
          0% {
            opacity: 1;
            top: -20px;
            transform: translateX(0) rotate(0deg);
          }
          100% {
            opacity: 0;
            top: 100vh;
            transform: translateX(${Math.random() > 0.5 ? '' : '-'}100px) rotate(720deg);
          }
        }
      `}</style>
    </div>
  );
};

export default function ChildInfo() {
  const { childId } = useParams();
  const [showConfetti, setShowConfetti] = useState(false);

  const child = useQuery(api.children.getChild, {
    id: childId as Id<"children">,
  });

  // Check if it's the child's birthday and trigger confetti
  const isBirthday = child ? calculateAge(parseDate(child.dateOfBirth))?.age === "happy birthday!" : false;

  useEffect(() => {
    if (isBirthday) {
      setShowConfetti(true);
      // Hide confetti after animation completes
      const timeout = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [isBirthday]);

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
      {showConfetti && <Confetti />}
      <GlassHeader title="Child Info" backHref="/children" />
      <main style={{ width: "100%", maxWidth: "600px", marginInline: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
          {/* Child Info Box */}
          <div className="neo-box">
            {/* Avatar with birthday hat */}
            <div style={{ position: "relative", display: "inline-block" }}>
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
              {/* Birthday hat emoji - positioned on top left of avatar */}
              {isBirthday && (
                <span style={{
                  position: "absolute",
                  top: "-10px",
                  left: "-5px",
                  fontSize: "2.5rem",
                  transform: "rotate(-20deg)",
                  filter: "drop-shadow(2px 2px 2px rgba(0,0,0,0.3))"
                }}>
                  🥳
                </span>
              )}
            </div>
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
              {isBirthday ? (
                <span style={{ fontWeight: 600, fontSize: "1.1rem", color: "var(--primary-color)" }}>
                  🎉 Happy Birthday! 🎉
                </span>
              ) : (
                ageInAmharic && <span style={{ fontWeight: 500 }} dangerouslySetInnerHTML={{ __html: ageInAmharic }} />
              )}
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
