
import type { Metadata } from "next";
import { Manrope, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import "./dark-mode.css";
import TrackPageView from "../components/TrackPageView";
import PreferencesProvider from "../components/PreferencesProvider";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tempulli",
  description: "Portal informativ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="sq"
      suppressHydrationWarning
      className={`${manrope.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">

        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-KX926FTN0S"
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-KX926FTN0S');
          `}
        </Script>

        <PreferencesProvider>
          <TrackPageView />
          {children}
        </PreferencesProvider>

      </body>
    </html>
  );
}
