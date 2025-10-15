"use client";
import Link from "next/link";

export default function Home() {
  const cardStyle = {
    aspectRatio: "1/1",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "1px solid currentColor",
  };
  return (
    <>
      <header>Emamaye Daycare Pro</header>
      <main>
        <h1>Emamaye Daycare Pro</h1>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "1rem",
            aspectRatio: "1/1",
          }}
        >
          <Link href="/children" style={cardStyle}>
            Children
          </Link>
          <Link href="/attendance" style={cardStyle}>
            Attendance
          </Link>
          <Link href="/register" style={cardStyle}>
            Register
          </Link>
          <Link href="/payment" style={cardStyle}>
            Payment
          </Link>
        </div>
      </main>
    </>
  );
}
