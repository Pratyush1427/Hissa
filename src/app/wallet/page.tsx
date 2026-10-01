import { redirect } from "next/navigation";
import WalletView from "@/components/WalletView";
import { getData } from "@/lib/data";

export default async function WalletPage() {
  const data = await getData();
  const viewer = await data.getViewer();
  if (!viewer) redirect("/login?next=/wallet");

  return <WalletView viewer={viewer} mode={data.mode} />;
}
