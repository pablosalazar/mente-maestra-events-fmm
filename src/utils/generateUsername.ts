export function generateUsername(
  fullName: string,
  documentNumber: string
): string {
  const firstName = fullName.trim().split(" ")[0].toLowerCase();
  const capitalizedFirstName =
    firstName.charAt(0).toUpperCase() + firstName.slice(1);
  const lastFiveDigits = documentNumber.slice(-5);
  return `${capitalizedFirstName}${lastFiveDigits}`;
}
