"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveAndSync(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const response = await fetch("/api/sync/all", {
      method: "POST",
      body: new FormData(event.currentTarget)
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(data.error ?? "Unable to save connections.");
      setSaving(false);
      return;
    }

    setMessage("Platform connections saved and scores refreshed.");
    setSaving(false);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-4xl font-black">Settings</h1>
      <p className="mt-2 text-muted-foreground">Connect your coding platform usernames.</p>

      <form onSubmit={saveAndSync} className="mt-8 grid gap-4 rounded-2xl border border-white/15 bg-white/5 p-6">
        <div className="space-y-2">
          <Label htmlFor="leetcodeUsername">LeetCode</Label>
          <Input id="leetcodeUsername" name="leetcodeUsername" autoCapitalize="none" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="codeforcesUsername">Codeforces</Label>
          <Input id="codeforcesUsername" name="codeforcesUsername" autoCapitalize="none" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="hackerrankUsername">HackerRank</Label>
          <Input id="hackerrankUsername" name="hackerrankUsername" autoCapitalize="none" required />
        </div>
        <Button disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : "Save & refresh"}
        </Button>
        {message ? <p className="text-sm text-white/80">{message}</p> : null}
        {error ? <p className="text-sm font-medium text-red-300">{error}</p> : null}
      </form>
    </main>
  );
}
