"use client";

import { signIn, useSession } from "next-auth/react";
import { useState } from "react";

export function LinkPolarAccount() {
  const [isLoading, setIsLoading] = useState(false);

  const { data: session } = useSession();

  const handleLink = async () => {
    setIsLoading(true);
    if (session?.user?.id) {
      document.cookie = `link_user_id=${session.user.id}; path=/; max-age=300`;
    }
    await signIn("polar");
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleLink}
        disabled={isLoading}
        className="rounded-lg bg-[#0091DA] p-4 font-bold text-white transition-colors hover:bg-[#007AB8] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? "Linking..." : "Link Polar Account"}
      </button>
    </div>
  );
}