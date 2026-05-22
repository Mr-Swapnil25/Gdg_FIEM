<p align="center">
  <img src="public/gemini-svg.png" width="200" alt="GemiTrek Logo" />
  <br/>
  <em>Plan Smarter. Travel Better. Powered by Google Gemini.</em>
</p>

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=googlebard&logoColor=white)
![Google Maps](https://img.shields.io/badge/Google_Maps-4285F4?style=for-the-badge&logo=googlemaps&logoColor=white)

GemiTrek is a high-performance, AI-driven travel planning application that autonomously generates detailed, location-aware itineraries. By tightly integrating the Google Gemini 2.5 Flash API with Google Maps Places data, it constructs accurate daily schedules while mitigating hallucinatory routing errors. The platform also enables communal itinerary sharing, collaborative editing, and real-time expense tracking.

[**View Live Demo**](#)

## Core Features

| Icon | Feature | Description |
|---|---|---|
| 🤖 | AI Itinerary Generation | Deterministic routing and destination insights generated via Gemini 2.5 Flash. |
| 📍 | Geospatial Verification | Real-time map plotting and coordinate resolution using the Google Maps Places API. |
| 👥 | Collaborative Planning | Invite companions to view or edit itineraries securely via Firebase Auth and Firestore. |
| 🧮 | Expense Ledger | Built-in module for tracking category-based expenditures and managing trip budgets. |
| 🌐 | Community Feed | A public catalog of optimized travel plans that users can browse and clone. |

## Tech Stack

- **Next.js 14**: Chosen for hybridized App Router capabilities and protected server actions.
- **TypeScript**: Enforces strict shapes over LLM-generated JSON to eliminate runtime parser crashes.
- **Tailwind CSS**: Enables rapid, utility-first UI construction without CSS bloat.
- **Firebase**: Native Firestore syncs multi-user edits instantly, while Firebase Auth locks down session states.
- **Google Gemini 2.5 Flash**: Delivers rapid, structured JSON inference required for programmatic routing at scale.
- **Google Maps Places API**: Intercepts AI-hallucinated coordinates and geocodes them into verified map markers.

## Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/GemiTrek.git
   cd GemiTrek
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (Copy `.env.sample` to `.env.local` and add your keys):
   ```bash
   cp .env.sample .env.local
   ```

4. Instantiate the local development server:
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_GEMINI_API_KEY` | Yes | API credential for Gemini 2.5 Flash models. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Yes | Access key targeting Google Maps Places and JS SDK APIs. |
| `NEXT_PUBLIC_GOOGLE_WEATHER_API_KEY` | Yes | Google Weather API key used by the weather section. |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Target Google Cloud project client API key. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | Associated Firebase Auth endpoint domain. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Google Cloud Platform project identifier. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | No | Cloud storage bucket string (if managing media). |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | FCM configuration integer. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | Unique Firebase client application UUID. |

## Project Structure

```text
GemiTrek/
├── app/                     # Next.js 14 App Router entry points
│   ├── community-plans/     # Public itinerary discovery feed route
│   ├── dashboard/           # User's private trips overview and analytics
│   └── plans/               # Dynamic routes for collaboration and tracking
├── components/              # Isolated React UI components and layouts
│   ├── common/              # Global widgets (Authentication, Headers, Drawers)
│   └── shared/              # Reusable complex UX elements
├── lib/                     # Server-side business logic and integrations
│   ├── actions/             # Next.js Server Actions handling secure mutations
│   └── firebase/            # Firebase Admin logic and SDK bindings
├── contexts/                # Top-level React Providers shaping global state
└── hooks/                   # Custom Hooks extracting interface logic
```

## Screenshots

![GemiTrek Dashboard Image Placeholder](https://via.placeholder.com/800x400.png?text=GemiTrek+Dashboard)

## GDG Hackathon Context

GemiTrek was architected to fully leverage the interconnected Google Cloud environment to eliminate the major friction points of multi-user travel planning. Travel apps that rely on disparate APIs face latency drops, schema breakages, and unverified data. 

To solve this, we employed **Google Gemini 2.5 Flash** for its exceptional structured JSON generation capacity. Because raw LLMs often face "spatial hallucinations" (generating mathematically invalid routes), we coupled Gemini directly with the **Google Maps Places API** server-side, fetching real-time verification before the user ever sees the route. State management and identity provisioning were implemented via **Firebase Auth** and **Firestore** to sidestep conventional relational bottlenecks, allowing us to build instantaneous collaborative itinerary syncing (`/collaborate`) and multi-user live ledgers (`/expense-tracker`). Eliminating non-Google APIs allowed us to streamline configuration boundaries and achieve maximum application velocity tailored for the GDG ecosystem.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to test or restructure.

## License
[MIT](https://choosealicense.com/licenses/mit/)
