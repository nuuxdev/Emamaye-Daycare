import { Fragment } from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { TStatus } from "@/convex/types/attendance";

export default function PreviewView({
    childrenData,
    attendanceData,
    setAttendanceData,
}: {
    childrenData: Doc<"children">[];
    attendanceData: { childId: Id<"children">; status: TStatus }[];
    setAttendanceData: (data: { childId: Id<"children">; status: TStatus }[]) => void;
}) {
    const toggleAttendance = (childId: Id<"children">) => {
        const existingIndex = attendanceData.findIndex((att) => att.childId === childId);
        if (existingIndex !== -1) {
            const newAttendanceData = [...attendanceData];
            const currentStatus = newAttendanceData[existingIndex].status;
            newAttendanceData[existingIndex].status = currentStatus === "present" ? "absent" : "present";
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
}
