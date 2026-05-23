[![Header](https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=200&section=header&text=GemiTrek&fontSize=70&fontColor=fff&animation=twinkling&fontAlignY=35&desc=Plan%20Smarter.%20Travel%20Better.%20Powered%20by%20Google%20Gemini.&descAlignY=55&descSize=18)](https://github.com/Mr-Swapnil25/Gdg_FIEM)


<div align="center">
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white" alt="Google Gemini" />
  <img src="https://img.shields.io/badge/Google_Maps-4285F4?style=for-the-badge&logo=googlemaps&logoColor=white" alt="Google Maps" />
  <img src="https://img.shields.io/badge/License-MIT-4CAF50?style=for-the-badge" alt="License" />
  <img src="https://img.shields.io/badge/Made_with_❤️-love-red?style=for-the-badge" alt="Made with love" />
</div>

<br/>

<div align="center">
  <a href="https://github.com/Mr-Swapnil25/Gdg_FIEM">
    <img src="https://img.shields.io/badge/Live_Demo-View%20on%20Repo-00C853?style=for-the-badge" alt="Live Demo" />
  </a>
  <img src="https://img.shields.io/badge/GDG_FIEM-Hackathon-4285F4?style=for-the-badge" alt="GDG FIEM Hackathon" />
</div>

---

<br/>

## 📚 Table of Contents

- [About The Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Keys Setup](#api-keys-setup)
- [Why Google Ecosystem?](#why-google-ecosystem)
- [Team](#team)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

<br/>

---

## 🔍 About The Project

GemiTrek is an energetic AI-first travel planner. It turns simple trip prompts into day-by-day itineraries with verified map locations and expense tracking. Built for speed and reliability using the Google ecosystem, it reduces hallucinations and delivers production-ready JSON itineraries. Perfect for hackathons — fast results, real data, and India-first defaults.

<br/>

---

## ✨ Features

<table>
  <thead>
    <tr><th>Icon</th><th>Feature</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr>
      <td>🤖</td>
      <td>AI Itinerary Generation</td>
      <td>Gemini 2.0 Flash produces JSON itineraries with strict schema validation and a 30s timeout safety net.</td>
    </tr>
    <tr>
      <td>📍</td>
      <td>Interactive Mapping</td>
      <td>Google Maps Places API plots locations and auto-corrects any AI-hallucinated coordinates via live geocoding.</td>
    </tr>
    <tr>
      <td>💸</td>
      <td>Expense Tracking</td>
      <td>Automatic INR (₹) budget calculations with India-specific defaults and regional context.</td>
    </tr>
    <tr>
      <td>🔒</td>
      <td>Secure Authentication</td>
      <td>Firebase Auth powers sign-in/sign-out and per-user Firestore data persistence.</td>
    </tr>
    <tr>
      <td>🔎</td>
      <td>Place Suggestions</td>
      <td>Places Autocomplete with graceful fallback to text input for offline or limited-key scenarios.</td>
    </tr>
    <tr>
      <td>💾</td>
      <td>Trip Saving</td>
      <td>Save full trip objects to Firestore for retrieval, sharing, and editing by the owner.</td>
    </tr>
    <tr>
      <td>🇮🇳</td>
      <td>India-First AI</td>
      <td>All prompts bias INR, km, local cuisine and transport modes for accurate regional results.</td>
    </tr>
  </tbody>
</table>

<br/>

---

## 🧰 Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Radix UI / shadcn
- **Backend:** Next.js Server Actions (secure server layer), Firebase v12 (Auth + Firestore + Storage)
- **AI:** Google Gemini 2.0 Flash (@google/generative-ai)
- **Maps:** Google Maps Places API (@react-google-maps/api)
- **Utilities:** date-fns

<br/>

---

## 🏗️ Architecture Overview

```text
Client (Next.js App Router)
  ├─ UI components (Tailwind, shadcn)
  ├─ Client hooks -> call Server Actions
  └─ Google Maps Places JS (autocomplete + map)

Server (Next.js Server Actions)
  ├─ Validate incoming prompts
  ├─ Call Gemini 2.0 Flash (structured JSON)
  ├─ Geocode & verify coordinates via Google Maps Places API
  └─ Persist trip objects to Firebase Firestore

Storage & Auth
  ├─ Firebase Auth: user sessions
  └─ Firestore: trips, expenses, public plans

AI Safety
  ├─ Strict JSON schema + zod validation
  ├─ 30s generation timeout
  └─ Server-side geocoding to override hallucinated coords
```

<br/>

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- npm or pnpm
- Google Cloud project with Gemini and Maps enabled
- Firebase project (Auth + Firestore + Storage)

<br/>

### Installation

1. Clone the repo

   ```bash
   git clone https://github.com/Mr-Swapnil25/Gdg_FIEM.git
   cd Gdg_FIEM
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Create environment file

   ```bash
   copy .env.example .env.local
   ```

4. Add your API keys (see table below)

5. Run locally

   ```bash
   npm run dev
   ```

<br/>

### Environment Variables

<table>
  <thead>
    <tr><th>Variable</th><th>Required</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td>NEXT_PUBLIC_GEMINI_API_KEY</td><td>Yes</td><td>API key for Google Gemini 2.0 Flash</td></tr>
    <tr><td>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</td><td>Yes</td><td>API key for Google Maps JS & Places API</td></tr>
    <tr><td>NEXT_PUBLIC_FIREBASE_API_KEY</td><td>Yes</td><td>Firebase client API key</td></tr>
    <tr><td>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</td><td>Yes</td><td>Firebase Auth domain</td></tr>
    <tr><td>NEXT_PUBLIC_FIREBASE_PROJECT_ID</td><td>Yes</td><td>Firebase project identifier</td></tr>
    <tr><td>NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET</td><td>Yes</td><td>Firebase Storage bucket (for media)</td></tr>
    <tr><td>NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID</td><td>Yes</td><td>Firebase messaging sender ID</td></tr>
    <tr><td>NEXT_PUBLIC_FIREBASE_APP_ID</td><td>Yes</td><td>Firebase App ID</td></tr>
  </tbody>
</table>

<br/>

---

## 📁 Project Structure

```text
app/                 # Next.js App Router routes and pages
components/          # Reusable UI components
contexts/            # React context providers
hooks/               # Custom hooks
lib/                 # API wrappers, actions, utils
public/              # Static assets (logo: public/gemini-svg.png)
styles/              # Global styles (Tailwind + globals.css)
```

<br/>

---

## 🔐 API Keys Setup

- Google Cloud (Gemini & Maps): https://console.cloud.google.com/ (enable Generative AI API and Maps SDKs)
- Google Gemini docs & quota: https://developers.generativeai.google
- Google Maps Places API: https://developers.google.com/maps/documentation/places/web-service/overview
- Firebase console (Auth & Firestore): https://console.firebase.google.com/

Follow each provider's quickstart to create keys, restrict them to your domain and enable billing for Maps/Gemini.

<br/>

---

## 🤝 Why Google Ecosystem?

We migrated fully into Google. No stitching between providers. Gemini 2.0 Flash gives low-latency, structured JSON outputs perfect for programmatic itineraries. Firebase simplifies auth and real-time persistence. Google Maps protects against spatial hallucinations by verifying coordinates server-side. The result: a tight, fast, secure stack that ships hackathon-winning features fast — especially for India-first travel experiences.

<br/>

---

## 👥 Team

- [Mr-Swapnil25](https://github.com/Mr-Swapnil25) — Lead, AI & System Design
- Team Member 2
- Team Member 3

<br/>

---

## 🤗 Contributing

Love it? Send a PR. Open an issue for big changes. Keep fixes focused and tests green. Friendly, quick reviews.

<br/>

---

## 📜 License

MIT

<br/>

---

## 🙏 Acknowledgements

- GDG FIEM Hackathon
- Google (Gemini, Maps, Firebase)
- Next.js community

<br/>

[![Footer](https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=120&section=footer)](https://github.com/Mr-Swapnil25/Gdg_FIEM)

<div align="center">Made with ❤️ for GDG FIEM Hackathon</div>
