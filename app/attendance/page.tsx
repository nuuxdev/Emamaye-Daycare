"use client";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Fragment, JSX, useEffect, useState, useRef } from "react";
import AttendanceCard from "../views/attendance/Card";
import AttendanceList from "../views/attendance/List";
import { TStatus } from "@/convex/types/attendance";
import GlassHeader from "@/components/GlassHeader";
import { SelectDate } from "../views/register/Calendar";
import { GregorianCalendar, toCalendar, parseDate } from "@internationalized/date";
import { todayInEth, formatEthiopianDate } from "@/utils/calendar";
import { ChevronLeft, ChevronRight } from "@/components/Icons";

type TViewTab = "daily" | "weekly" | "monthly";

export default function Attendance() {
  const [attendanceDate, setAttendanceDate] = useState(
    todayInEth.toString()
  );
  const [currentChildIndex, setCurrentChildIndex] = useState(0);
  const [view, setView] = useState<"card" | "list" | "preview">("card");
  const [viewTab, setViewTab] = useState<TViewTab>("daily");
  const [pendingDate, setPendingDate] = useState<string | null>(null);
  const warningDialogRef = useRef<HTMLDialogElement>(null);

  // Navigation helper functions
  // const navigateDate = (direction: "prev" | "next") => {
  //   const currentDate = parseDate(attendanceDate);
  //   let newDate;

  //   if (viewTab === "daily") {
  //     newDate = direction === "prev"
  //       ? currentDate.subtract({ days: 1 })
  //       : currentDate.add({ days: 1 });
  //   } else if (viewTab === "weekly") {
  //     newDate = direction === "prev"
  //       ? currentDate.subtract({ weeks: 1 })
  //       : currentDate.add({ weeks: 1 });
  //   } else {
  //     newDate = direction === "prev"
  //       ? currentDate.subtract({ months: 1 })
  //       : currentDate.add({ months: 1 });
  //   }

  //   setAttendanceDate(newDate.toString());
  // };

  // Handle date change with warning if attendance is partially recorded
  const handleDateChange = (newDate: string) => {
    if (view === "card" && attendanceData.length > 0 && attendanceData.length < (childrenData?.length || 0)) {
      // Partial attendance recorded, show warning
      setPendingDate(newDate);
      warningDialogRef.current?.showModal();
    } else {
      setAttendanceDate(newDate);
    }
  };

  const confirmDateChange = () => {
    if (pendingDate) {
      // Rollback attendance data
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

  const childrenData = useQuery(api.children.getChildrenWithPrimaryGuardian);
  const attendancesByDate = useQuery(api.attendance.getAttendanceByDate, {
    date: attendanceDate,
  });

  // Calculate date range for weekly/monthly views
  const getDateRange = () => {
    const current = parseDate(attendanceDate);
    if (viewTab === "weekly") {
      // Get Monday of current week and Friday
      const dayOfWeek = current.toDate("UTC").getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const monday = current.subtract({ days: daysToMonday });
      const friday = monday.add({ days: 4 });
      return { startDate: monday.toString(), endDate: friday.toString() };
    } else if (viewTab === "monthly") {
      // Get first and last day of month
      const startOfMonth = current.set({ day: 1 });
      const daysInMonth = current.calendar.getDaysInMonth(current);
      const endOfMonth = current.set({ day: daysInMonth });
      return { startDate: startOfMonth.toString(), endDate: endOfMonth.toString() };
    }
    return { startDate: attendanceDate, endDate: attendanceDate };
  };

  const { startDate, endDate } = getDateRange();
  const attendancesByRange = useQuery(api.attendance.getAttendanceByDateRange, {
    startDate,
    endDate,
  });

  const [attendanceData, setAttendanceData] = useState<
    { childId: Id<"children">; status: TStatus }[]
  >([]);;

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

      // Check if date is today or yesterday
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
        // For other dates without records, stay in list view (will be empty)
        setView("list");
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

  const PreviewView = () => {
    const toggleAttendance = (childId: Id<"children">) => {
      const existingIndex = attendanceData.findIndex(
        (att) => att.childId === childId
      );

      if (existingIndex !== -1) {
        const newAttendanceData = [...attendanceData];
        const currentStatus = newAttendanceData[existingIndex].status;
        newAttendanceData[existingIndex].status =
          currentStatus === "present" ? "absent" : "present";
        setAttendanceData(newAttendanceData);
      }
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%", paddingBottom: "5rem" }}>
        <h3 style={{ textAlign: "center" }}>Review Attendance</h3>
        {childrenData.map((child, index) => {
          const status = attendanceData.find((att) => att.childId === child._id)?.status;
          return (
            <Fragment key={child._id}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0" }}>
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
                <button
                  onClick={() => toggleAttendance(child._id)}
                  className="secondary"
                  style={{
                    backgroundColor: status === "present" ? "var(--success-color)" : "var(--error-color)",
                    color: "white",
                    textTransform: "capitalize",
                    minWidth: "5rem",
                  }}
                >
                  {status}
                </button>
              </div>
              {index < childrenData.length - 1 && <hr />}
            </Fragment>
          );
        })}
      </div>
    );
  };

  // Calculate attendance counts for weekly/monthly views
  const getAttendanceCount = (childId: Id<"children">) => {
    if (!attendancesByRange) return { present: 0, total: 0 };
    const childAttendance = attendancesByRange.filter((att) => att.childId === childId);
    const presentCount = childAttendance.filter((att) => att.status === "present").length;

    if (viewTab === "weekly") {
      return { present: presentCount, total: 5 }; // 5 weekdays
    } else {
      // Count weekdays in the month
      const start = parseDate(startDate);
      const end = parseDate(endDate);
      let weekdays = 0;
      let current = start;
      while (current.compare(end) <= 0) {
        const day = current.toDate("UTC").getDay();
        if (day !== 0 && day !== 6) weekdays++;
        current = current.add({ days: 1 });
      }
      return { present: presentCount, total: weekdays };
    }
  };

  // Weekly/Monthly attendance summary view
  const AttendanceSummaryView = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
      {childrenData?.map((child, index) => {
        const { present, total } = getAttendanceCount(child._id);
        return (
          <Fragment key={child._id}>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0" }}>
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
                <h4 style={{ margin: 0, fontSize: "inherit", textTransform: "capitalize" }}>{child.fullName}</h4>
              </div>
              <span
                style={{
                  padding: "0.4rem 0.6rem",
                  borderRadius: "100vw",
                  minWidth: "4.5rem",
                  textAlign: "center",
                  backgroundColor: present === total ? "var(--success-color)" : present === 0 ? "var(--error-color)" : "var(--info-color)",
                  color: "white",
                  fontWeight: "600",
                }}
              >
                {present}/{total}
              </span>
            </div>
            {index < (childrenData?.length ?? 0) - 1 && <hr />}
          </Fragment>
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
    list: viewTab === "daily" ? (
      <AttendanceList
        childrenData={childrenData}
        attendancesByDate={attendancesByDate}
        attendanceDate={attendanceDate}
      />
    ) : (
      <AttendanceSummaryView />
    ),
    preview: <PreviewView />,
  };

  // Format date display based on view tab
  const getDateDisplayString = () => {
    if (viewTab === "daily") {
      return formatEthiopianDate(attendanceDate);
    } else if (viewTab === "weekly") {
      // Show only day and month, no year
      const formatShort = (dateStr: string) => {
        const ethDate = formatEthiopianDate(dateStr);
        const parts = ethDate.split(" ");
        return `${parts[0]} ${parts[1].replace(",", "")}`; // e.g., "ታህሳስ 25"
      };
      return `${formatShort(startDate)} - ${formatShort(endDate)}`;
    } else {
      // Monthly - show month and year only
      const ethDate = formatEthiopianDate(startDate);
      const parts = ethDate.split(" ");
      return `${parts[0]} ${parts[2]}`; // e.g., "ታህሳስ 2017"
    }
  };

  return (
    <>
      <GlassHeader
        title="Attendance"
        backHref="/"
        action={
          <div className="glass-pill">
            <SelectDate value={attendanceDate} onSelect={(dateInEt) => handleDateChange(toCalendar(dateInEt, new GregorianCalendar()).toString())} />
          </div>
        }
      />
      <main style={{ justifyContent: view !== "card" ? "start" : "center" }}>
        <div style={{ display: "grid", gap: "1rem", width: "100%", maxWidth: "600px", paddingInline: "0.5rem", boxSizing: "border-box" }}>
          {/* View Tabs - hide on card view */}
          {view !== "card" && (
            <div style={{ display: "flex", width: "100%", overflowX: "auto" }}>
              {(["daily", "weekly", "monthly"] as TViewTab[]).map((tab) => (
                <button
                  key={tab}
                  disabled={viewTab === tab}
                  onClick={() => setViewTab(tab)}
                  className="tabs secondary"
                  style={{ textTransform: "capitalize", flexGrow: 1 }}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          {/* Date Navigation */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
            <button
              onClick={() => {
                const currentDate = parseDate(attendanceDate);
                let newDate;
                if (viewTab === "daily") {
                  newDate = currentDate.subtract({ days: 1 });
                } else if (viewTab === "weekly") {
                  newDate = currentDate.subtract({ weeks: 1 });
                } else {
                  newDate = currentDate.subtract({ months: 1 });
                }
                handleDateChange(newDate.toString());
              }}
              className="glass-pill"
              style={{ padding: "0.5rem", cursor: "pointer" }}
            >
              <ChevronLeft />
            </button>
            <h3 style={{ textAlign: "center", margin: 0, fontSize: viewTab !== "daily" ? "1rem" : undefined }}>
              {getDateDisplayString()}
            </h3>
            <button
              onClick={() => {
                const currentDate = parseDate(attendanceDate);
                let newDate;
                if (viewTab === "daily") {
                  newDate = currentDate.add({ days: 1 });
                } else if (viewTab === "weekly") {
                  newDate = currentDate.add({ weeks: 1 });
                } else {
                  newDate = currentDate.add({ months: 1 });
                }
                handleDateChange(newDate.toString());
              }}
              className="glass-pill"
              style={{ padding: "0.5rem", cursor: "pointer" }}
              disabled={(() => {
                const currentDate = parseDate(attendanceDate);
                const today = todayInEth;
                if (viewTab === "daily") {
                  return currentDate.compare(today) >= 0;
                } else if (viewTab === "weekly") {
                  // Disable if we're already in the current week
                  const dayOfWeek = today.toDate("UTC").getDay();
                  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                  const thisMonday = today.subtract({ days: daysToMonday });
                  const currentMonday = (() => {
                    const dow = currentDate.toDate("UTC").getDay();
                    const dtm = dow === 0 ? 6 : dow - 1;
                    return currentDate.subtract({ days: dtm });
                  })();
                  return currentMonday.compare(thisMonday) >= 0;
                } else {
                  // Disable if we're already in the current month or future
                  // Compare year first, then month
                  if (currentDate.year > today.year) return true;
                  if (currentDate.year === today.year && currentDate.month >= today.month) return true;
                  return false;
                }
              })()}
            >
              <ChevronRight />
            </button>
          </div>

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

      {/* Warning Dialog for Date Change */}
      <dialog ref={warningDialogRef} style={{ borderRadius: "16px", padding: "1.5rem", maxWidth: "90%", width: "320px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", textAlign: "center" }}>
          <h3 style={{ margin: 0 }}>⚠️ ማስጠንቀቂያ</h3>
          <p style={{ margin: 0, lineHeight: 1.6 }}>
            የተገቢው የተማሪዎች ቅፅ ያልተጠናቀቀ ነው። ቀኑን ከቀየሩ የተቀዳው መረጃ ይሰረዛል።
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={cancelDateChange}
              className="secondary"
              style={{ flex: 1 }}
            >
              ተመለስ
            </button>
            <button
              onClick={confirmDateChange}
              className="secondary"
              style={{ flex: 1, color: "var(--error-color)" }}
            >
              ቀይር
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

