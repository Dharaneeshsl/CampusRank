"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  clearPendingVerifyEmail,
  getPendingVerifyEmail,
  setVerifiedLoginEmail
} from "@/lib/auth-flow";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="glass-panel rounded-2xl p-8 text-center text-white/60">Loading…</div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}

function VerifyEmailForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    setEmail(getPendingVerifyEmail());
    setReady(true);
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData();
    form.set("email", email);
    form.set("otp", otp);

    const response = await fetch("/api/auth/verify-email", { method: "POST", body: form });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error ?? "Verification failed.");
      setLoading(false);
      return;
    }

    clearPendingVerifyEmail();
    setVerifiedLoginEmail(email);
    router.replace("/login");
  }

  async function resendCode() {
    if (!email) return;
    setResending(true);
    setError("");
    const form = new FormData();
    form.set("email", email);
    form.set("purpose", "signup");
    const response = await fetch("/api/auth/resend-otp", { method: "POST", body: form });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) setError(data.error ?? "Unable to resend code.");
    setResending(false);
  }

  if (!ready) {
    return <div className="glass-panel rounded-2xl p-8 text-center text-white/60">Loading…</div>;
  }

  if (!email) {
    return (
      <div className="glass-panel rounded-2xl p-8 text-center">
        <h1 className="text-2xl font-black">Missing email</h1>
        <p className="mt-2 text-sm text-white/60">Start from registration to verify your account.</p>
        <Button asChild className="mt-6">
          <Link href="/register">Create account</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-8">
      <h1 className="text-3xl font-black tracking-tight">Verify email</h1>
      <p className="mt-2 text-sm text-white/60">
        Enter the 6-digit code sent to <span className="text-white">{email}</span>.
      </p>

      <form method="post" onSubmit={submit} className="mt-8 space-y-4" autoComplete="one-time-code">
        <div className="space-y-2">
          <Label htmlFor="otp">Verification code</Label>
          <Input
            id="otp"
            name="otp"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            autoComplete="one-time-code"
            value={otp}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
            required
          />
        </div>
        <Button className="w-full" disabled={loading || otp.length !== 6}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? "Verifying…" : "Verify email"}
        </Button>
        <button
          type="button"
          className="w-full text-sm text-white/60 underline-offset-4 hover:underline disabled:opacity-50"
          onClick={resendCode}
          disabled={resending}
        >
          {resending ? "Resending…" : "Resend code"}
        </button>
        {error ? <p className="text-sm font-medium text-red-300">{error}</p> : null}
      </form>
    </div>
  );
}
