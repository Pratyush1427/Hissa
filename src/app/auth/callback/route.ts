import { NextResponse } from "next/server";
import { safeNext } from "@/lib/safe-next";
import { createClient } from "@/lib/supabase/server";

// Email links (password reset) land here with a one-time code, which becomes a signed-in session.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Belt and braces: only ever redirect within this site.
      const target = new URL(next, url.origin);
      return NextResponse.redirect(target.origin === url.origin ? target : new URL("/profile", url.origin));
    }
  }
  return NextResponse.redirect(new URL("/forgot?expired=1", url.origin));
}
