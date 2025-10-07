"use client";

import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
// import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";

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

  const addChildHandler = async () => {
    const childId = await addChild({
      fullName: "test three",
      gender: "female",
      avatar:
        "https://gravatar.com/avatar/486c13f8bc3e0d30a1d7f45c0adf1bdb?s=400&d=robohash&r=x",
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
      <button
        className="bg-foreground text-background text-sm px-4 py-2 rounded-md"
        onClick={addChildHandler}
      >
        Add Child
      </button>
    </div>
  );
}
