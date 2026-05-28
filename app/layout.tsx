import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ToolHub - Digital products for indie founders",
  description:
    "A premium marketplace for AI micro tools, PDF guides, Notion templates, and standalone products built for solo builders.",
  metadataBase: new URL("https://toolhub.example"),
  openGraph: {
    title: "ToolHub - Digital products for indie founders",
    description:
      "AI tools, PDF guides and templates built for freelancers, agencies and solo builders.",
    type: "website",
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} bg-white text-zinc-950 antialiased transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-50`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
