import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firestore";
import type { GameSettings } from "@/types";

export async function getGameSettings(): Promise<GameSettings> {
  const ref = doc(db, "config", "gameSettings");
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error("Game settings not found in Firestore");
  }

  return snap.data() as GameSettings;
}
