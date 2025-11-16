import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { api } from "@/trpc/server";

export default async function HomePage() {
  const session = await auth();
  if (session) {
    return redirect("/feed");
  }
  return redirect("/setup");
}
