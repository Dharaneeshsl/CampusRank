"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<main className="p-10">Loading verification...</main>}>
      <VerifyEmailForm />
    </Suspense>
  );
}

function VerifyEmailForm() {
  const params = useSearchParams();
  const router = useRouter();
  const email = params.get("email") ?? "";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await fetch("/api/auth/verify-email", { method: "POST", body: form });
    router.push("/onboarding");
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Verify college email
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <input type="hidden" name="email" value={email} />
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={email} readOnly />
            </div>
            <div className="space-y-2">
              <Label>6-digit OTP</Label>
              <Input name="otp" defaultValue="123456" maxLength={6} />
            </div>
            <Button className="w-full">Verify and continue</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
