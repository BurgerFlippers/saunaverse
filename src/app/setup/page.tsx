"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

function RegisterStep({ onNext }: { onNext: () => void }) {
  const [name, setName] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSigningIn(true);
    await signIn("name", { name, redirect: false });
    setIsSigningIn(false);
    onNext();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex w-full max-w-sm flex-col gap-4"
    >
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="rounded-lg border border-[#2C2B36] bg-[#1F1F23] p-4 text-white focus:border-blue-500 focus:ring-blue-500"
        required
      />
      <button
        type="submit"
        className="rounded-lg bg-[#D01400] p-4 font-bold text-white transition-colors hover:bg-[#FF7A28]"
        disabled={isSigningIn}
      >
        {isSigningIn ? "..." : "Continue"}
      </button>
    </form>
  );
}

export default function SetupPage() {
  const router = useRouter();

  return (
    <main className="flex flex-col items-center justify-center bg-black text-white">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Welcome to Saunaverse
        </h1>
        <p className="text-lg text-gray-400">What should we call you?</p>
        <RegisterStep onNext={() => router.push("/setup/sauna")} />
      </div>
    </main>
  );
}
