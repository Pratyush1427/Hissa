"use client";

import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordReset, type ResetState } from "@/app/actions";

export default function ForgotForm() {
  const [state, action, pending] = useActionState<ResetState, FormData>(requestPasswordReset, undefined);

  if (state?.sent) {
    return (
      <div className="space-y-3 rounded-3xl border-2 border-line bg-surface p-6 text-center">
        <p className="text-5xl">📬</p>
        <h2 className="font-display text-2xl">Check your email</h2>
        <p className="text-muted">
          If that email has a Hissa account, a reset link is on its way. Open it on this device to set a new password.
        </p>
        <Link href="/login" className="block font-semibold text-brand">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <label className="block space-y-1">
        <span className="text-sm font-medium text-muted">Email you signed up with</span>
        <input name="email" type="email" required autoComplete="email" className="input" />
      </label>
      {state?.error && <p className="rounded-xl bg-brand-soft p-3 text-sm text-brand">{state.error}</p>}
      <button
        disabled={pending}
        className="w-full rounded-2xl bg-brand py-3.5 text-lg font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Sending…" : "Send reset link"}
      </button>
    </form>
  );
}
