"use client";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <header>Emamaye Daycare Pro</header>
      <main>
        <h1>Emamaye Daycare Pro</h1>
      </main>
      <footer>
        <Link href="/attendance">Attendance</Link>
        <Link href="/register">Register</Link>
        <Link href="/children">Children</Link>
        <Link href="/payment">Payment</Link>
      </footer>
    </>
  );
}
