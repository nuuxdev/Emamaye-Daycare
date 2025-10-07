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
      <header className="sticky top-0 z-10 bg-background p-4 border-b-2 border-slate-200 dark:border-slate-800 flex flex-row justify-between items-center">
        Emamaye Daycare Pro
        <SignOutButton />
      </header>
      <main className="p-8 flex flex-col gap-8">
        <h1 className="text-4xl font-bold text-center">Emamaye Daycare Pro</h1>
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
          className="bg-slate-200 dark:bg-slate-800 text-foreground rounded-md px-2 py-1"
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
  const { viewer, numbers } =
    useQuery(api.myFunctions.listNumbers, {
      count: 10,
    }) ?? {};

  const children = useQuery(api.children.getChildren);
  const addNumber = useMutation(api.myFunctions.addNumber);
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

  if (viewer === undefined || numbers === undefined) {
    return (
      <div className="mx-auto">
        <p>loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 max-w-lg mx-auto">
      <p>Welcome {viewer ?? "Anonymous"}!</p>
      <p>
        <button
          className="bg-foreground text-background text-sm px-4 py-2 rounded-md"
          onClick={() => {
            void addNumber({ value: Math.floor(Math.random() * 10) });
          }}
        >
          Add a random number
        </button>
      </p>
      <p>
        Numbers:{" "}
        {numbers?.length === 0
          ? "Click the button!"
          : (numbers?.join(", ") ?? "...")}
      </p>
      <div className="flex gap-4">
        {children?.map((child) => (
          <div key={child._id}>
            <img src={child.avatar} alt={child.fullName} className="size-16" />
            <p>{child.fullName}</p>
            <p>{child.gender}</p>
          </div>
        ))}
      </div>
      <form onSubmit={addChildHandler}>
        <input
          className="border-2"
          type="text"
          name="fullName"
          placeholder="full name"
        />
        <select name="gender" id="gender">
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
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
