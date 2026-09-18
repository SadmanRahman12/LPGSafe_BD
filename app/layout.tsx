import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LPGSafe Bangladesh — National LPG Safety, Verification & Fair Price Network",
  description:
    "Official verification network for LPG cylinder safety, BSTI & Explosives Department compliance, authorized dealer search, and real-time BERC price monitoring in Bangladesh.",
  keywords: [
    "LPG Bangladesh",
    "LPG Cylinder Safety",
    "BERC LPG Price",
    "LPG Dealer Verification",
    "Gas Leak Safety Dhaka",
    "Department of Explosives",
  ],
  authors: [{ name: "LPGSafe Bangladesh Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${inter.variable}`}>
      <body className="flex min-h-full flex-col bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white font-sans">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
