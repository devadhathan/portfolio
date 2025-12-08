import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { ClientThemeProvider } from "@/components/client-theme-provider";
import { BackgroundProvider } from "@/contexts/background-context";
import { FaviconHandler } from "@/components/favicon-handler";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          themes={['dark', 'light', 'blue', 'green', 'purple', 'glass']}
          enableSystem={false}
        >
          <BackgroundProvider>
            <ClientThemeProvider>
              <FaviconHandler />
              {children}
            </ClientThemeProvider>
          </BackgroundProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

