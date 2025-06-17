import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// import { ThemeProvider } from "@/components/theme-provider";
// import { SessionProvider } from "next-auth/react";
// import { ReduxProvider } from "@/components/ReduxProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ErrandMate",
  description: "ErrandsMate team Incorporated",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100`}
        suppressHydrationWarning
      >
        {/* <SessionProvider> */}
        {/* <ReduxProvider> */}
        {/* <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            > */}
        <main className="w-full min-h-[calc(100vh-64px)] p-2">{children}</main>
        {/* </ThemeProvider> */}
        {/* </ReduxProvider> */}
        {/* </SessionProvider> */}
      </body>
    </html>
  );
}
