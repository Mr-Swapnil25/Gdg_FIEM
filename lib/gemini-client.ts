import TripItinerarySchema, {TripItinerary} from "./schemas";
import {ENV_CONFIG} from "./env-config";

type GenerateOptions = {
  temperature?: number;
  timeoutMs?: number;
};

export type GeminiGenerationErrorCode =
  | "MISSING_GEMINI_API_KEY"
  | "GEMINI_TIMEOUT"
  | "PARSE_ERROR"
  | "GEMINI_INVALID_RESPONSE"
  | "GEMINI_REQUEST_FAILED";

const GEMINI_MODEL = "gemini-2.5-flash";
const DEFAULT_TIMEOUT_MS = 30_000;

export class GeminiGenerationError extends Error {
  code: GeminiGenerationErrorCode;
  rawResponse?: string;

  constructor(
    code: GeminiGenerationErrorCode,
    message: string,
    options?: {cause?: unknown; rawResponse?: string}
  ) {
    super(message);
    this.name = "GeminiGenerationError";
    this.code = code;
    this.rawResponse = options?.rawResponse;
    if (options?.cause) {
      (this as Error & {cause?: unknown}).cause = options.cause;
    }
  }
}

async function getClient() {
  const {GoogleGenerativeAI} = await import("@google/generative-ai");
  const apiKey = ENV_CONFIG.GEMINI_API_KEY;

  if (!apiKey) {
    throw new GeminiGenerationError(
      "MISSING_GEMINI_API_KEY",
      "Missing NEXT_PUBLIC_GEMINI_API_KEY."
    );
  }

  return new GoogleGenerativeAI(apiKey);
}


function normalizeGeminiError(error: unknown) {
  if (error instanceof GeminiGenerationError) return error;
  return new GeminiGenerationError(
    "GEMINI_REQUEST_FAILED",
    error instanceof Error ? error.message : "Gemini request failed.",
    {cause: error}
  );
}

async function geminiCall(
  prompt: string,
  preferences?: Record<string, unknown>,
  options?: GenerateOptions
) {
  const client = await getClient();
  const model = client.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: options?.temperature ?? 0.2,
    },
  });

  const fullPrompt = buildPrompt(prompt, preferences);
  const result = await model.generateContent(fullPrompt);
  const rawText = result.response.text().trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch (parseError) {
    console.error("Raw Gemini output:", rawText);
    throw new GeminiGenerationError(
      "PARSE_ERROR",
      "AI returned unexpected format. Please retry.",
      {cause: parseError, rawResponse: rawText}
    );
  }

  try {
    assertTripItinerary(parsed);
  } catch (shapeError) {
    throw new GeminiGenerationError(
      "GEMINI_INVALID_RESPONSE",
      "Gemini response is missing required itinerary fields.",
      {cause: shapeError, rawResponse: rawText}
    );
  }

  return parsed;
}

export async function generateTripWithGemini(
  prompt: string,
  preferences?: Record<string, unknown>,
  options?: GenerateOptions
): Promise<TripItinerary> {
  let timeoutTimer: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    const ms = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    timeoutTimer = setTimeout(() => {
      reject(new GeminiGenerationError("GEMINI_TIMEOUT", `Gemini request timed out after ${ms}ms.`));
    }, ms);
  });

  try {
    return await Promise.race([
      geminiCall(prompt, preferences, options),
      timeoutPromise,
    ]);
  } catch (error: any) {
    console.error("CRITICAL FETCH ERROR:", error?.message, error?.stack);
    throw normalizeGeminiError(error);
  } finally {
    if (timeoutTimer) clearTimeout(timeoutTimer);
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

Respond with ONLY a valid JSON object. No markdown, no code fences, no explanation. Start directly with { and end with }.`;

  if (preferences && Object.keys(preferences).length > 0) {
    prompt += `\n\nPreferences:\n${JSON.stringify(preferences)}`;
  }

  return prompt;
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
