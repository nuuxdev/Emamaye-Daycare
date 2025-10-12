"use client";
import { useMutation, useQuery } from "convex/react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useState } from "react";

export default function Attendance() {
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [currentChildIndex, setCurrentChildIndex] = useState(0);
  const [tab, setTab] = useState<"card" | "list">("card");
  const childrenData = useQuery(api.children.getChildren);
  const attendancesByDate = useQuery(api.attendance.getAttendanceByDate, {
    date: attendanceDate,
  });
  const [attendanceData, setAttendanceData] = useState<
    { childId: Id<"children">; status?: "present" | "absent" }[]
  >([]);
  const [isFirstAttendance, setIsFirstAttendance] = useState(true);

  useEffect(() => {
    if (attendancesByDate === undefined) return;
    if (attendancesByDate.length !== 0) {
      setAttendanceData(
        attendancesByDate.map((attendance) => ({
          childId: attendance.childId,
          status: attendance.status,
        })),
      );
      setIsFirstAttendance(false);
      setTab("list");
    }
  }, [attendancesByDate]);
  const recordAttendance = useMutation(api.attendance.recordAttendance);

  const recordAttendanceHandler = async () => {
    await recordAttendance({ attendanceData, date: attendanceDate });
  };

  if (childrenData === undefined) return <div>Loading...</div>;

  const saveAttendance = (status: "present" | "absent") => {
    setAttendanceData([
      ...attendanceData,
      { childId: childrenData[currentChildIndex]._id, status },
    ]);
    if (currentChildIndex !== childrenData.length - 1) {
      setCurrentChildIndex(currentChildIndex + 1);
    }
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
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => setTab("card")}
              style={{
                border: tab === "card" ? "2px solid grey" : "none",
              }}
            >
              Card
            </button>
            <button
              onClick={() => setTab("list")}
              style={{
                border: tab === "list" ? "2px solid grey" : "none",
              }}
            >
              List
            </button>
          </div>
          {tab === "card" ? (
            <CardAttendance
              currentChild={childrenData[currentChildIndex]}
              childrenData={childrenData}
              attendanceData={attendanceData}
              saveAttendance={saveAttendance}
              isFirstAttendance={isFirstAttendance}
              recordAttendanceHandler={recordAttendanceHandler}
            />
          ) : (
            <ListAttendance
              childrenData={childrenData}
              attendanceData={attendanceData}
              saveAttendance={saveAttendance}
              isFirstAttendance={isFirstAttendance}
              recordAttendanceHandler={recordAttendanceHandler}
            />
          )}
        </div>
      </main>
      <footer>
        <Link href="/attendance">Attendance</Link>
      </footer>
    </>
  );
}

function CardAttendance({
  currentChild,
  childrenData,
  attendanceData,
  saveAttendance,
  isFirstAttendance,
  recordAttendanceHandler,
}: {
  currentChild: {
    _id: Id<"children">;
    _creationTime: number;
    fullName: string;
    gender: "male" | "female";
    avatar: string;
  };
  childrenData: {
    _id: Id<"children">;
    _creationTime: number;
    fullName: string;
    gender: "male" | "female";
    avatar: string;
  }[];
  attendanceData: {
    childId: Id<"children">;
    status?: "present" | "absent";
  }[];
  saveAttendance: (status: "present" | "absent") => void;
  isFirstAttendance: boolean;
  recordAttendanceHandler: () => void;
}) {
  return (
    <>
      {
        <div
          key={currentChild._id}
          style={{
            display: "grid",
            gap: "2rem",
            padding: "4rem",
            marginBlock: "2rem",
            border: "2px solid grey",
            placeItems: "center",
            // textAlign: "center",
          }}
        >
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
              src={currentChild.avatar}
              alt={currentChild.fullName}
            />
          </div>
          <p>{currentChild.fullName}</p>
          <p>{currentChild.gender}</p>
        </div>
      }

      <button
        onClick={() => saveAttendance("absent")}
        style={{
          backgroundColor:
            attendanceData.find((att) => att.childId === currentChild._id)
              ?.status === "absent"
              ? "red"
              : "",
        }}
      >
        Absent
      </button>
      <button
        onClick={() => saveAttendance("present")}
        style={{
          backgroundColor:
            attendanceData.find((att) => att.childId === currentChild._id)
              ?.status === "present"
              ? "lime"
              : "",
        }}
      >
        Present
      </button>
      <button
        onClick={recordAttendanceHandler}
        disabled={attendanceData.length !== childrenData.length}
        className="primary-button"
        style={{
          display:
            attendanceData.length === childrenData.length ? "block" : "none",
        }}
      >
        {isFirstAttendance ? "Save" : "Update"}
      </button>
    </>
  );
}

function ListAttendance({
  childrenData,
  attendanceData,
  saveAttendance,
  isFirstAttendance,
  recordAttendanceHandler,
}: {
  childrenData: {
    _id: Id<"children">;
    _creationTime: number;
    fullName: string;
    gender: "male" | "female";
    avatar: string;
  }[];
  attendanceData: {
    childId: Id<"children">;
    status?: "present" | "absent";
  }[];
  saveAttendance: (status: "present" | "absent") => void;
  isFirstAttendance: boolean;
  recordAttendanceHandler: () => void;
}) {
  return (
    <>
      {childrenData.map((child) => (
        <div
          key={child._id}
          style={{ display: "flex", justifyContent: "space-between" }}
        >
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
          <button
            onClick={() => saveAttendance("absent")}
            style={{
              backgroundColor:
                attendanceData.find((att) => att.childId === child._id)
                  ?.status === "absent"
                  ? "red"
                  : "",
            }}
          >
            Absent
          </button>
          <button
            onClick={() => saveAttendance("present")}
            style={{
              backgroundColor:
                attendanceData.find((att) => att.childId === child._id)
                  ?.status === "present"
                  ? "lime"
                  : "",
            }}
          >
            Present
          </button>
          <button
            onClick={recordAttendanceHandler}
            disabled={attendanceData.length !== childrenData.length}
            className="primary-button"
            style={{
              display:
                attendanceData.length === childrenData.length
                  ? "block"
                  : "none",
            }}
          >
            {isFirstAttendance ? "Save" : "Update"}
          </button>
        </div>
      ))}
    </>
  );
}
