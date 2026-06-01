import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/context/ThemeContext";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FirebaseMessagingInitializer } from "@/components/FirebaseMessagingInitializer";
import { Toaster } from "sonner";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://vesto.app'),
  title: {
    default: 'Vesto — Akıllı Moda Asistanı',
    template: '%s | Vesto',
  },
  description:
    'Gardırobunu yönet, yapay zeka ile kombin önerileri al, '
    + 'stilist topluluğuyla buluş.',
  keywords: [
    'moda', 'gardırop', 'kombin', 'stilist', 'yapay zeka', 'kıyafet'
  ],
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Vesto',
    title: 'Vesto — Akıllı Moda Asistanı',
    description:
      'Gardırobunu yönet, yapay zeka ile kombin önerileri al.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Vesto',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vesto — Akıllı Moda Asistanı',
    description: 'Gardırobunu yönet, yapay zeka ile kombin önerileri al.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { WebVitals } from "@/components/WebVitals";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning className={`${playfair.variable} ${inter.variable}`}>
      <body>
        <WebVitals />
        <ThemeProvider>
          <AuthProvider>
            <FirebaseMessagingInitializer />
            <TooltipProvider>{children}</TooltipProvider>
            <Toaster richColors position="top-center" />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
