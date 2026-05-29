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
  FREE: ["3 AI emails per month", "Basic email history", "Copy to clipboard"],
  BASIC: ["10 AI emails per month", "Full email history", "Filters and search", "Copy and export"],
  PRO: ["Unlimited AI emails", "Priority generation", "Everything in Basic"],
};

export default function SettingsPage() {
  const { data: session } = useSession();
  const [usage, setUsage] = useState<UsagePayload | null>(null);
  const [loadingUsage, setLoadingUsage] = useState(true);

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
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{session?.user?.name ?? "No name set"}</p>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">{session?.user?.email}</p>
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
