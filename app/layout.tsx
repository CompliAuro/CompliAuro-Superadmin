import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CompliAuro — Super Admin Platform Console",
  description:
    "Super Admin console for platform monitoring, tenant hub provisioning, payment audit tracking, and system performance log analysis.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#050505] text-white">
        {children}
      </body>
    </html>
  );
}
