import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { Programs } from "@/app/_components/Programs";

export default async function ProgramsPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return <Programs />;
}
