"use client";

import { Card } from "@/app/_components/ui/card";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function SettingsPage() {
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  if (!session) return null;

  return (
    <div className="space-y-4 p-4 pb-16">
      <Card className="heat-wave relative rounded-2xl border-[#2C2B36] bg-[#1F1F23] p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-2xl font-bold text-black">
            {session.user.name?.charAt(0)}
          </div>
          <div>
            <h2 className="mb-1 text-2xl font-bold text-white">
              {session.user.name}
            </h2>
            <p className="text-sm font-normal text-gray-300">
              Joined 3 months ago
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
