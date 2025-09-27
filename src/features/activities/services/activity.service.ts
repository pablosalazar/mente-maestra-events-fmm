import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import type {
  Activity,
  ActivityCreate,
  ActivityUpdate,
} from "../schemas/activity";
import { db } from "@/lib/firestore";

export class ActivityService {
  static async getAll(): Promise<Activity[] | null> {
    try {
      const q = query(collection(db, "activities"), orderBy("date", "desc"));
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

  static async getByCode(code: string): Promise<Activity | null> {
    const activityCollections = collection(db, "activities");
    const q = query(activityCollections, where("code", "==", code));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const docSnapshot = querySnapshot.docs[0];
    const data = docSnapshot.data();

    return {
      id: docSnapshot.id,
      ...data,
      // Convert Firestore Timestamp to JavaScript Date
      date:
        data.date instanceof Timestamp
          ? data.date.toDate()
          : new Date(data.date),
    } as Activity;
  }

  static async create(data: ActivityCreate) {
    const existingActivity = await ActivityService.getByCode(data.code);
    if (existingActivity) {
      throw new Error("El codígo de la actividad ya existe");
    }
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
