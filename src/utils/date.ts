import type { Timestamp } from "firebase/firestore";

export function formatDateToSpanishIntl(
  date: Date | Timestamp | null | undefined
): string {
  if (!date) return "";

  const dateObj = date instanceof Date ? date : new Date(date.toDate());

  if (isNaN(dateObj.getTime())) return "";

  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dateObj);
}
