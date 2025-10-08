"use client";

import { useAction, useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
// import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";

export default function Home() {
  return (
    <>
      <header>
        Emamaye Daycare Pro
        <SignOutButton />
      </header>
      <main>
        <h1>Emamaye Daycare Pro</h1>
        <Content />
      </main>
    </>
  );
}

function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  return (
    <>
      {isAuthenticated && (
        <button
          onClick={() =>
            void signOut().then(() => {
              router.push("/signin");
            })
          }
        >
          Sign out
        </button>
      )}
    </>
  );
}

function Content() {
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const children = useQuery(api.children.getChildren);
  const attendancesByDate = useQuery(api.attendance.getAttendanceByDate, {
    date: attendanceDate,
  });
  const addChild = useMutation(api.children.addChild);
  const uploadImage = useAction(api.images.uploadImage);
  const recordAttendance = useMutation(api.attendance.recordAttendance);

  if (attendancesByDate === undefined || children === undefined)
    return <div>Loading...</div>;
  const addChildHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName");
    const gender = formData.get("gender");
    const avatarImg = formData.get("avatar") as File;

    const avatarArrayBuffer = await avatarImg.arrayBuffer();

    const storageId = await uploadImage({
      imageArrayBuffer: avatarArrayBuffer,
    });

    const childId = await addChild({
      fullName: fullName as string,
      gender: gender as "male" | "female",
      avatar: storageId as Id<"_storage">,
    });
  };

  const recordAttendanceHandler = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const attendanceRecord = formData.getAll("attendance") as Id<"children">[];
    await recordAttendance({ attendanceRecord, date: attendanceDate });
  };

  return (
    <div>
      <form
        onSubmit={recordAttendanceHandler}
        style={{ display: "grid", gap: "1rem" }}
      >
        <h2>Children List</h2>
        <input
          type="date"
          value={attendanceDate}
          onChange={(e) => setAttendanceDate(e.target.value)}
          max={new Date().toISOString().slice(0, 10)}
        />
        {children.map((child) => (
          <div key={child._id} style={{ display: "flex", gap: "1rem" }}>
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
            <p>{child.gender}</p>
            <input
              type="checkbox"
              name="attendance"
              value={child._id}
              defaultChecked={attendancesByDate.some(
                (attendance) => attendance.childId === child._id,
              )}
              disabled={
                attendanceDate !== new Date().toISOString().slice(0, 10)
              }
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={attendanceDate !== new Date().toISOString().slice(0, 10)}
        >
          Record Attendance
        </button>
      </form>
      <form onSubmit={addChildHandler} style={{ display: "grid", gap: "1rem" }}>
        <h2>Add Child</h2>
        <input
          className="border-2"
          type="text"
          name="fullName"
          placeholder="full name"
        />
        <fieldset>
          <legend>Gender</legend>
          <input type="radio" name="gender" id="male" value="male" />
          <label htmlFor="male">Male</label>
          <input type="radio" name="gender" id="female" value="female" />
          <label htmlFor="female">Female</label>
        </fieldset>
        <input
          className="border-2"
          type="file"
          name="avatar"
          id="avatar"
          accept="image/*"
        />
        <button className="border-2" type="submit">
          Add Child
        </button>
      </form>
    </div>
  );
}
