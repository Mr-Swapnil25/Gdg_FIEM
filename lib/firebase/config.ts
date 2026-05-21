import {getApp, getApps, initializeApp} from "firebase/app";
import {browserLocalPersistence, getAuth, setPersistence, type Auth} from "firebase/auth";
import {getFirestore} from "firebase/firestore";
import {getStorage} from "firebase/storage";

import {ENV_CONFIG, getMissingFirebaseEnvKeys} from "@/lib/env-config";

export const missingFirebaseEnvKeys = getMissingFirebaseEnvKeys();

if (missingFirebaseEnvKeys.length > 0) {
  console.error(
    `[firebase/config] Missing Firebase environment variables: ${missingFirebaseEnvKeys.join(", ")}`
  );
}

const firebaseConfig = {
  apiKey: ENV_CONFIG.FIREBASE_API_KEY ?? "",
  authDomain: ENV_CONFIG.FIREBASE_AUTH_DOMAIN ?? "",
  projectId: ENV_CONFIG.FIREBASE_PROJECT_ID ?? "",
  storageBucket: ENV_CONFIG.FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: ENV_CONFIG.FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: ENV_CONFIG.FIREBASE_APP_ID ?? "",
};

export let firebaseInitError: string | null =
  missingFirebaseEnvKeys.length > 0
    ? `Missing Firebase environment variables: ${missingFirebaseEnvKeys.join(", ")}`
    : null;

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

function initializeAuthSafely(): Auth | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return getAuth(app);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown Firebase Auth initialization error.";
    firebaseInitError = firebaseInitError ?? `Firebase Auth initialization failed: ${errorMessage}`;
    console.error("Firebase auth initialization error:", error);
    return null;
  }
}

export const auth = initializeAuthSafely();
export const db = getFirestore(app);
export const storage = getStorage(app);

if (typeof window !== "undefined" && auth && !firebaseInitError) {
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error("Firebase persistence error:", error);
  });
}

export default app;
