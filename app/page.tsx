import Link from "next/link";
import { EmailCapture } from "@/components/EmailCapture";
import { Features } from "@/components/Features";
import { Hero } from "@/components/Hero";
import { PricingCard } from "@/components/PricingCard";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <section className="px-4 py-20 sm:px-6 lg:px-8" id="pricing">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-600">Pricing</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Simple plans for every stage</h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-300">
              Start with Basic and upgrade anytime. Cancel in one click from your billing portal.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <PricingCard
              title="Basic"
              price="$9"
              period="/month"
              description="Perfect for occasional reminders and small client books."
              features={["10 AI reminder emails per month", "Email history", "Copy-ready output"]}
              plan="BASIC"
            />
            <PricingCard
              title="Pro"
              price="$19"
              period="/month"
              description="Best for active freelancers and small teams with recurring invoices."
              features={["Unlimited AI reminder emails", "Priority generation", "All dashboard features"]}
              plan="PRO"
              highlighted
            />
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/pricing"
              className="text-sm font-medium text-violet-600 transition hover:text-violet-500"
            >
              View full comparison
            </Link>
          </div>
        </div>
      </section>
      <EmailCapture />
    </>
  );
}
