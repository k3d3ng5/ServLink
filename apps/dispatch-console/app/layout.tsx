import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ServLink Dispatch",
  description: "Concierge console — match requests, review providers, track validation.",
};

const NAV = [
  ["Queue", "/"],
  ["Applications", "/applications"],
  ["Metrics", "/metrics"],
  ["Analytics", "/analytics"],
] as const;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`h-full antialiased ${inter.variable}`}>
      <body className="min-h-full bg-white font-sans text-[#0A1633]">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
            <span className="font-bold text-[#0A1633]">ServLink Dispatch</span>
            <nav className="flex gap-4 text-sm">
              {NAV.map(([label, href]) => (
                <Link key={href} href={href} className="text-neutral-600 hover:text-black">
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
