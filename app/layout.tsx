import type { Metadata } from "next";
import { DM_Mono, IBM_Plex_Sans, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { ClientThemeProvider } from "@/components/client-theme-provider";
import { Analytics } from "@vercel/analytics/next";

const dmMono = DM_Mono({ subsets: ["latin"], weight: ["300", "400", "500"], variable: "--font-dm-mono" });
const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-neue-montreal" });
const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-google-plex-sans",
});

export const metadata: Metadata = {
  title: "Devadhathan - Product Designer",
  description: "Portfolio of Devadhathan, Product Designer",
  icons: {
    icon: [
      { url: "/photos/Image@4x.png", type: "image/png" },
    ],
    apple: [
      { url: "/photos/Image@4x.png", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${dmMono.variable} ${inter.variable} ${ibmPlexSans.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          themes={['dark', 'light', 'blue', 'green', 'red']}
          enableSystem={false}
        >
          <ClientThemeProvider>
            {children}
          </ClientThemeProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
