import { doc, setDoc } from "firebase/firestore";

import { db } from "@/lib/firestore";
import { settings } from "@/constants/settings";

export async function seedGameSettings() {
  const settingsRef = doc(db, "config", "gameSettings");
  await setDoc(settingsRef, settings);
  console.log("✅ Game settings seeded successfully");
}

// Función para limpiar y recrear toda la data
export async function seedAllData() {
  try {
    console.log("🌱 Starting data seeding...");

    await seedGameSettings();

    console.log("🎉 All data seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  }
}

// Ejecutar el seed completo (descomenta para usar)
seedAllData().catch(console.error);
// Add this line to actually execute the function
// seedGameSettings().catch(console.error);
// seedRooms().catch(console.error);
