import { EmailForm } from "@/components/EmailForm";

export default function GeneratePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-semibold tracking-tight">Generate reminder email</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-300">
        Fill in your invoice details and generate a professional payment reminder in seconds.
      </p>
      <EmailForm />
    </div>
  );
}
