import type { Metadata } from "next";
import { DM_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { ClientThemeProvider } from "@/components/client-theme-provider";
import { BackgroundProvider } from "@/contexts/background-context";
import { FaviconHandler } from "@/components/favicon-handler";
import { Analytics } from "@vercel/analytics/next";

const dmMono = DM_Mono({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-dm-mono" });

export const metadata: Metadata = {
  title: "Devadhathan - Product Designer",
  description: "Portfolio of Devadhathan, Product Designer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={dmMono.variable}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          themes={['dark', 'light', 'blue', 'green', 'red', 'glass']}
          enableSystem={false}
        >
          <BackgroundProvider>
            <ClientThemeProvider>
              <FaviconHandler />
              {children}
            </ClientThemeProvider>
          </BackgroundProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
