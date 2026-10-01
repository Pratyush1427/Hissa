import type { Metadata, Viewport } from "next";
import { Hind, Yatra_One } from "next/font/google";
import BottomNav from "@/components/BottomNav";
import TopNav from "@/components/TopNav";
import "./globals.css";

const hind = Hind({
  variable: "--font-hind",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const yatra = Yatra_One({
  variable: "--font-yatra",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Hissa",
  description: "Back the street stalls you love, and grow with them.",
};

export const viewport: Viewport = {
  themeColor: "#c8361d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${hind.variable} ${yatra.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">
        <TopNav />
        <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col pb-24 md:min-h-0 md:pb-12">{children}</div>
        <BottomNav />
      </body>
    </html>
  );
}
