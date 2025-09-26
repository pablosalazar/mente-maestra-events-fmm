import { initializeApp } from "firebase/app";

const isBrowser = typeof window !== "undefined";
if (!isBrowser) {
  process?.loadEnvFile();
}

const firebaseConfig = {
  apiKey: isBrowser
    ? import.meta.env.VITE_FIREBASE_API_KEY
    : process.env.VITE_FIREBASE_API_KEY,
  authDomain: "mente-maestra-schools-fmm.firebaseapp.com",
  projectId: "mente-maestra-schools-fmm",
  storageBucket: "mente-maestra-schools-fmm.appspot.com",
  messagingSenderId: "777000608666",
  appId: isBrowser
    ? import.meta.env.VITE_FIREBASE_APP_ID
    : process.env.VITE_FIREBASE_APP_ID,
};

// Singleton pattern – don’t re-initialize
export const firebaseApp = initializeApp(firebaseConfig);
