import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { SaunaList } from "@/app/_components/SaunaList";

export default async function SaunasPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return (
    <main className="flex flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          Manage Saunas
        </h1>
        <SaunaList />
      </div>
    </main>
  );
}
