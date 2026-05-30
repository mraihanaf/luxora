import type { Metadata } from "next";
import { Geist, Libre_Caslon_Text, Space_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart/CartProvider";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";
import { LuxoraCursor } from "@/components/fx/LuxoraCursor";
import { LuxoraNav } from "@/components/nav/LuxoraNav";
import { LuxoraFooter } from "@/components/nav/LuxoraFooter";

const luxoraUi = Geist({
  variable: "--font-luxora-ui",
  subsets: ["latin"],
});

const luxoraDisplay = Libre_Caslon_Text({
  variable: "--font-luxora-display",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const luxoraMono = Space_Mono({
  variable: "--font-luxora-mono",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Luxora",
  description: "Where fashion meets intelligence. Where luxury breathes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${luxoraUi.variable} ${luxoraDisplay.variable} ${luxoraMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <a href="#main" className="luxora-skip-link">
          Skip to content
        </a>
        <ThemeProvider>
          <CartProvider>
            <div className="luxora-shell luxora-noise flex min-h-full flex-col">
              <LuxoraCursor />
              <LuxoraNav />
              <main id="main" tabIndex={-1} className="flex-1 pt-24">
                {children}
              </main>
              <LuxoraFooter />
            </div>
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
