"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type College = {
  id: string;
  name: string;
  domain: string;
  city: string;
  state: string;
};

export default function AdminPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const response = await fetch("/api/admin/colleges");
    if (!response.ok) {
      setError("Admin access required.");
      setLoading(false);
      return;
    }
    setColleges(await response.json());
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function createCollege(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/colleges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(form.get("name") ?? ""),
        domain: String(form.get("domain") ?? ""),
        city: String(form.get("city") ?? ""),
        state: String(form.get("state") ?? "")
      })
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error ?? "Unable to create college.");
      setSaving(false);
      return;
    }
    event.currentTarget.reset();
    setSaving(false);
    await load();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="text-4xl font-black">Admin</h1>
      <p className="mt-2 text-muted-foreground">Provision institution domains for student registration.</p>

      <form onSubmit={createCollege} className="mt-8 grid gap-4 rounded-2xl border border-white/15 bg-white/5 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="name">College name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="domain">Email domain</Label>
            <Input id="domain" name="domain" placeholder="college.edu" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" required />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" name="state" required />
          </div>
        </div>
        <Button disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          {saving ? "Saving…" : "Add college"}
        </Button>
        {error ? <p className="text-sm font-medium text-red-300">{error}</p> : null}
      </form>

      <div className="mt-8 space-y-3">
        <h2 className="text-lg font-bold">Provisioned colleges</h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : colleges.length === 0 ? (
          <p className="text-sm text-muted-foreground">No colleges yet.</p>
        ) : (
          colleges.map((college) => (
            <div key={college.id} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <div className="font-semibold">{college.name}</div>
              <div className="text-sm text-muted-foreground">
                @{college.domain} · {college.city}, {college.state}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
