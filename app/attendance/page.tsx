"use client";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";

export default function Attendance() {
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const children = useQuery(api.children.getChildren);
  const attendancesByDate = useQuery(api.attendance.getAttendanceByDate, {
    date: attendanceDate,
  });
  const recordAttendance = useMutation(api.attendance.recordAttendance);

  const recordAttendanceHandler = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const attendanceRecord = formData.getAll("attendance") as Id<"children">[];
    await recordAttendance({ attendanceRecord, date: attendanceDate });
  };

  if (attendancesByDate === undefined || children === undefined)
    return <div>Loading...</div>;

  return (
    <>
      <header>
        <Link href="/">&lt;-</Link>
        Attendance
      </header>
      <main>
        <form
          onSubmit={recordAttendanceHandler}
          style={{ display: "grid", gap: "1rem" }}
        >
          <h2>Children List</h2>
          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
          />
          {children.map((child) => (
            <div key={child._id} style={{ display: "flex", gap: "1rem" }}>
              <div
                style={{
                  width: "4rem",
                  height: "4rem",
                  borderRadius: "1rem",
                  overflow: "hidden",
                }}
              >
                <img
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  src={child.avatar}
                  alt={child.fullName}
                />
              </div>
              <p>{child.fullName}</p>
              <p>{child.gender}</p>
              <input
                type="checkbox"
                name="attendance"
                value={child._id}
                defaultChecked={attendancesByDate.some(
                  (attendance) => attendance.childId === child._id,
                )}
                disabled={
                  attendanceDate !== new Date().toISOString().slice(0, 10)
                }
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={attendanceDate !== new Date().toISOString().slice(0, 10)}
            className="primary-button"
          >
            Record Attendance
          </button>
        </form>
      </main>
      <footer>
        <Link href="/attendance">Attendance</Link>
      </footer>
    </>
  );
}
