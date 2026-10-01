import Link from "next/link";
import ForgotForm from "@/components/ForgotForm";

export default async function ForgotPage({ searchParams }: PageProps<"/forgot">) {
  const { expired } = await searchParams;

  return (
    <main className="flex-1 space-y-5 px-4 pt-8 md:mx-auto md:w-full md:max-w-2xl md:px-6">
      <header>
        <h1 className="font-display text-4xl text-brand">Forgot password?</h1>
        <p className="mt-1 text-lg">No problem. We&apos;ll email you a link to set a new one.</p>
      </header>
      <div className="bunting" />
      {expired && (
        <p className="rounded-xl bg-brand-soft p-3 text-sm text-brand">
          That reset link has expired or was already used. Ask for a new one below.
        </p>
      )}
      <ForgotForm />
      <Link href="/login" className="block text-center text-sm text-muted underline">
        Remembered it? Sign in
      </Link>
    </main>
  );
}
