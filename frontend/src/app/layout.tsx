import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LANDGUARD NER — AI Landslide Risk Monitoring",
  description:
    "AI-powered real-time landslide risk monitoring and early warning platform for the North Eastern Region of India. Predicts, monitors, and communicates landslide risks.",
  keywords: [
    "landslide",
    "risk monitoring",
    "early warning",
    "NER",
    "India",
    "AI",
    "disaster management",
  ],
};

import { AuthProvider } from "@/context/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0a0e1a] text-gray-100 font-[family-name:var(--font-inter)]">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
