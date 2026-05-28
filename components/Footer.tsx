import Link from "next/link";

const productLinks = ["AI Tools", "PDF Guides", "Notion Templates"];
const companyLinks = ["About", "Pricing", "Contact"];
const legalLinks = ["Terms", "Privacy", "Refunds"];

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
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <Link href="#top" className="text-lg font-semibold tracking-tight text-white">
            ToolHub
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-zinc-400">
            Practical digital products for independent founders who want to ship, sell and scale with less noise.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Products</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {productLinks.map((link) => (
              <li key={link}>
                <Link href="#products" className="transition hover:text-white">
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Company</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {companyLinks.map((link) => (
              <li key={link}>
                <Link href="#top" className="transition hover:text-white">
                  {link}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-white">Legal</h3>
          <ul className="mt-4 space-y-3 text-sm">
            {legalLinks.map((link) => (
              <li key={link}>
                <Link href="#top" className="transition hover:text-white">
                  {link}
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex gap-3">
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
        © 2026 ToolHub. All rights reserved.
      </div>
    </footer>
  );
}
