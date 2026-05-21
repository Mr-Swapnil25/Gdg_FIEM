import Dashboard from "@/components/dashboard/Dashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
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
        url: "https://gemitrek--promptspirit.us-central1.hosted.app/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "GemiTrek",
      },
    ],
  },
};

export default function DashboardPage() {
  return <Dashboard />;
}
