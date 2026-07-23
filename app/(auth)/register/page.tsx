"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setPendingVerifyEmail } from "@/lib/auth-flow";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(event.currentTarget);
    const nextEmail = String(form.get("email") ?? "").trim().toLowerCase();
    const response = await fetch("/api/auth/register", { method: "POST", body: form });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error ?? "Registration failed.");
      setLoading(false);
      return;
    }

    setPendingVerifyEmail(nextEmail);
    router.push("/verify-email");
  }

  return (
    <div className="glass-panel rounded-2xl p-8">
      <h1 className="text-3xl font-black tracking-tight">Create account</h1>
      <p className="mt-2 text-sm text-white/60">
        Use your institution email. We’ll send a one-time verification code.
      </p>

      <form method="post" onSubmit={submit} className="mt-8 space-y-4" autoComplete="on">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" autoComplete="name" required minLength={2} maxLength={100} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">College email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={12}
            maxLength={128}
            required
          />
          <p className="text-xs text-white/45">
            12+ characters with upper, lower, number, and symbol.
          </p>
        </div>
        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Sending code…" : "Send verification code"}
        </Button>
        {error ? <p className="text-sm font-medium text-red-300">{error}</p> : null}
      </form>

      <p className="mt-8 text-center text-sm text-white/55">
        Already have an account?{" "}
        <Link className="font-semibold text-white" href="/login">
          Sign in
        </Link>
      </p>
    </div>
  );
}
