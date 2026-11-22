import type { Metadata } from "next";
import { Josefin_Sans, Noto_Serif_SC } from "next/font/google";
import "./globals.css";
import { SessionLoader } from "@/components/providers/SessionLoader";

// 1. Josefin Sans — police principale de l'interface
const josefinSans = Josefin_Sans({ 
  subsets: ["latin"], 
  variable: "--font-josefin-sans",
  weight: ["300", "400", "500", "600", "700"],
});

// 2. Noto Serif SC — pour les caractères chinois
const notoSerifSC = Noto_Serif_SC({ 
  weight: ["400", "700"],
  subsets: ["latin"], 
  variable: "--font-noto-serif-sc" 
});

export const metadata: Metadata = {
  title: "HanYu | Apprendre le chinois",
  description: "Application gratuite d'apprentissage du chinois mandarin.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${josefinSans.variable} ${notoSerifSC.variable} antialiased`}>
        <SessionLoader />
        {children}
      </body>
    </html>
  );
}