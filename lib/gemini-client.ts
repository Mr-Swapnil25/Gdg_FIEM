import TripItinerarySchema, { TripItinerary } from "./schemas";

// Lightweight wrapper around the Google Generative AI client.
// This file assumes `@google/generative-ai` is installed and that
// `process.env.NEXT_PUBLIC_GEMINI_API_KEY` contains a valid key.

type GenerateOptions = {
  model?: string;
  temperature?: number;
};

const DEFAULT_MODEL = "gemini-1.5-flash";

async function getClient() {
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_GEMINI_API_KEY");
  }
  return new GoogleGenerativeAI(apiKey);
}

export async function generateTripWithGemini(
  prompt: string,
  preferences?: Record<string, unknown>,
  options?: GenerateOptions
): Promise<TripItinerary> {
  const client = await getClient();
  const model = options?.model || DEFAULT_MODEL;

  const fullPrompt = buildPrompt(prompt, preferences);

  try {
    const generativeModel = client.getGenerativeModel({
      model,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: options?.temperature ?? 0.2,
      },
    });

    const result = await generativeModel.generateContent(fullPrompt);
    const parsed = safeJsonParse(result.response.text());
    assertTripItinerary(parsed);
    return parsed;
  } catch (err) {
    console.error("GEMINI API ERROR:", err);
    throw err;
  }
}

function buildPrompt(base: string, preferences?: Record<string, unknown>) {
  let prompt = `${base}

India-specific rules:
- Use INR (Indian rupees) for every financial or budget value. Do not use any foreign currency.
- Use kilometres and metric units for every distance, speed, visibility, and route estimate.
- Prefer Indian destinations, local transport, trains, metros, buses, autos, realistic domestic food costs, and regional seasonality.
- Bias map/place recommendations toward Indian search context where destination ambiguity exists.

Return a JSON object that matches this JSON schema exactly:
${JSON.stringify(TripItinerarySchema)}

Do not return markdown or any additional text.`;
  if (preferences && Object.keys(preferences).length > 0) {
    prompt += `\n\nPreferences:\n${JSON.stringify(preferences)}`;
  }
  return prompt;
}

function safeJsonParse(text: string): unknown {
  try {
    // Some LLMs include surrounding text; attempt to extract the first JSON object.
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    const maybeJson = firstBrace !== -1 && lastBrace !== -1 ? text.slice(firstBrace, lastBrace + 1) : text;
    return JSON.parse(maybeJson);
  } catch (e) {
    // Re-throw with context.
    throw new Error(`Failed to parse JSON from Gemini response: ${String(e)}\nResponse text:\n${text}`);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function assertTripItinerary(value: unknown): asserts value is TripItinerary {
  if (!isRecord(value)) {
    throw new Error("Gemini response is not an object.");
  }

  const itinerary = value.itinerary;
  const topPlacesToVisit = value.topPlacesToVisit;

  if (
    typeof value.aboutThePlace !== "string" ||
    typeof value.bestTimeToVisit !== "string" ||
    !isStringArray(value.adventuresActivitiesToDo) ||
    !isStringArray(value.localCuisineRecommendations) ||
    !isStringArray(value.packingChecklist)
  ) {
    throw new Error("Gemini response is missing required top-level itinerary fields.");
  }

  if (!Array.isArray(itinerary)) {
    throw new Error("Gemini response itinerary must be an array.");
  }

  for (const day of itinerary) {
    if (!isRecord(day) || typeof day.title !== "string" || !isRecord(day.activities)) {
      throw new Error("Gemini itinerary day has an invalid shape.");
    }

    const {morning, afternoon, evening} = day.activities;
    const slots = [morning, afternoon, evening];

    for (const slot of slots) {
      if (!Array.isArray(slot)) {
        throw new Error("Gemini itinerary activity slot must be an array.");
      }
      for (const item of slot) {
        if (
          !isRecord(item) ||
          typeof item.itineraryItem !== "string" ||
          typeof item.briefDescription !== "string"
        ) {
          throw new Error("Gemini itinerary item has an invalid shape.");
        }
      }
    }
  }

  if (!Array.isArray(topPlacesToVisit)) {
    throw new Error("Gemini topPlacesToVisit must be an array.");
  }

  for (const place of topPlacesToVisit) {
    if (
      !isRecord(place) ||
      typeof place.name !== "string" ||
      !isRecord(place.coordinates) ||
      typeof place.coordinates.lat !== "number" ||
      typeof place.coordinates.lng !== "number"
    ) {
      throw new Error("Gemini top place item has an invalid shape.");
    }
  }
}

export default {
  generateTripWithGemini,
};
