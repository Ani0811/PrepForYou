import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import Header from "./components/header/Header";
import Footer from "./components/footer/Footer";
import ThreeBackground from "./components/background/ThreeBackground";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PrepForYou - Your Personalized Learning Platform",
  description: "Track your progress, manage courses, and achieve your learning goals with PrepForYou.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
            <ThreeBackground />
            
            <Header />
            
            <main className="flex-1 container mx-auto px-4 py-8 relative z-10 pt-24">
              {children}
            </main>

            <Footer />
          </div>
          <Toaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
