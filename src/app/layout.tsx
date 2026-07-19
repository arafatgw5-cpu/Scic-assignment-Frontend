import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ConditionalFooter } from "@/components/layout/ConditionalFooter"; 
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "SkillPilot AI | Your AI Career Coach",
  description: "AI-powered career development platform for resumes, coaching, and growth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <ConditionalFooter />
        </ThemeProvider>
      </body>
    </html>
  );
}