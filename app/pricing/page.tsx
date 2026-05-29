"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { PricingCard } from "@/components/PricingCard";

export default function PricingPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = Boolean(session?.user?.id);
  const isActivePaid =
    session?.user?.subscriptionStatus === "ACTIVE" &&
    (session?.user?.plan === "BASIC" || session?.user?.plan === "PRO");
  const effectivePlan = isActivePaid ? session?.user?.plan : "FREE";

  const freeButtonLabel = !isLoggedIn ? "Get Started Free" : effectivePlan === "FREE" ? "Current Plan" : "Switch to Free";

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Pricing</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Choose your plan</h1>
          <p className="mt-4 text-zinc-600 dark:text-zinc-300">
            Build professional reminder emails with AI and stay on top of overdue invoices.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <PricingCard
            title="Free"
            price="$0"
            period="/month"
            description="Great for getting started with occasional reminders."
            features={["3 AI emails per month", "Basic email history", "Copy to clipboard"]}
            buttonLabel={freeButtonLabel}
            buttonDisabled={isLoggedIn && effectivePlan === "FREE"}
            buttonHref={!isLoggedIn ? "/signin" : undefined}
          />
          <PricingCard
            title="Basic"
            price="$9"
            period="/month"
            description="For freelancers with a handful of monthly invoices."
            features={["10 AI emails per month", "Full email history", "Filters and search", "Copy and export"]}
            plan="BASIC"
            buttonLabel={effectivePlan === "BASIC" ? "Current Plan" : "Choose Basic"}
            buttonDisabled={effectivePlan === "BASIC"}
          />
          <PricingCard
            title="Pro"
            price="$19"
            period="/month"
            description="For consultants and small businesses that need unlimited reminders."
            features={["Unlimited AI emails", "Priority generation", "Everything in Basic"]}
            plan="PRO"
            buttonLabel={effectivePlan === "PRO" ? "Current Plan" : "Choose Pro"}
            buttonDisabled={effectivePlan === "PRO"}
            badge="Most Popular"
            highlighted
          />
        </div>

        <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Already subscribed? Manage your plan from <Link href="/dashboard/settings" className="text-violet-600">settings</Link>.
        </p>
      </div>
    </section>
  );
}