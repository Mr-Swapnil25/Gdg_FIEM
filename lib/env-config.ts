const readEnv = (value: string | undefined) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export const ENV_CONFIG = {
  GOOGLE_MAPS_API_KEY: readEnv(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY),
  GEMINI_API_KEY: readEnv(process.env.NEXT_PUBLIC_GEMINI_API_KEY),
  FIREBASE_API_KEY: readEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  FIREBASE_AUTH_DOMAIN: readEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  FIREBASE_PROJECT_ID: readEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  FIREBASE_STORAGE_BUCKET: readEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  FIREBASE_MESSAGING_SENDER_ID: readEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  FIREBASE_APP_ID: readEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
};

type FirebaseEnvKey =
  | "NEXT_PUBLIC_FIREBASE_API_KEY"
  | "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
  | "NEXT_PUBLIC_FIREBASE_PROJECT_ID"
  | "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
  | "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
  | "NEXT_PUBLIC_FIREBASE_APP_ID";

export function isGoogleMapsApiKeyMissing() {
  return !ENV_CONFIG.GOOGLE_MAPS_API_KEY;
}

export function isGeminiApiKeyMissing() {
  return !ENV_CONFIG.GEMINI_API_KEY;
}

export function getMissingFirebaseEnvKeys(): FirebaseEnvKey[] {
  const missing: FirebaseEnvKey[] = [];

  if (!ENV_CONFIG.FIREBASE_API_KEY) missing.push("NEXT_PUBLIC_FIREBASE_API_KEY");
  if (!ENV_CONFIG.FIREBASE_AUTH_DOMAIN) missing.push("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN");
  if (!ENV_CONFIG.FIREBASE_PROJECT_ID) missing.push("NEXT_PUBLIC_FIREBASE_PROJECT_ID");
  if (!ENV_CONFIG.FIREBASE_STORAGE_BUCKET) missing.push("NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET");
  if (!ENV_CONFIG.FIREBASE_MESSAGING_SENDER_ID)
    missing.push("NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
  if (!ENV_CONFIG.FIREBASE_APP_ID) missing.push("NEXT_PUBLIC_FIREBASE_APP_ID");

  return missing;
}

export function hasCompleteFirebaseConfig() {
  return getMissingFirebaseEnvKeys().length === 0;
}
