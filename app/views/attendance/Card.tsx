import { Doc, Id } from "@/convex/_generated/dataModel";

export default function AttendanceCard({
  currentChild,
  childrenData,
  attendanceData,
  saveAttendance,
  isFirstAttendance,
  recordAttendanceHandler,
}: {
  currentChild: Doc<"children">;
  childrenData: Doc<"children">[];
  attendanceData: {
    childId: Id<"children">;
    status: Doc<"attendance">["status"];
  }[];
  saveAttendance: (status: Doc<"attendance">["status"]) => void;
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
