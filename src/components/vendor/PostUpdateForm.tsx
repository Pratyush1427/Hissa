"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { postUpdate } from "@/app/actions";
import type { Mode } from "@/lib/mode";

const EMOJIS = ["📣", "🙏", "🔥", "🛒", "📸", "🎉"];

export default function PostUpdateForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const [posted, setPosted] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function post() {
    setError("");
    if (mode === "demo") {
      setPosted(true);
      setText("");
      return;
    }
    startTransition(async () => {
      const result = await postUpdate(text, emoji);
      if (result.ok) {
        setPosted(true);
        setText("");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-3">
      <p className="font-semibold">Tell your backers what&apos;s new</p>
      <div className="flex gap-2">
        {EMOJIS.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => setEmoji(e)}
            aria-pressed={emoji === e}
            className={`grid size-10 place-items-center rounded-full text-xl ${emoji === e ? "bg-gold" : "bg-gold-soft"}`}
          >
            {e}
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setPosted(false);
        }}
        maxLength={280}
        rows={2}
        placeholder="e.g. Got a quote for the new tawa today!"
        className="input"
      />
      {error && <p className="rounded-xl bg-brand-soft p-3 text-sm text-brand">{error}</p>}
      {posted && (
        <p className="text-sm font-semibold text-grow">
          ✓ Posted! {mode === "demo" ? "(Demo: not saved.)" : "Your backers will see it on your stall page."}
        </p>
      )}
      <button
        onClick={post}
        disabled={text.trim().length < 3 || pending}
        className="w-full rounded-2xl border-2 border-brand py-2.5 font-semibold text-brand disabled:opacity-50"
      >
        {pending ? "Posting…" : "Post update"}
      </button>
    </div>
  );
}
