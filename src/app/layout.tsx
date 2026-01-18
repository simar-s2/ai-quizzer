import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import AuthProvider from "@/components/AuthProvider";
import MockModeBanner from "@/components/MockModeBanner";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "Quizzera",
    template: "%s | Quizzera",
  },
  description: "Create intelligent quizzes from your study materials with AI. Generate, take, and track your learning progress with Quizzera.",
  keywords: ["quiz", "AI", "learning", "education", "study", "test", "exam preparation"],
  authors: [{ name: "Quizzera" }],
  creator: "Quizzera",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://quizzera.com",
    title: "Quizzera - AI-Powered Quiz Generator",
    description: "Create intelligent quizzes from your study materials with AI",
    siteName: "Quizzera",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quizzera - AI-Powered Quiz Generator",
    description: "Create intelligent quizzes from your study materials with AI",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <Toaster richColors closeButton />
            <MockModeBanner />

            <div className="h-16">
              <Navbar />
            </div>

            <main className="flex-1 overflow-y-auto p-4">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
