import Link from "next/link";
import { redirect } from "next/navigation";
import AuthForm from "@/components/AuthForm";
import { getMyProfile } from "@/lib/data/live";
import { safeNext } from "@/lib/safe-next";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;
  const target = safeNext(next);

  if (!isSupabaseConfigured()) {
    return (
      <main className="flex-1 space-y-4 px-4 pt-8 md:mx-auto md:w-full md:max-w-2xl md:px-6">
        <h1 className="font-display text-3xl text-brand">Live mode isn&apos;t set up yet</h1>
        <p className="text-muted">
          Add your Supabase project URL and key to <code>.env.local</code> to let people sign up and play. Until then,
          everything runs in demo mode.
        </p>
        <Link href="/" className="block rounded-2xl bg-brand py-3 text-center font-semibold text-white">
          Explore the demo
        </Link>
      </main>
    );
  }

  if (await getMyProfile()) redirect(target);

  return (
    <main className="flex-1 space-y-5 px-4 pt-8 md:mx-auto md:w-full md:max-w-2xl md:px-6">
      <header>
        <h1 className="font-display text-4xl text-brand">Join Hissa</h1>
        <p className="mt-1 text-lg">
          Become a Bengaluru street-food critic. Rate stalls, find hidden gems, and back the vendors you love.
        </p>
      </header>
      <div className="bunting" />
      <AuthForm next={target} />
      <p className="text-center text-xs text-muted">Money on Hissa is play money for now. Nothing real is charged.</p>
    </main>
  );
}
