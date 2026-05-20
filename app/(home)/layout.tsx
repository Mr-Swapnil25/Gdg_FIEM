import type { Metadata } from "next";
import Header from "@/components/home/Header";
export const metadata: Metadata = {
  metadataBase: new URL("https://gemitrek.app"),
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
    url: "https://gemitrek.app",
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
    <>
      <Header />
      <main className="flex h-[calc(100svh-4rem)] flex-col items-center justify-center bg-blue-50/40 p-10 mx-auto">
        {children}
      </main>

    </>
  );
}
