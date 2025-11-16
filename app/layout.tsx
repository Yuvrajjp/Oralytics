import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Oralytics Multi-Omics Explorer",
  description:
    "Interactive explorer for oral health datasets across metagenomic, transcriptomic, metabolomic, and host genomic layers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
