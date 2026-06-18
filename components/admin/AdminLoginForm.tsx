"use client";

import { AlertCircle, Loader2, LockKeyhole, LogIn, Mail } from "lucide-react";
import { FormEvent, useState } from "react";

export function AdminLoginForm() {
  const [email, setEmail] = useState("admin@admin.com");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "تعذر تسجيل الدخول.");
      }

      const params = new URLSearchParams(window.location.search);
      const next = params.get("next");
      window.location.href = next?.startsWith("/") ? next : "/dashboard";
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر تسجيل الدخول.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      {message ? (
        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          <AlertCircle size={18} aria-hidden="true" />
          {message}
        </div>
      ) : null}

      <label className="block text-sm font-extrabold text-ink">
        البريد الإلكتروني
        <span className="mt-2 flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2.5 shadow-sm focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/10">
          <Mail size={18} className="text-brand-600" aria-hidden="true" />
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none"
            autoComplete="email"
            required
          />
        </span>
      </label>

      <label className="block text-sm font-extrabold text-ink">
        كلمة السر
        <span className="mt-2 flex items-center gap-2 rounded-md border border-line bg-white px-3 py-2.5 shadow-sm focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/10">
          <LockKeyhole size={18} className="text-brand-600" aria-hidden="true" />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none"
            autoComplete="current-password"
            required
          />
        </span>
      </label>

      <button
        type="submit"
        disabled={isLoading}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-brand-600 px-5 py-3 text-sm font-extrabold text-white shadow-soft transition hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <LogIn size={18} aria-hidden="true" />}
        تسجيل الدخول
      </button>
    </form>
  );
}
