import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Sarkari Govt Job | Automated Govt Jobs & Yojana Notifications",
    template: "%s | Sarkari Govt Job"
  },
  description: "Get real-time, automated updates on official Indian Government jobs (Sarkari Exam), results, admit cards, answer keys, and central/state yojana details.",
  metadataBase: new URL("https://railwayadmitcard.online"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="font-sans min-h-full flex flex-col bg-slate-50 text-slate-900 antialiased selection:bg-blue-500/20 selection:text-blue-800">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
