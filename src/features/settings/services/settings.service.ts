import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firestore";
import type { GameSettings } from "@/types";

export class SettingsService {
  static async get(): Promise<GameSettings> {
    const ref = doc(db, "config", "gameSettings");
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      throw new Error("Game settings not found in Firestore");
    }

    return snap.data() as GameSettings;
  }

  static async setCode(activityCode: string | null) {
    const ref = doc(db, "config", "gameSettings");
    await updateDoc(ref, { activityCode });
  }
}
