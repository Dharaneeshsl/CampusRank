"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const domain = useMemo(() => email.split("@")[1] ?? "", [email]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", { method: "POST", body: form });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error ?? "Registration failed.");
      return;
    }
    setSent(true);
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 px-4 py-10 md:grid-cols-2">
      <div>
        <h1 className="text-4xl font-black">Join your college leaderboard</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">
          Register with a college email. CampusRank detects your institution from the domain and
          creates a private college leaderboard automatically.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MailCheck className="h-5 w-5 text-primary" />
            Student registration
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-4">
              <p className="rounded-md border border-white/10 bg-white/10 p-4 font-medium">
                Verification OTP sent. For local demo, use <span className="font-black">123456</span>.
              </p>
              <Button asChild>
                <Link href={`/verify-email?email=${encodeURIComponent(email)}`}>
                  Verify email
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required placeholder="Aarav Raman" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">College email</Label>
                <Input
                  id="email"
                  name="email"
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="student@psgtech.ac.in"
                />
                <p className="text-sm text-muted-foreground">
                  {domain ? `Detected domain: ${domain}` : "Only .ac.in or seeded demo college domains are accepted."}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" required minLength={6} type="password" />
              </div>
              <Button className="w-full" type="submit">
                Send verification OTP
              </Button>
              {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
