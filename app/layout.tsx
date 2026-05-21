import type { Metadata } from "next";
import { Montserrat_Alternates } from "next/font/google";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { GoogleMapsApiProvider } from "@/contexts/MapProvider";

import Progress from "@/components/Progress";
import { Toaster } from "@/components/ui/toaster";

import "./globals.css";

const inter = Montserrat_Alternates({ weight: "500", subsets: ["cyrillic"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://gemitrek--promptspirit.us-central1.hosted.app"),
  title: {
    default: "GemiTrek - Your Smart Travel Planner",
    template: "%s | GemiTrek",
  },
  description:
    "GemiTrek provides intelligent travel suggestions, personalized itineraries, and seamless trip planning. Plan your perfect trip with ease.",
  keywords:
    "GemiTrek, travel planner, AI travel planner, smart travel, travel suggestions, destination insights, personalized itineraries, trip planning, travel tips, vacation planning",
  openGraph: {
    title: "GemiTrek - Your Smart Travel Planner",
    description:
      "GemiTrek provides intelligent travel suggestions, personalized itineraries, and seamless trip planning. Plan your perfect trip with ease.",
    url: "https://gemitrek--promptspirit.us-central1.hosted.app",
    type: "website",
    siteName: "GemiTrek",
    images: [
      {
        url: "opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "GemiTrek",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <GoogleMapsApiProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            forcedTheme="light"
            disableTransitionOnChange
          >
            <AuthProvider>{children}</AuthProvider>
            <Progress />
            <Toaster />
          </ThemeProvider>
        </GoogleMapsApiProvider>
      </body>
    </html>
  );
}
