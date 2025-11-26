"use client";
import Link from "next/link";

export default function Home() {
  const cardStyle = {
    aspectRatio: "1/1",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };
  return (
    <>
      <header style={{ textAlign: "center" }}><h2>Emamaye Daycare Pro</h2></header>
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
            Children
          </Link>
          <Link href="/attendance" style={cardStyle} className="neo-box">
            Attendance
          </Link>
          <Link href="/register" style={cardStyle} className="neo-box">
            Register
          </Link>
          <Link href="/payment" style={cardStyle} className="neo-box">
            Payment
          </Link>
        </div>
      </main>
    </>
  );
}
