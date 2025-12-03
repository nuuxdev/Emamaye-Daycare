import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { TStatus } from "@/convex/types/attendance";
import { useMutation } from "convex/react";
import { Fragment } from "react";

export default function AttendanceList({
  childrenData,
  attendancesByDate,
}: {
  childrenData: Doc<"children">[];
  attendancesByDate: Doc<"attendance">[];
}) {
  const updateSingleAttendance = useMutation(
    api.attendance.updateSingleAttendance,
  );

  const toggleAttendance = (childId: Id<"children">) => {
    const attendanceRecord = attendancesByDate.find(
      (att) => att.childId === childId,
    );
    if (!attendanceRecord) return;

    const newStatus: TStatus =
      attendanceRecord.status === "present" ? "absent" : "present";
    updateSingleAttendance({ attendanceId: attendanceRecord._id, status: newStatus });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
      {childrenData.map((child, index) => {
        const attendanceRecord = attendancesByDate.find((att) => att.childId === child._id);
        const status = attendanceRecord?.status;
        const isExpired = !attendanceRecord; // No record means expired

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
                disabled={isExpired}
                className="secondary"
                style={{
                  backgroundColor: isExpired
                    ? "transparent"
                    : status === "present"
                      ? "var(--success-color)"
                      : "var(--error-color)",
                  color: isExpired ? "var(--foreground)" : "white",
                  textTransform: "capitalize",
                  minWidth: "5rem",
                  opacity: isExpired ? 0.5 : 1,
                  cursor: isExpired ? "not-allowed" : "pointer",
                }}
              >
                {isExpired ? "Expired" : status}
              </button>
            </div>
            {index < childrenData.length - 1 && <hr />}
          </Fragment>
        );
      })}
    </div>
  );
}
