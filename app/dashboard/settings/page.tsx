"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data: session } = useSession();
  const isActivePaidSubscription =
    session?.user?.subscriptionStatus === "ACTIVE" &&
    (session?.user?.plan === "BASIC" || session?.user?.plan === "PRO");
  const isFreePlan = session?.user?.subscriptionStatus === "FREE";

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
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">Plan: {session?.user?.plan ?? "BASIC"}</p>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Status: {session?.user?.subscriptionStatus ?? "FREE"}
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          {isActivePaidSubscription ? (
            <>
              <button
                type="button"
                onClick={() => void openPortal()}
                className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-950"
              >
                Manage billing
              </button>
              <button
                type="button"
                onClick={() => void openPortal()}
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
              >
                Cancel subscription
              </button>
            </>
          ) : (
            <Link
              href="/pricing"
              className="rounded-full bg-zinc-950 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-zinc-950"
            >
              {isFreePlan ? "Upgrade Plan" : "View Plans"}
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
