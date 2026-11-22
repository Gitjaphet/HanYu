import type { Metadata } from "next";
import { Mulish, Noto_Serif_SC } from "next/font/google";
import "./globals.css";
import { SessionLoader } from "@/components/providers/SessionLoader";
import { themeScript } from "@/lib/theme";

// 1. Mulish — police principale de l'interface
const mulish = Mulish({
  subsets: ["latin"],
  variable: "--font-mulish", // police variable : toutes les graisses
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
    // suppressHydrationWarning : data-theme est posé par le script avant React
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${mulish.variable} ${notoSerifSC.variable} antialiased`}>
        <SessionLoader />
        {children}
      </body>
    </html>
  );
}
