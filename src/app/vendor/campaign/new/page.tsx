import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import CampaignForm from "@/components/vendor/CampaignForm";
import { getData } from "@/lib/data";

export default async function NewCampaignPage() {
  const data = await getData();
  const vendor = await data.getVendor();
  if (!vendor) redirect("/vendor");

  return (
    <main className="flex-1 space-y-5 px-4 pt-6 md:mx-auto md:w-full md:max-w-2xl md:px-6">
      <Link href="/vendor" className="grid size-10 place-items-center rounded-full border-2 border-line bg-surface">
        <ArrowLeft className="size-5" />
      </Link>
      <h1 className="font-display text-4xl text-brand">Start a growth campaign</h1>
      <p className="text-lg">
        Tell your regulars what you need. They back you with small amounts and share in your extra sales.
      </p>
      <div className="bunting" />
      <CampaignForm stall={vendor.stall} mode={data.mode} />
    </main>
  );
}
