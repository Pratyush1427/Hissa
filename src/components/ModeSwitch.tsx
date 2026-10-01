"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setMode } from "@/app/actions";
import type { Mode } from "@/lib/mode";

// Demo: curated sample world for showing the idea. Live: real players and saved actions.
export default function ModeSwitch({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(next: Mode) {
    if (next === mode) return;
    startTransition(async () => {
      await setMode(next);
      router.refresh();
    });
  }

  return (
    <div
      role="radiogroup"
      aria-label="Data mode"
      className={`flex rounded-full border-2 border-line bg-surface p-0.5 text-xs font-bold ${pending ? "opacity-60" : ""}`}
    >
      {(["demo", "live"] as const).map((m) => (
        <button
          key={m}
          role="radio"
          aria-checked={mode === m}
          onClick={() => choose(m)}
          className={`rounded-full px-3 py-1 capitalize ${
            mode === m ? (m === "live" ? "bg-grow text-white" : "bg-gold text-ink") : "text-muted"
          }`}
        >
          {m === "live" ? "● Live" : "Demo"}
        </button>
      ))}
    </div>
  );
}
