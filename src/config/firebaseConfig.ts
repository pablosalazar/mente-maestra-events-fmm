import { initializeApp } from "firebase/app";

const isBrowser = typeof window !== "undefined";
if (!isBrowser) {
  process?.loadEnvFile();
}

const firebaseConfig = {
  apiKey: isBrowser
    ? import.meta.env.VITE_FIREBASE_API_KEY
    : process.env.VITE_FIREBASE_API_KEY,
  // authDomain: "mente-maestra-events-fmm.firebaseapp.com",
  projectId: "mente-maestra-events-fmm",
  // storageBucket: "mente-maestra-events-fmm.appspot.com",
  // messagingSenderId: "512230906077",
  appId: isBrowser
    ? import.meta.env.VITE_FIREBASE_APP_ID
    : process.env.VITE_FIREBASE_APP_ID,
};

// Singleton pattern – don’t re-initialize
export const firebaseApp = initializeApp(firebaseConfig);
