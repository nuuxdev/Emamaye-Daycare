"use client";
import Link from "next/link";
import GlassHeader from "@/components/GlassHeader";
import { ClipboardIcon, MoneyIcon, AttendanceIcon, PreschoolerIcon } from "@/components/Icons";

export default function Home() {
  const cardStyle = {
    aspectRatio: "1/1",
    display: "flex",
    flexDirection: "column" as const,
    justifyContent: "center",
    alignItems: "center",
    gap: "0.5rem",
    padding: "2rem"
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
            <PreschoolerIcon />
            <span>ልጆቼ</span>
          </Link>
          <Link href="/attendance" style={cardStyle} className="neo-box">
            <AttendanceIcon />
            <span>አቴንዳንስ</span>
          </Link>
          <Link href="/register" style={cardStyle} className="neo-box">
            <ClipboardIcon />
            <span>ምዝገባ</span>
          </Link>
          <Link href="/payments" style={cardStyle} className="neo-box">
            <MoneyIcon />
            <span>ክፍያ</span>
          </Link>
        </div>
      </main>
    </>
  );
}
