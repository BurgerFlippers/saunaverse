"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";

export default function PolarSetupPage() {
  const router = useRouter();
  const { status, data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/setup");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white">
        <div className="text-white">Loading...</div>
      </main>
    );
  }

  const handleLink = async () => {
    setIsLoading(true);
    if (session?.user?.id) {
      document.cookie = `link_user_id=${session.user.id}; path=/; max-age=300`;
    }
    // After Polar auth, NextAuth redirects back to the callbackUrl.
    await signIn("polar", { callbackUrl: "/" });
  };

  const handleSkip = () => {
    router.push("/");
  };

  return (
    <main className="flex flex-col items-center justify-center bg-black text-white min-h-screen">
      <div className="container flex flex-col items-center justify-center gap-8 px-4 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-center">
          Connect your health data
        </h1>
        <p className="text-center text-lg text-gray-400 max-w-md">
          Link your Polar account to track heart rate and other biometrics during
          your sauna sessions.
        </p>

        <div className="flex w-full max-w-sm flex-col gap-4">
          <button
            onClick={handleLink}
            disabled={isLoading}
            className="rounded-lg bg-[#0091DA] p-4 font-bold text-white transition-colors hover:bg-[#007AB8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Connecting..." : "Connect Polar Account"}
          </button>
          <button
            onClick={handleSkip}
            className="cursor-pointer rounded-lg bg-transparent p-4 font-bold text-gray-400 transition-colors hover:bg-white/10"
          >
            Skip for now
          </button>
        </div>
      </div>
    </main>
  );
}