import type { Metadata } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { AuthProvider } from "@/components/AuthProvider";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Invoice Reminder Writer",
  description:
    "AI-powered payment reminder emails for freelancers and small businesses.",
  metadataBase: new URL("https://ongonix.com"),
  openGraph: {
    title: "Invoice Reminder Writer",
    description:
      "Get paid faster. Write better payment reminders.",
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
        <AuthProvider>
          <ThemeProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
