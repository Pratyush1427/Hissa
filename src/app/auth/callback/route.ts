import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Email links (password reset) land here with a one-time code, which becomes a signed-in session.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const nextParam = url.searchParams.get("next") ?? "/profile";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/profile";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL("/forgot?expired=1", url.origin));
}
