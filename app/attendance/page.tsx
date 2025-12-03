"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { JSX, useEffect, useState } from "react";
import AttendanceCard from "../views/attendance/Card";
import AttendanceList from "../views/attendance/List";
import { TStatus } from "@/convex/types/attendance";
import GlassHeader from "@/components/GlassHeader";
import { SelectDate } from "../views/register/Calendar";
import { GregorianCalendar, toCalendar } from "@internationalized/date";

export default function Attendance() {
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [currentChildIndex, setCurrentChildIndex] = useState(0);
  const [view, setView] = useState<"card" | "list" | "preview">("card");
  const childrenData = useQuery(api.children.getChildrenWithPrimaryGuardian);
  const attendancesByDate = useQuery(api.attendance.getAttendanceByDate, {
    date: attendanceDate,
  });
  const [attendanceData, setAttendanceData] = useState<
    { childId: Id<"children">; status: TStatus }[]
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
    setView("list");
  };

  if (childrenData === undefined || attendancesByDate === undefined)
    return <div>Loading...</div>;

  const saveAttendance = (status: TStatus) => {
    const currentChildId = childrenData[currentChildIndex]._id;
    const existingIndex = attendanceData.findIndex(
      (att) => att.childId === currentChildId
    );

    let newAttendanceData;
    if (existingIndex !== -1) {
      // Update existing record
      newAttendanceData = [...attendanceData];
      newAttendanceData[existingIndex] = { childId: currentChildId, status };
      setAttendanceData(newAttendanceData);
      // Don't auto-advance when updating
    } else {
      // Add new record
      newAttendanceData = [
        ...attendanceData,
        { childId: currentChildId, status },
      ];
      setAttendanceData(newAttendanceData);

      // Auto-advance only when adding new record
      if (currentChildIndex === childrenData.length - 1) {
        // Show preview after marking last child
        setTimeout(() => setView("preview"), 300);
      } else {
        setCurrentChildIndex(currentChildIndex + 1);
      }
    }
  };

  const PreviewView = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%", paddingBottom: "5rem" }}>
      <h3 style={{ textAlign: "center" }}>Review Attendance</h3>
      {childrenData.map((child) => {
        const status = attendanceData.find((att) => att.childId === child._id)?.status;
        return (
          <div key={child._id} className="neo-box" style={{ flexDirection: "row", justifyContent: "space-between", padding: "1rem" }}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
              <img
                src={child.avatar}
                alt={child.fullName}
                style={{
                  width: "3rem",
                  height: "3rem",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <span>{child.fullName}</span>
            </div>
            <span
              style={{
                color: status === "present" ? "var(--success-color)" : "var(--error-color)",
                fontWeight: "700",
                textTransform: "capitalize",
              }}
            >
              {status}
            </span>
          </div>
        );
      })}
    </div>
  );

  const viewComponents: Record<"card" | "list" | "preview", JSX.Element> = {
    card: (
      <AttendanceCard
        currentChild={childrenData[currentChildIndex]}
        childrenData={childrenData}
        attendanceData={attendanceData}
        saveAttendance={saveAttendance}
        currentChildIndex={currentChildIndex}
        setCurrentChildIndex={setCurrentChildIndex}
      />
    ),
    list: (
      <AttendanceList
        childrenData={childrenData}
        attendancesByDate={attendancesByDate}
      />
    ),
    preview: <PreviewView />,
  };

  return (
    <>
      <GlassHeader
        title="Attendance"
        backHref="/"
        action={
          <div className="glass-pill">
            <SelectDate onSelect={(dateInEt) => setAttendanceDate(toCalendar(dateInEt, new GregorianCalendar()).toString())} />
          </div>
        }
      />
      <main>
        <div style={{ display: "grid", gap: "1rem", width: "100%", maxWidth: "600px" }}>
          <h3 style={{ textAlign: "center", margin: 0 }}>
            {new Date(attendanceDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h3>
          {viewComponents[view]}
        </div>
      </main>

      {/* Floating Submit Button */}
      {view === "preview" && (
        <button
          onClick={recordAttendanceHandler}
          className="primary"
          style={{
            position: "fixed",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 100,
            minWidth: "200px",
          }}
        >
          Submit Attendance
        </button>
      )}
    </>
  );
}
