"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { consumeVerifiedLoginState } from "@/lib/auth-flow";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();

  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [email, setEmail] = useState("");
  const [ticket, setTicket] = useState("");
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    const { verified: justVerified, email: verifiedEmail } = consumeVerifiedLoginState();
    if (justVerified) setVerified(true);
    if (verifiedEmail) setEmail(verifiedEmail);
  }, []);

  async function requestOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const nextEmail = String(formData.get("email") ?? "").trim().toLowerCase();

    const response = await fetch("/api/auth/login-otp", {
      method: "POST",
      body: formData
    });
    const data = await response.json().catch(() => ({}));

    const passwordInput = form.elements.namedItem("password");
    if (passwordInput instanceof HTMLInputElement) passwordInput.value = "";

    if (!response.ok || !data.ticket) {
      setError(data.error ?? "Unable to sign in.");
      setLoading(false);
      return;
    }

    setEmail(nextEmail);
    setTicket(String(data.ticket));
    setStep("otp");
    setLoading(false);
  }

  async function completeSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      ticket,
      otp,
      redirect: false
    });

    setTicket("");
    setOtp("");

    if (result?.error) {
      setError("Invalid or expired code. Start sign-in again.");
      setStep("credentials");
      setLoading(false);
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  async function resendCode() {
    setResending(true);
    setError("");
    const form = new FormData();
    form.set("email", email);
    form.set("purpose", "login");
    const response = await fetch("/api/auth/resend-otp", { method: "POST", body: form });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) setError(data.error ?? "Unable to resend code.");
    setResending(false);
  }

  return (
    <div className="glass-panel rounded-2xl p-8">
      <h1 className="text-3xl font-black tracking-tight">Sign in</h1>
      <p className="mt-2 text-sm text-white/60">
        {step === "credentials"
          ? "Enter your college email and password to receive a one-time code."
          : `Enter the 6-digit code sent to ${email}.`}
      </p>

      {verified ? (
        <p className="mt-4 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white/90">
          Email verified. Sign in to continue.
        </p>
      ) : null}

      {step === "credentials" ? (
        <form method="post" onSubmit={requestOtp} className="mt-8 space-y-4" autoComplete="on">
          <div className="space-y-2">
            <Label htmlFor="email">College email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              minLength={12}
              required
            />
          </div>
          <Button className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Sending code…" : "Continue"}
          </Button>
          {error ? <p className="text-sm font-medium text-red-300">{error}</p> : null}
        </form>
      ) : (
        <form method="post" onSubmit={completeSignIn} className="mt-8 space-y-4" autoComplete="one-time-code">
          <div className="space-y-2">
            <Label htmlFor="otp">Sign-in code</Label>
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
            {loading ? "Signing in…" : "Sign in"}
          </Button>
          <button
            type="button"
            className="w-full text-sm text-white/60 underline-offset-4 hover:underline disabled:opacity-50"
            onClick={resendCode}
            disabled={resending}
          >
            {resending ? "Resending…" : "Resend code"}
          </button>
          <button
            type="button"
            className="w-full text-sm text-white/60 underline-offset-4 hover:underline"
            onClick={() => {
              setStep("credentials");
              setOtp("");
              setTicket("");
              setError("");
            }}
          >
            Use a different account
          </button>
          {error ? <p className="text-sm font-medium text-red-300">{error}</p> : null}
        </form>
      )}

      <p className="mt-8 text-center text-sm text-white/55">
        New here?{" "}
        <Link className="font-semibold text-white" href="/register">
          Create an account
        </Link>
      </p>
    </div>
  );
}
