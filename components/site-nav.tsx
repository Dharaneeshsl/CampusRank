import Link from "next/link";
import { BarChart3, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteNav() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-black/60 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-white/20 bg-white text-black">
            <GraduationCap className="h-5 w-5" />
          </span>
          CampusRank
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-muted-foreground md:flex">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/leaderboard/psg-college-of-technology">Leaderboard</Link>
          <Link href="/city/Coimbatore">City</Link>
          <Link href="/profile/aaravraman">Profile</Link>
        </nav>
        <Button asChild size="sm">
          <Link href="/register">
            <BarChart3 className="h-4 w-4" />
            Join
          </Link>
        </Button>
      </div>
    </header>
  );
}
