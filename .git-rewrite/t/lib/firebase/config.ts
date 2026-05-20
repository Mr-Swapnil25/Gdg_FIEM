import {getApp, getApps, initializeApp} from "firebase/app";
import {browserLocalPersistence, getAuth, setPersistence} from "firebase/auth";
import {getFirestore} from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCriToueLXKW-tDdUp0L0PKsjZo2ACjHjc",
  authDomain: "promptspirit.firebaseapp.com",
  projectId: "promptspirit",
  storageBucket: "promptspirit.firebasestorage.app",
  messagingSenderId: "577964155956",
  appId: "1:577964155956:web:8aafa45fb7279974581661",
  measurementId: "G-2SMV89JZD8",
};

export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(firebaseApp);
// Set the auth persistence to local storage
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Firebase persistence error:", error);
});

export const db = getFirestore(firebaseApp);

export default firebaseApp;
