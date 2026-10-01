"use client";

import { useActionState } from "react";
import { updatePassword, type AuthState } from "@/app/actions";

export default function NewPasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(updatePassword, undefined);

  return (
    <form action={action} className="space-y-3">
      <label className="block space-y-1">
        <span className="text-sm font-medium text-muted">New password</span>
        <input name="password" type="password" required minLength={6} autoComplete="new-password" className="input" />
      </label>
      <label className="block space-y-1">
        <span className="text-sm font-medium text-muted">Type it again</span>
        <input name="confirm" type="password" required minLength={6} autoComplete="new-password" className="input" />
      </label>
      {state?.error && <p className="rounded-xl bg-brand-soft p-3 text-sm text-brand">{state.error}</p>}
      <button
        disabled={pending}
        className="w-full rounded-2xl bg-brand py-3.5 text-lg font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save new password"}
      </button>
    </form>
  );
}
