"use client";

import { useRouter } from "next/navigation";
import { Github, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function OnboardingPage() {
  const router = useRouter();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await fetch("/api/sync/all", { method: "POST", body: new FormData(event.currentTarget) });
    router.push("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Github className="h-5 w-5 text-primary" />
            Connect coding profiles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="grid gap-4">
            <div className="space-y-2">
              <Label>LeetCode username</Label>
              <Input name="leetcodeUsername" defaultValue="aaravraman" />
            </div>
            <div className="space-y-2">
              <Label>Codeforces username</Label>
              <Input name="codeforcesUsername" defaultValue="tourist" />
            </div>
            <div className="space-y-2">
              <Label>HackerRank username</Label>
              <Input name="hackerrankUsername" defaultValue="aaravraman" />
            </div>
            <Button>
              <RefreshCw className="h-4 w-4" />
              Fetch first score
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
