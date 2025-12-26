"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useEffect, useState, useRef } from "react";
import AttendanceCard from "../views/attendance/Card";
import AttendanceList from "../views/attendance/List";
import { TStatus } from "@/convex/types/attendance";
import GlassHeader from "@/components/GlassHeader";
import { SelectDate } from "../views/register/Calendar";
import { GregorianCalendar, toCalendar, parseDate, EthiopicCalendar } from "@internationalized/date";
import { todayInEth } from "@/utils/calendar";
import AttendanceTabs from "../views/attendance/AttendanceTabs";
import DateNavigator from "../views/attendance/DateNavigator";
import PreviewView from "../views/attendance/PreviewView";
import SummaryView from "../views/attendance/SummaryView";
import WarningDialog from "../views/attendance/WarningDialog";

export type TViewTab = "daily" | "weekly" | "monthly";

export default function Attendance() {
  const [attendanceDate, setAttendanceDate] = useState(todayInEth.toString());
  const [currentChildIndex, setCurrentChildIndex] = useState(0);
  const [view, setView] = useState<"card" | "list" | "preview">("card");
  const [viewTab, setViewTab] = useState<TViewTab>("daily");
  const [pendingDate, setPendingDate] = useState<string | null>(null);
  const warningDialogRef = useRef<HTMLDialogElement>(null);

  const childrenData = useQuery(api.children.getChildrenWithPrimaryGuardian);
  const attendancesByDate = useQuery(api.attendance.getAttendanceByDate, {
    date: attendanceDate,
  });

  const [attendanceData, setAttendanceData] = useState<{ childId: Id<"children">; status: TStatus }[]>([]);

  // Calculate date range for weekly/monthly views
  const getDateRange = () => {
    const current = parseDate(attendanceDate);
    const ethDate = toCalendar(current, new EthiopicCalendar());

    if (viewTab === "weekly") {
      // Ethiopian week aligns with Gregorian (0=Sunday, 1=Monday, etc.)
      const dayOfWeek = ethDate.toDate("UTC").getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const mondayEth = ethDate.subtract({ days: daysToMonday });
      const fridayEth = mondayEth.add({ days: 4 });

      return {
        startDate: toCalendar(mondayEth, new GregorianCalendar()).toString(),
        endDate: toCalendar(fridayEth, new GregorianCalendar()).toString()
      };
    } else if (viewTab === "monthly") {
      const startOfMonthEth = ethDate.set({ day: 1 });
      const daysInMonth = ethDate.calendar.getDaysInMonth(ethDate);
      const endOfMonthEth = ethDate.set({ day: daysInMonth });

      return {
        startDate: toCalendar(startOfMonthEth, new GregorianCalendar()).toString(),
        endDate: toCalendar(endOfMonthEth, new GregorianCalendar()).toString()
      };
    }
    return { startDate: attendanceDate, endDate: attendanceDate };
  };

  const { startDate, endDate } = getDateRange();
  const attendancesByRange = useQuery(api.attendance.getAttendanceByDateRange, {
    startDate,
    endDate,
  });

  useEffect(() => {
    if (attendancesByDate === undefined) return;
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
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const selectedDate = new Date(attendanceDate);
      selectedDate.setHours(0, 0, 0, 0);
      const isToday = selectedDate.getTime() === today.getTime();
      const isYesterday = selectedDate.getTime() === yesterday.getTime();

      if (isToday || isYesterday) {
        setView("card");
      } else {
        setView("list");
      }
    }
  }, [attendancesByDate, attendanceDate]);

  const recordAttendance = useMutation(api.attendance.recordAttendance);

  const handleDateChange = (newDate: string) => {
    if (view === "card" && attendanceData.length > 0 && (childrenData && attendanceData.length < childrenData.length)) {
      setPendingDate(newDate);
      warningDialogRef.current?.showModal();
    } else {
      setAttendanceDate(newDate);
    }
  };

  const confirmDateChange = () => {
    if (pendingDate) {
      setAttendanceData([]);
      setCurrentChildIndex(0);
      setAttendanceDate(pendingDate);
      setPendingDate(null);
    }
    warningDialogRef.current?.close();
  };

  const cancelDateChange = () => {
    setPendingDate(null);
    warningDialogRef.current?.close();
  };

  const recordAttendanceHandler = async () => {
    await recordAttendance({ attendanceData, date: attendanceDate });
    setView("list");
  };

  const saveAttendance = (status: TStatus) => {
    if (!childrenData) return;
    const currentChildId = childrenData[currentChildIndex]._id;
    const existingIndex = attendanceData.findIndex((att) => att.childId === currentChildId);

    let newAttendanceData;
    if (existingIndex !== -1) {
      newAttendanceData = [...attendanceData];
      newAttendanceData[existingIndex] = { childId: currentChildId, status };
      setAttendanceData(newAttendanceData);
    } else {
      newAttendanceData = [...attendanceData, { childId: currentChildId, status }];
      setAttendanceData(newAttendanceData);
      if (currentChildIndex === childrenData.length - 1) {
        setTimeout(() => setView("preview"), 300);
      } else {
        setCurrentChildIndex(currentChildIndex + 1);
      }
    }
  };

  const renderContent = () => {
    if (childrenData === undefined || attendancesByDate === undefined) {
      return <div style={{ textAlign: "center", padding: "2rem" }}>Loading Attendance...</div>;
    }

    switch (view) {
      case "card":
        return (
          <AttendanceCard
            currentChild={childrenData[currentChildIndex]}
            childrenData={childrenData}
            attendanceData={attendanceData}
            saveAttendance={saveAttendance}
            currentChildIndex={currentChildIndex}
            setCurrentChildIndex={setCurrentChildIndex}
          />
        );
      case "list":
        return viewTab === "daily" ? (
          <AttendanceList
            childrenData={childrenData}
            attendancesByDate={attendancesByDate}
            attendanceDate={attendanceDate}
          />
        ) : (
          <SummaryView
            childrenData={childrenData}
            attendancesByRange={attendancesByRange}
            viewTab={viewTab}
            startDate={startDate}
            endDate={endDate}
            attendanceDate={attendanceDate}
          />
        );
      case "preview":
        return (
          <PreviewView
            childrenData={childrenData}
            attendanceData={attendanceData}
            setAttendanceData={setAttendanceData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <GlassHeader
        title="አቴንዳንስ"
        backHref="/"
        action={
          <div className="glass-pill">
            <SelectDate value={attendanceDate} onSelect={(dateInEt) => handleDateChange(toCalendar(dateInEt, new GregorianCalendar()).toString())} />
          </div>
        }
      />
      <main style={{ justifyContent: view !== "card" ? "start" : "center" }}>
        <div style={{ display: "grid", gap: "1rem", width: "100%", maxWidth: "600px", paddingInline: "0.5rem", boxSizing: "border-box" }}>
          <AttendanceTabs viewTab={viewTab} setViewTab={setViewTab} view={view} />
          <DateNavigator
            attendanceDate={attendanceDate}
            viewTab={viewTab}
            handleDateChange={handleDateChange}
            startDate={startDate}
            endDate={endDate}
          />
          {renderContent()}
        </div>
      </main>

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

      <WarningDialog
        dialogRef={warningDialogRef}
        confirmDateChange={confirmDateChange}
        cancelDateChange={cancelDateChange}
      />
    </>
  );
}
