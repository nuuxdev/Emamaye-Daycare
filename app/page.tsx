"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
// import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

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
  const children = useQuery(api.children.getChildren);
  const addChild = useMutation(api.children.addChild);
  const generateUploadUrl = useMutation(api.images.generateUploadUrl);

  const addChildHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const fullName = formData.get("fullName");
    const gender = formData.get("gender");
    const avatarImg = formData.get("avatar") as File;

    // Step 1: Get a short-lived upload URL
    const postUrl = await generateUploadUrl();
    // Step 2: POST the file to the URL
    const avatarUrl = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": avatarImg!.type },
      body: avatarImg,
    });
    const { storageId } = await avatarUrl.json();
    // Step 3: Save the newly allocated storage id to the database
    const avatar = storageId;
    const childId = await addChild({
      fullName: fullName as string,
      gender: gender as "male" | "female",
      avatar: avatar as Id<"_storage">,
    });

    console.log(childId);
  };

  return (
    <div>
      <div style={{ display: "grid", gap: "1rem" }}>
        <h2>Children List</h2>
        {children?.map((child) => (
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
          </div>
        ))}
      </div>
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
          <input type="radio" name="gender" id="male" />
          <label htmlFor="male">Male</label>
          <input type="radio" name="gender" id="female" />
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
