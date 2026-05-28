import { EmailCapture } from "@/components/EmailCapture";
import { Footer } from "@/components/Footer";
import { Features } from "@/components/Features";
import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { ProductsGrid } from "@/components/ProductsGrid";
import { Testimonials } from "@/components/Testimonials";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-zinc-50">
      <Navbar />
      <Hero />
      <ProductsGrid />
      <Features />
      <Testimonials />
      <EmailCapture />
      <Footer />
    </main>
  );
}
