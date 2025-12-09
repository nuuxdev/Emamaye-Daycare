import { InfantIcon, PreschoolerIcon, ToddlerIcon } from "@/components/Icons";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { TStatus } from "@/convex/types/attendance";
import { TAgeGroup } from "@/convex/types/children";
import { JSX } from "react";

const ageGroupIcons: Record<TAgeGroup, JSX.Element> = {
  infant: <InfantIcon />,
  toddler: <ToddlerIcon />,
  preschooler: <PreschoolerIcon />,
};

export default function AttendanceCard({
  currentChild,
  childrenData,
  attendanceData,
  saveAttendance,
  currentChildIndex,
  setCurrentChildIndex,
}: {
  currentChild: Doc<"children">;
  childrenData: Doc<"children">[];
  attendanceData: {
    childId: Id<"children">;
    status: TStatus;
  }[];
  saveAttendance: (status: TStatus) => void;
  currentChildIndex: number;
  setCurrentChildIndex: (index: number) => void;
}) {
  const currentStatus = attendanceData.find(
    (att) => att.childId === currentChild._id
  )?.status;

  const previousChild = currentChildIndex > 0 ? childrenData[currentChildIndex - 1] : null;
  const nextChild = currentChildIndex < childrenData.length - 1 ? childrenData[currentChildIndex + 1] : null;

  const isCurrentFilled = currentStatus !== undefined;
  const canGoNext = isCurrentFilled && nextChild !== null;

  const goToPrevious = () => {
    if (previousChild) {
      setCurrentChildIndex(currentChildIndex - 1);
    }
  };

  const goToNext = () => {
    if (canGoNext && nextChild) {
      setCurrentChildIndex(currentChildIndex + 1);
    }
  };

  return (
    <div className="neo-box" style={{ gap: "1.5rem" }}>
      {/* Counter */}
      <p style={{ opacity: 0.7, margin: 0 }}>
        Child {currentChildIndex + 1} of {childrenData.length}
      </p>

      {/* Avatar Navigation */}
      <div style={{ display: "flex", gap: "1rem", alignItems: "center", justifyContent: "center" }}>
        {/* Previous Child Avatar */}
        <div
          onClick={goToPrevious}
          style={{
            width: "4rem",
            height: "4rem",
            borderRadius: "50%",
            overflow: "hidden",
            opacity: previousChild ? 0.5 : 0.2,
            cursor: previousChild ? "pointer" : "not-allowed",
            transition: "opacity 0.2s",
          }}
        >
          {previousChild ? (
            <img
              src={previousChild.avatar}
              alt={previousChild.fullName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "#ccc" }} />
          )}
        </div>

        {/* Current Child Avatar */}
        <div style={{ position: "relative", width: "8rem", height: "8rem" }}>
          <img
            src={currentChild.avatar}
            alt={currentChild.fullName}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "50%",
            }}
          />
          <span
            className={currentChild.ageGroup}
            style={{
              position: "absolute",
              bottom: "0",
              right: "-0.5rem",
              width: "2.5rem",
              height: "2.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "100vw",
            }}
          >
            {ageGroupIcons[currentChild.ageGroup]}
          </span>
        </div>

        {/* Next Child Avatar */}
        <div
          onClick={goToNext}
          style={{
            width: "4rem",
            height: "4rem",
            borderRadius: "50%",
            overflow: "hidden",
            opacity: canGoNext ? 0.5 : 0.2,
            cursor: canGoNext ? "pointer" : "not-allowed",
            transition: "opacity 0.2s",
          }}
        >
          {nextChild ? (
            <img
              src={nextChild.avatar}
              alt={nextChild.fullName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div style={{ width: "100%", height: "100%", background: "#ccc" }} />
          )}
        </div>
      </div>

      <h3 style={{ margin: 0 }}>{currentChild.fullName}</h3>

      {/* Attendance Buttons */}
      <div style={{ display: "flex", gap: "1rem", width: "100%" }}>
        <button
          onClick={() => saveAttendance("absent")}
          className="secondary"
          style={{
            flex: 1,
            backgroundColor: currentStatus === "absent" ? "var(--error-color)" : "",
            color: currentStatus === "absent" ? "white" : "var(--error-color)",
          }}
        >
          Absent
        </button>
        <button
          onClick={() => saveAttendance("present")}
          className="secondary"
          style={{
            flex: 1,
            backgroundColor: currentStatus === "present" ? "var(--success-color)" : "",
            color: currentStatus === "present" ? "white" : "var(--success-color)",
          }}
        >
          Present
        </button>
      </div>
    </div>
  );
}
