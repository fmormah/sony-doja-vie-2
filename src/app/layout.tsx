import "@/theme/global.scss";

import type { Metadata } from "next";
import React from "react";

import MobileResizeReload from "@/components/atoms/MobileResizeReload/MobileResizeReload";
import { PageHeader } from "@/components/molecules/PageHeader";
import RotateOverlay from "@/components/molecules/RotateOverlay/RotateOverlay";
import UserDataLogger from "@/components/molecules/UserDataLogger";
import { Footer } from "@/components/organisms/Footer";
import AuthProviders from "@/contexts/AuthProviders";
import { AppStoreProvider } from "@/store/AppStore";
import { FONT_VARIABLES } from "@/theme/fonts";


export const metadata: Metadata = {
  title: "Doja Cat: Club Vie",
  description: "Connect your Spotify and prepare for the club.",
  openGraph: {
    images: ["https://vie.dojacat.com/og-hero.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["https://vie.dojacat.com/og-hero.jpg"],
  },
};

interface Props {
  children: React.ReactNode;
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://cdn.fonts.net" />
        <link
          rel="stylesheet"
          href="https://cdn.fonts.net/kit/cb3c34e4-1fb7-422b-bdba-51c4665e58e8/cb3c34e4-1fb7-422b-bdba-51c4665e58e8_enhanced.css"
        />
        <script
          async
          src="https://cdn.fonts.net/kit/cb3c34e4-1fb7-422b-bdba-51c4665e58e8/cb3c34e4-1fb7-422b-bdba-51c4665e58e8_enhanced.js"
        />
      </head>
      <body className={FONT_VARIABLES}>
        <AppStoreProvider>
          <AuthProviders>
            <UserDataLogger />
            <PageHeader src="/assets/images/dc-logo.svg" alt="Dojacat" />
            <RotateOverlay />
            <MobileResizeReload />
            {children}
            <Footer />
          </AuthProviders>
        </AppStoreProvider>
      </body>
    </html>
  );
}
