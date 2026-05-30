"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

type UsagePayload = {
  plan: "FREE" | "BASIC" | "PRO";
  status: "FREE" | "ACTIVE" | "CANCELED" | "PAST_DUE";
  used: number;
  limit: number | null;
};

const planFeatures: Record<"FREE" | "BASIC" | "PRO", string[]> = {
  FREE: ["3 AI emails per month", "3 active invoices", "10 automated reminders/month", "Basic email history", "Copy to clipboard"],
  BASIC: ["10 AI emails per month", "10 active invoices", "50 automated reminders/month", "Full email history", "Filters and search", "Copy and export"],
  PRO: ["Unlimited AI emails", "Unlimited active invoices", "Unlimited automated reminders", "Priority generation", "Everything in Basic"],
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const [usage, setUsage] = useState<UsagePayload | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    company: "",
    email: "",
  });

  const effectivePlan = useMemo<"FREE" | "BASIC" | "PRO">(() => {
    if (usage?.plan) {
      return usage.plan;
    }

    if (session?.user?.subscriptionStatus === "ACTIVE") {
      return (session.user.plan as "FREE" | "BASIC" | "PRO") ?? "FREE";
    }

    return "FREE";
  }, [usage?.plan, session?.user?.plan, session?.user?.subscriptionStatus]);

  const isActivePaidSubscription = effectivePlan === "BASIC" || effectivePlan === "PRO";

  useEffect(() => {
    async function fetchUsage() {
      try {
        const response = await fetch("/api/usage");
        const data = (await response.json()) as UsagePayload & { error?: string };
        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load usage.");
        }

        setUsage(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load usage.");
      } finally {
        setLoadingUsage(false);
      }
    }

    void fetchUsage();
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/user/profile");
        const data = (await response.json()) as { error?: string; user?: { name: string | null; email: string | null; company: string | null } };
        if (!response.ok) {
          throw new Error(data.error ?? "Unable to load profile.");
        }

        setProfile({
          name: data.user?.name ?? session?.user?.name ?? "",
          company: data.user?.company ?? session?.user?.company ?? "",
          email: data.user?.email ?? session?.user?.email ?? "",
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load profile.");
      }
    }

    void fetchProfile();
  }, [session?.user?.company, session?.user?.email, session?.user?.name]);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name,
          company: profile.company,
        }),
      });

      const data = (await response.json()) as { error?: string; user?: { name: string; company: string | null } };
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to save profile.");
      }

      setProfile((prev) => ({
        ...prev,
        name: data.user?.name ?? prev.name,
        company: data.user?.company ?? "",
      }));
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save profile.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function openPortal() {
    const response = await fetch("/api/stripe/create-portal", {
      method: "POST",
    });
    const data = await response.json();

    if (!response.ok) {
      toast.error(data.error ?? "Unable to open billing portal.");
      return;
    }

    window.location.href = data.url;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold tracking-tight">Account settings</h1>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold">Profile</h2>
        <form onSubmit={saveProfile} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input
              required
              value={profile.name}
              onChange={(event) => setProfile((prev) => ({ ...prev, name: event.target.value }))}
              className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              value={profile.email}
              disabled
              className="w-full rounded-xl border border-zinc-300 bg-zinc-100 px-3 py-2 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Company Name</label>
            <input
              value={profile.company}
              onChange={(event) => setProfile((prev) => ({ ...prev, company: event.target.value }))}
              placeholder="Your company or business name"
              className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
          </div>
          <button
            type="submit"
            disabled={savingProfile}
            className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-zinc-950"
          >
            {savingProfile ? "Saving..." : "Save profile"}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold">Subscription</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Current plan: {effectivePlan}</p>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Status: {usage?.status ?? session?.user?.subscriptionStatus ?? "FREE"}
        </p>

        <div className="mt-4">
          <p className="text-sm font-medium">What&apos;s included</p>
          <ul className="mt-2 space-y-1 text-sm text-zinc-600 dark:text-zinc-300">
            {planFeatures[effectivePlan].map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <span className="mt-1 text-violet-600">•</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 rounded-xl bg-zinc-100 px-4 py-3 text-sm text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          {loadingUsage
            ? "Loading usage..."
            : usage?.limit === null
              ? `Emails used this month: ${usage?.used ?? 0} / Unlimited`
              : `Emails used this month: ${usage?.used ?? 0} / ${usage?.limit ?? 0}`}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {effectivePlan === "FREE" ? (
            <>
              <Link
                href="/pricing"
                className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-950"
              >
                Upgrade to Basic
              </Link>
              <Link
                href="/pricing"
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
              >
                Upgrade to Pro
              </Link>
            </>
          ) : effectivePlan === "BASIC" ? (
            <>
              <Link
                href="/pricing"
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
              >
                Upgrade to Pro
              </Link>
              <button
                type="button"
                onClick={() => void openPortal()}
                className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-950"
              >
                Manage billing
              </button>
            </>
          ) : isActivePaidSubscription ? (
            <button
              type="button"
              onClick={() => void openPortal()}
              className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-950"
            >
              Manage billing
            </button>
          ) : (
            <Link
              href="/pricing"
              className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-950"
            >
              View Plans
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
