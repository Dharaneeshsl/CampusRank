import { redirect } from "next/navigation";
import { SiteNav } from "@/components/site-nav";
import { auth } from "@/lib/auth";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return (
    <>
      <SiteNav isAdmin={Boolean(session.user.isAdmin)} />
      {children}
    </>
  );
}
