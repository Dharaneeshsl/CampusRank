import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (session?.user?.id) redirect("/dashboard");

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 campus-grid opacity-40" />
      <div className="relative mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-12">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold tracking-[0.2em] text-white/55 uppercase">CampusRank</p>
        </div>
        {children}
      </div>
    </div>
  );
}
