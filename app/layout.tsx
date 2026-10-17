import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SBSSU Alumni Portal | Shaheed Bhagat Singh State University",
  description:
    "Official Alumni Association & Sanjh 2026 Cultural Meet Portal for Shaheed Bhagat Singh State University (formerly SBSCET / SBSSTC), Ferozepur, Punjab. Welcome back to your alma mater!",
  icons: {
    icon: "/sbssu-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FDFBF7] text-zinc-900 font-sans selection:bg-orange-200 selection:text-orange-950">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
