import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { config } from "@/wagmi.config";
import Header from "@/components/header/Header";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ChainElect - Secure Blockchain Voting",
  description:
    "A decentralized, blockchain-powered web application for secure, transparent, and tamper-proof electronic voting.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = cookieToInitialState(config, (await headers()).get("cookie"));
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers initialState={initialState}>
          <div className="min-h-screen bg-background flex flex-col dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300">
            <Header />
            <main className="flex-grow container mx-auto py-10">{children}</main>
            <Footer />
            <Toaster richColors />
          </div>
        </Providers>
      </body>
    </html>
  );
}
