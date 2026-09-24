import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PayAfterVisa Advisor",
  description: "Talk to an advisor about your travel or study abroad plans.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">{children}</body>
    </html>
  );
}
