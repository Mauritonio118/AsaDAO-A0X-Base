'use client';

import type React from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Providers } from "../components/providers";
import { useEffect } from "react";
import { sdk } from "@farcaster/miniapp-sdk";
import "./globals.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    const showApp = async () => {
      try {
        await sdk.actions.ready();
        console.log("MiniApp is ready and splash screen hidden ✅");
      } catch (err) {
        console.error("Error calling sdk.actions.ready()", err);
      }
    };

    showApp();
  }, []);

  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}