import { getFirestore } from "firebase/firestore";
import { firebaseApp } from "@/config/firebaseConfig";

export const db = getFirestore(firebaseApp);
