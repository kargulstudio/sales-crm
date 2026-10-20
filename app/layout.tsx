import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, pageMetadata } from "@/lib/seo";
import ScrollToTop from "@/components/_common/scroll-to-top";
import Toaster from "@/components/_common/toaster";
import { TooltipProvider } from "@/components/_ui/tooltip";
import MotionProvider from "@/components/_common/motion-provider";
import ConvexProvider from "@/components/_common/convex-provider";
import { THEME_SCRIPT } from "@/lib/theme-script";
import { SIDEBAR_WIDTH_SCRIPT } from "@/lib/sidebar";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...pageMetadata({
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    path: "/",
  }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `history.scrollRestoration="manual";${THEME_SCRIPT};${SIDEBAR_WIDTH_SCRIPT}`,
          }}
        />
      </head>
      <body className="relative z-0 font-sans antialiased">
        <ConvexProvider>
          <MotionProvider>
            <TooltipProvider>
              <ScrollToTop />
              {children}
              <Toaster />
            </TooltipProvider>
          </MotionProvider>
        </ConvexProvider>
      </body>
    </html>
  );
}
