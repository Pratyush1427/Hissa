import { redirect } from "next/navigation";
import NewPasswordForm from "@/components/NewPasswordForm";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function ResetPasswordPage() {
  if (!isSupabaseConfigured()) redirect("/login");
  // The reset link signs the player in; without that session there's nothing to update.
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims?.sub) redirect("/forgot?expired=1");

  return (
    <main className="flex-1 space-y-5 px-4 pt-8 md:mx-auto md:w-full md:max-w-2xl md:px-6">
      <header>
        <h1 className="font-display text-4xl text-brand">Set a new password</h1>
        <p className="mt-1 text-lg">Pick something you&apos;ll remember this time 😄</p>
      </header>
      <div className="bunting" />
      <NewPasswordForm />
    </main>
  );
}
