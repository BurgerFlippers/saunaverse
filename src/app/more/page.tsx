"use client";

import { useState } from "react";
import { Programs } from "@/app/_components/Programs";
import { Events } from "@/app/_components/Events";

export default function MorePage() {
  const [activeTab, setActiveTab] = useState<"programs" | "events">("programs");

  return (
    <div className="space-y-2 p-4">
      {/* Tab Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("programs")}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold transition-colors ${
            activeTab === "programs"
              ? "bg-[#D01400] text-white"
              : "bg-[#2C2B36] text-gray-400 hover:bg-[#3a3944]"
          }`}
        >
          Programs
        </button>
        <button
          onClick={() => setActiveTab("events")}
          className={`flex-1 py-2.5 px-4 rounded-xl font-bold transition-colors ${
            activeTab === "events"
              ? "bg-[#D01400] text-white"
              : "bg-[#2C2B36] text-gray-400 hover:bg-[#3a3944]"
          }`}
        >
          Events
        </button>
      </div>

      {/* Content */}
      <div className="p-4 rounded-lg  text-white text-center">
        {activeTab === "programs" ? <Programs /> : <Events />}
      </div>
    </div>
  );
}
