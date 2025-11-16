"use client";

import { signIn } from "next-auth/react";

import { useState } from "react";

export default function LoginPage() {
  const [name, setName] = useState("");

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Get Started
        </h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            signIn("name", { name, redirectTo: "/feed" });
          }}
          className="flex flex-col gap-2"
        >
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-full bg-white/10 px-4 py-2 text-white"
          />
          <button
            type="submit"
            className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
          >
            Continue
          </button>
        </form>
      </div>
    </main>
  );
}
