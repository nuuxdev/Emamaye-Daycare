"use client";
import Link from "next/link";
import GlassHeader from "@/components/GlassHeader";

export default function Home() {
  const cardStyle = {
    aspectRatio: "1/1",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };
  return (
    <>
      <GlassHeader title="Emamaye Daycare Pro" />
      <main>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "1rem",
            aspectRatio: "1/1",
          }}
        >
          <Link href="/children" style={cardStyle} className="neo-box">
            ልጆቼ
          </Link>
          <Link href="/attendance" style={cardStyle} className="neo-box">
            አቴንዳንስ
          </Link>
          <Link href="/register" style={cardStyle} className="neo-box">
            ምዝገባ
          </Link>
          <Link href="/payment" style={cardStyle} className="neo-box">
            ክፍያ
          </Link>
        </div>
      </main>
    </>
  );
}
