"use client";

import { useAction, useConvexAuth, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
// import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";
import Link from "next/link";

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
      <footer>
        <Link href="/attendance">Attendance</Link>
      </footer>
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
    <div>
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
        <button className="primary-button" type="submit">
          Add Child
        </button>
      </form>
    </div>
  );
}
