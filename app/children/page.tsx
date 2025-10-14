"use client";
import Link from "next/link";

export default function ChildrenList() {
  return (
    <>
      <header>
        <Link href="/">&lt;-</Link>
        Children
      </header>
      <main>
        <h1>Children List</h1>
      </main>
    </>
  );
}
