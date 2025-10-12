"use client";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useAction, useMutation } from "convex/react";
import Link from "next/link";

export default function Register() {
  const addChild = useMutation(api.children.addChild);
  const uploadImage = useAction(api.images.uploadImage);

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

    await addChild({
      fullName: fullName as string,
      gender: gender as "male" | "female",
      avatar: storageId as Id<"_storage">,
    });
  };
  return (
    <>
      <header>
        <Link href="/">&lt;-</Link>
        Register
      </header>
      <main>
        <h1>Register</h1>

        <div>
          <form
            onSubmit={addChildHandler}
            style={{ display: "grid", gap: "1rem" }}
          >
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
            <button className="primary-button" type="submit">
              Add Child
            </button>
          </form>
        </div>
      </main>
      <footer>
        <Link href="/attendance">Attendance</Link>
        <Link href="/register">Register</Link>
      </footer>
    </>
  );
}
