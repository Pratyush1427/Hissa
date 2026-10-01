"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "@/app/actions";
import { AREAS } from "@/lib/areas";

const AVATARS = ["🧑🏽", "👩🏽", "👨🏽", "🧔🏽", "👩🏻", "👨🏾", "👵🏽", "🧑🏾"];

export default function AuthForm({ next }: { next: string }) {
  const [tab, setTab] = useState<"signup" | "signin">("signup");
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [signUpState, signUpAction, signingUp] = useActionState<AuthState, FormData>(signUp, undefined);
  const [signInState, signInAction, signingIn] = useActionState<AuthState, FormData>(signIn, undefined);
  const error = tab === "signup" ? signUpState?.error : signInState?.error;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 rounded-2xl border-2 border-line bg-surface p-1 font-semibold">
        {(
          [
            ["signup", "New here"],
            ["signin", "I have an account"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-xl py-2 ${tab === key ? "bg-brand text-white" : "text-muted"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "signup" ? (
        <form action={signUpAction} className="space-y-3">
          <input type="hidden" name="next" value={next} />
          <input type="hidden" name="avatar" value={avatar} />
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted">Pick your face</p>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAvatar(a)}
                  aria-pressed={avatar === a}
                  className={`grid size-11 place-items-center rounded-full text-2xl ${
                    avatar === a ? "bg-gold ring-2 ring-brand" : "bg-gold-soft"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
          <Field label="Your name">
            <input name="name" required minLength={2} maxLength={40} autoComplete="name" className="input" />
          </Field>
          <Field label="Critic handle (optional)">
            <input
              name="handle"
              maxLength={18}
              pattern="[A-Za-z0-9_]*"
              placeholder="e.g. dosa_hunter"
              autoComplete="username"
              className="input"
            />
          </Field>
          <Field label="Your area">
            <select name="area" defaultValue="" className="input">
              <option value="">Somewhere in Bengaluru</option>
              {AREAS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </Field>
          <Field label="Email">
            <input name="email" type="email" required autoComplete="email" className="input" />
          </Field>
          <Field label="Password">
            <input name="password" type="password" required minLength={6} autoComplete="new-password" className="input" />
          </Field>
          {error && <p className="rounded-xl bg-brand-soft p-3 text-sm text-brand">{error}</p>}
          <button
            disabled={signingUp}
            className="w-full rounded-2xl bg-brand py-3.5 text-lg font-semibold text-white disabled:opacity-60"
          >
            {signingUp ? "Creating your profile…" : "Join and get ₹10,000 play money"}
          </button>
        </form>
      ) : (
        <form action={signInAction} className="space-y-3">
          <input type="hidden" name="next" value={next} />
          <Field label="Email">
            <input name="email" type="email" required autoComplete="email" className="input" />
          </Field>
          <Field label="Password">
            <input name="password" type="password" required autoComplete="current-password" className="input" />
          </Field>
          {error && <p className="rounded-xl bg-brand-soft p-3 text-sm text-brand">{error}</p>}
          <button
            disabled={signingIn}
            className="w-full rounded-2xl bg-brand py-3.5 text-lg font-semibold text-white disabled:opacity-60"
          >
            {signingIn ? "Signing in…" : "Sign in"}
          </button>
          <Link href="/forgot" className="block text-center text-sm font-semibold text-brand">
            Forgot password?
          </Link>
        </form>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
