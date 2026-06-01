export type ToolCategory = "Business & Productivity" | "Developer Boilerplates" | "Travel & Discovery";
export type ToolLifecycle = "LIVE" | "PLANNED";

export type ToolDefinition = {
  title: string;
  description: string;
  category: ToolCategory;
  lifecycle: ToolLifecycle;
  price: string;
  actionLabel: string;
  href: string;
};

export const TOOLS: ToolDefinition[] = [
  {
    title: "Invoice Reminder Writer",
    description: "Automated payment reminder emails. Set it once, we handle the rest.",
    category: "Business & Productivity",
    lifecycle: "LIVE",
    price: "$9/mo",
    actionLabel: "Try it free",
    href: "/tools/invoice-reminder-writer",
  },
  {
    title: "Flight Agent",
    description:
      "AI-powered travel assistant. Discover optimized flight routes, manage itineraries, and track real-time travel data effortlessly.",
    category: "Travel & Discovery",
    lifecycle: "LIVE",
    price: "$0",
    actionLabel: "Visit App",
    href: "/tools/flight-agent",
  },
  {
    title: "Claude RAG SaaS Starter Kit",
    description:
      "Launch your AI app in hours. A production-ready Next.js boilerplate featuring Claude API, Vector DB integration, and vertical templates.",
    category: "Developer Boilerplates",
    lifecycle: "PLANNED",
    price: "$149",
    actionLabel: "Join Waitlist",
    href: "/tools/claude-rag-starter-kit",
  },
];