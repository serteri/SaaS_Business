import Link from "next/link";

const footerLinks = [
  { label: "All Tools", href: "/tools" },
  { label: "Claude RAG Kit", href: "/tools/claude-rag-starter-kit" },
  { label: "Invoice Writer", href: "/tools/invoice-reminder-writer" },
];

function SocialIcon({ label }: { label: string }) {
  return (
    <span
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-800 bg-zinc-900 text-sm font-medium text-white transition hover:border-zinc-700 hover:bg-zinc-800"
      aria-label={label}
    >
      {label === "Twitter / X" ? "X" : "in"}
    </span>
  );
}

export function Footer() {
  return (
    <footer className="bg-zinc-900 px-4 py-16 text-zinc-300 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <Link href="/" className="text-lg font-semibold tracking-tight text-white">
            Ongonix
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-400">
            A premium suite of AI tools and developer boilerplates to build, work, and travel smarter.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Explore</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {footerLinks.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="transition hover:text-white">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Social</h3>

          <div className="mt-4 flex gap-3">
            <Link href="https://x.com" className="inline-flex" aria-label="Twitter / X">
              <SocialIcon label="Twitter / X" />
            </Link>
            <Link href="https://linkedin.com" className="inline-flex" aria-label="LinkedIn">
              <SocialIcon label="LinkedIn" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-7xl border-t border-zinc-800 pt-6 text-sm text-zinc-500">
        © 2026 Ongonix. All rights reserved.
      </div>
    </footer>
  );
}

