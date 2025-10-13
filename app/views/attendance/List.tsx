import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";

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

  const handleUpdateSingleAttendance = (
    childId: Id<"children">,
    status: "present" | "absent",
  ) => {
    const attendanceRecord = attendancesByDate.find(
      (att) => att.childId === childId,
    );
    if (attendanceRecord === undefined || attendanceRecord.status === status)
      return;
    updateSingleAttendance({ attendanceId: attendanceRecord._id, status });
  };
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
            onClick={() => handleUpdateSingleAttendance(child._id, "absent")}
            style={{
              backgroundColor:
                attendancesByDate.find((att) => att.childId === child._id)
                  ?.status === "absent"
                  ? "red"
                  : "",
            }}
          >
            Absent
          </button>
          <button
            onClick={() => handleUpdateSingleAttendance(child._id, "present")}
            style={{
              backgroundColor:
                attendancesByDate.find((att) => att.childId === child._id)
                  ?.status === "present"
                  ? "lime"
                  : "",
            }}
          >
            Present
          </button>
        </div>
      ))}
    </>
  );
}
