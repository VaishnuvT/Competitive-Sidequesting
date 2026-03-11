import type { Metadata } from "next";
import { DM_Serif_Display, Space_Grotesk } from "next/font/google";

import { AppShell } from "@/components/layout/AppShell";

import "@/app/globals.css";

const displayFont = DM_Serif_Display({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin"]
});

const sansFont = Space_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Sidequest UT",
  description: "A privacy-first app that helps students break routine with low-friction sidequests."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${displayFont.variable} ${sansFont.variable}`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
