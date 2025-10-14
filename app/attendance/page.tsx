"use client";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { JSX, useEffect, useState } from "react";
import AttendanceCard from "../views/attendance/Card";
import AttendanceList from "../views/attendance/List";

export default function Attendance() {
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [currentChildIndex, setCurrentChildIndex] = useState(0);
  const [view, setView] = useState<"card" | "list">("card");
  const childrenData = useQuery(api.children.getChildren);
  const attendancesByDate = useQuery(api.attendance.getAttendanceByDate, {
    date: attendanceDate,
  });
  const [attendanceData, setAttendanceData] = useState<
    { childId: Id<"children">; status: Doc<"attendance">["status"] }[]
  >([]);

  useEffect(() => {
    if (attendancesByDate === undefined) return;
    console.log("effect running without returning");
    if (attendancesByDate.length !== 0) {
      setAttendanceData(
        attendancesByDate.map((attendance) => ({
          childId: attendance.childId,
          status: attendance.status,
        })),
      );
      setView("list");
    } else {
      setAttendanceData([]);
      if (attendanceDate === new Date().toISOString().slice(0, 10)) {
        setView("card");
      }
    }
  }, [attendancesByDate, attendanceDate]);
  const recordAttendance = useMutation(api.attendance.recordAttendance);

  const recordAttendanceHandler = async () => {
    await recordAttendance({ attendanceData, date: attendanceDate });
  };

  if (childrenData === undefined || attendancesByDate === undefined)
    return <div>Loading...</div>;

  const saveAttendance = (status: Doc<"attendance">["status"]) => {
    setAttendanceData([
      ...attendanceData,
      { childId: childrenData[currentChildIndex]._id, status },
    ]);
    if (currentChildIndex !== childrenData.length - 1) {
      setCurrentChildIndex(currentChildIndex + 1);
    }
  };

  const viewComponents: Record<"card" | "list", JSX.Element> = {
    card: (
      <AttendanceCard
        currentChild={childrenData[currentChildIndex]}
        childrenData={childrenData}
        attendanceData={attendanceData}
        saveAttendance={saveAttendance}
        recordAttendanceHandler={recordAttendanceHandler}
      />
    ),
    list: (
      <AttendanceList
        childrenData={childrenData}
        attendancesByDate={attendancesByDate}
      />
    ),
  };
  return (
    <>
      <header>
        <Link href="/">&lt;-</Link>
        Attendance
        <input
          type="date"
          value={attendanceDate}
          onChange={(e) => setAttendanceDate(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
        />
      </header>
      <main>
        <div style={{ display: "grid", gap: "1rem" }}>
          <h1>Children List</h1>
          {viewComponents[view]}
        </div>
      </main>
      <footer>
        <Link href="/attendance">Attendance</Link>
      </footer>
    </>
  );
}
