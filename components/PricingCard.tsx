"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

type PricingCardProps = {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  plan?: "BASIC" | "PRO";
  buttonLabel: string;
  buttonDisabled?: boolean;
  buttonHref?: string;
  badge?: string;
  highlighted?: boolean;
};

export function PricingCard({
  title,
  price,
  period,
  description,
  features,
  plan,
  buttonLabel,
  buttonDisabled = false,
  buttonHref,
  badge,
  highlighted = false,
}: PricingCardProps) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    if (!plan) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to create checkout session.");
      }

      window.location.href = data.url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Checkout failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <article
      className={`rounded-3xl border p-8 ${
        highlighted
          ? "border-violet-500 bg-violet-600/[0.08]"
          : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
      }`}
    >
      {badge ? (
        <div className="mb-3 inline-flex rounded-full bg-violet-600 px-3 py-1 text-xs font-medium text-white">{badge}</div>
      ) : null}
      <h3 className="text-2xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">{description}</p>
      <div className="mt-6 flex items-end gap-1">
        <span className="text-4xl font-semibold">{price}</span>
        <span className="pb-1 text-zinc-500 dark:text-zinc-400">{period}</span>
      </div>

      <ul className="mt-6 space-y-3 text-sm text-zinc-700 dark:text-zinc-300">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <span className="mt-1 text-violet-600">•</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {buttonHref ? (
        <Link
          href={buttonHref}
          className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950"
        >
          {buttonLabel}
        </Link>
      ) : (
        <button
          type="button"
          onClick={handleCheckout}
          disabled={loading || buttonDisabled}
          className="mt-8 inline-flex h-11 w-full items-center justify-center rounded-full bg-zinc-950 px-5 text-sm font-medium text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-zinc-950"
        >
          {loading ? "Redirecting..." : buttonLabel}
        </button>
      )}
    </article>
  );
}
