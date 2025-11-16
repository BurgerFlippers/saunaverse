"use client";

import { useState } from "react";
import { api } from "@/trpc/react";

export function LinkHarviaAccount() {
  const [harviaUsername, setHarviaUsername] = useState("");
  const [harviaPassword, setHarviaPassword] = useState("");
  const linkHarviaAccount = api.user.linkHarviaAccount.useMutation({
    onSuccess: () => {
      alert("Harvia account linked successfully!");
      setHarviaUsername("");
      setHarviaPassword("");
    },
    onError: (error) => {
      alert(`Failed to link Harvia account: ${error.message}`);
    },
  });

  const handleLinkHarviaAccount = async () => {
    if (!harviaUsername || !harviaPassword) {
      alert("Please enter your Harvia username and password.");
      return;
    }
    await linkHarviaAccount.mutateAsync({
      username: harviaUsername,
      password: harviaPassword,
    });
  };

  return (
    <div className="absolute top-6 right-6 flex flex-col gap-2">
      <input
        type="text"
        placeholder="Harvia Username"
        value={harviaUsername}
        onChange={(e) => setHarviaUsername(e.target.value)}
        className="rounded-full bg-white/10 px-4 py-2 text-white"
      />
      <input
        type="password"
        placeholder="Harvia Password"
        value={harviaPassword}
        onChange={(e) => setHarviaPassword(e.target.value)}
        className="rounded-full bg-white/10 px-4 py-2 text-white"
      />
      <button
        onClick={handleLinkHarviaAccount}
        disabled={linkHarviaAccount.isPending}
        className="rounded-full bg-white/10 px-4 py-2 font-semibold transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {linkHarviaAccount.isPending ? "Linking..." : "Link Harvia Account"}
      </button>
    </div>
  );
}
