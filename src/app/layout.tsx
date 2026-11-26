import type { Metadata } from "next";
import { Syne, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Raiga — Full-Stack Web Developer",
  description:
    "Full-Stack Web Developer yang merancang sistem web fungsional—mulai dari aplikasi pembukuan bisnis hingga platform belajar interaktif.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${syne.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full bg-[#F1F5F9] dark:bg-[#0B1120] font-sans text-[#0F172A] dark:text-[#F8FAFC] transition-colors duration-500 selection:bg-[#0F172A] selection:text-[#F8FAFC] dark:selection:bg-teal-400 dark:selection:text-slate-950"
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
