"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function SignInPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      if (isRegistering) {
        const registerResponse = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, name, password }),
        });
        const registerData = await registerResponse.json();
        if (!registerResponse.ok) {
          throw new Error(registerData.error ?? "Unable to create account.");
        }
        toast.success("Account created. Signing you in...");
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Invalid email or password.");
      }

      toast.success("Signed in successfully.");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  }

  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold">{isRegistering ? "Create account" : "Welcome back"}</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
          {isRegistering ? "Start your free trial." : "Sign in to your dashboard."}
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleCredentials}>
          {isRegistering ? (
            <div>
              <label className="mb-1 block text-sm font-medium">Name</label>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
              />
            </div>
          ) : null}
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-transparent px-3 py-2 text-sm dark:border-zinc-700"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center rounded-full bg-violet-600 px-5 text-sm font-medium text-white transition hover:bg-violet-500 disabled:opacity-70"
          >
            {loading ? "Please wait..." : isRegistering ? "Create account" : "Sign in"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleGoogle}
          className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-full border border-zinc-300 px-5 text-sm font-medium transition hover:border-zinc-400 dark:border-zinc-700"
        >
          Continue with Google
        </button>

        <button
          type="button"
          onClick={() => setIsRegistering((value) => !value)}
          className="mt-4 text-sm text-violet-600 transition hover:text-violet-500"
        >
          {isRegistering ? "Already have an account? Sign in" : "No account? Create one"}
        </button>
      </div>
    </section>
  );
}
