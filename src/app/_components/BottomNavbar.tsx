"use client";

import Link from "next/link";
import { Activity, Zap, Calendar, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export function BottomNavbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session || pathname.startsWith("/setup")) {
    return null;
  }

  return (
    <div className="fixed right-0 bottom-0 left-0 z-50 border-t border-[#2C2B36] bg-[#D01400] shadow-lg">
      <div className="mx-auto flex max-w-2xl justify-around">
        <Link
          href="/feed"
          className={`flex flex-col items-center px-6 py-3 transition-colors ${
            pathname === "/feed" ? "text-white" : "text-white/60"
          }`}
        >
          <Activity className="h-6 w-6" />
          <span className="mt-1 text-xs font-normal">Feed</span>
        </Link>
        <Link
          href="/programs"
          className={`flex flex-col items-center px-6 py-3 transition-colors ${
            pathname === "/programs" ? "text-white" : "text-white/60"
          }`}
        >
          <Zap className="h-6 w-6" />
          <span className="mt-1 text-xs font-normal">Programs</span>
        </Link>
        <Link
          href="/events"
          className={`flex flex-col items-center px-6 py-3 transition-colors ${
            pathname === "/events" ? "text-white" : "text-white/60"
          }`}
        >
          <Calendar className="h-6 w-6" />
          <span className="mt-1 text-xs font-normal">Events</span>
        </Link>
        <Link
          href="/you"
          className={`flex flex-col items-center px-6 py-3 transition-colors ${
            pathname === "/you" ? "text-white" : "text-white/60"
          }`}
        >
          <User className="h-6 w-6" />
          <span className="mt-1 text-xs font-normal">You</span>
        </Link>
      </div>
    </div>
  );
}
