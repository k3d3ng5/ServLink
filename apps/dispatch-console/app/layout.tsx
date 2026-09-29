import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-neutral-50 text-neutral-900">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
            <span className="font-bold text-emerald-800">ServLink Dispatch</span>
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
