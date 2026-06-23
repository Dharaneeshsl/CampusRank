"use client";

import { RefreshCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <p className="font-semibold text-primary">Student settings</p>
        <h1 className="text-4xl font-black">Profile connections</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Platform usernames</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="space-y-2">
              <Label>LeetCode</Label>
              <Input defaultValue="aaravraman" />
            </div>
            <div className="space-y-2">
              <Label>Codeforces</Label>
              <Input defaultValue="tourist" />
            </div>
            <div className="space-y-2">
              <Label>HackerRank</Label>
              <Input defaultValue="aaravraman" />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button>
                <Save className="h-4 w-4" />
                Save changes
              </Button>
              <Button variant="outline" type="button">
                <RefreshCw className="h-4 w-4" />
                Refresh score
              </Button>
            </div>
            <div className="rounded-md border border-white/10 bg-white/10 p-4 text-sm text-white">
              Manual score refresh is limited to once per hour in production.
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
