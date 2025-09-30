import {
  addDoc,
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import type { Activity, ActivityCreate, ActivityUpdate } from "../types";
import { db } from "@/lib/firestore";

export class ActivityService {
  static async getAll(): Promise<Activity[] | null> {
    try {
      const q = query(collection(db, "activities"), orderBy("date", "asc"));
      const querySnapshot = await getDocs(q);
      const activities = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Convert Firestore Timestamp to JavaScript Date
          date:
            data.date instanceof Timestamp
              ? data.date.toDate()
              : new Date(data.date),
        } as Activity;
      });
      return activities;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  static async create(data: ActivityCreate) {
    const docRef = await addDoc(collection(db, "activities"), data);
    return docRef.id;
  }

  static async update(data: ActivityUpdate) {
    const { id, ...rest } = data;

    await updateDoc(doc(db, "activities", id), rest);
  }

  static async delete(id: string) {
    await deleteDoc(doc(db, "activities", id));
  }
}
