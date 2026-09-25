"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      router.push(searchParams.get("next") || "/admin");
      router.refresh();
    } else {
      setError("Incorrect username or password.");
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm"
    >
      <h1 className="mb-1 text-lg font-semibold text-[var(--foreground)]">Team login</h1>
      <p className="mb-5 text-sm text-neutral-500">Internal access only.</p>
      <input
        type="text"
        autoFocus
        autoComplete="username"
        className="mb-3 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        autoComplete="current-password"
        className="mb-3 w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none focus:border-[var(--brand)]"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading || !username || !password}
        className="w-full rounded-lg py-2 text-sm font-medium text-white disabled:opacity-50"
        style={{ background: "var(--brand)" }}
      >
        {loading ? "Checking…" : "Log in"}
      </button>
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
