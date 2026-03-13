import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/query-provider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ManyHandz — Many hands make light work",
  description:
    "Household chore coordination and accountability. Create shared chore boards, auto-rotate tasks, track completion with photo proof, and generate fairness scores.",
  manifest: "/manifest.json",
  openGraph: {
    title: "ManyHandz",
    description: "Household chore coordination and accountability app",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366f1",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster
              position="top-center"
              toastOptions={{
                className: "bg-card text-card-foreground border-border",
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
