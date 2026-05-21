/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: "AIzaSyCriToueLXKW-tDdUp0L0PKsjZo2ACjHjc",
    NEXT_PUBLIC_GEMINI_API_KEY: "AIzaSyCriToueLXKW-tDdUp0L0PKsjZo2ACjHjc",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "openweathermap.org",
        port: "",
      },
    ],
  },
};

module.exports = nextConfig;
