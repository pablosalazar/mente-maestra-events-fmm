export const errorMessages = {
  required: "Este campo es requerido",
  numeric: "Este campo debe ser un número",
  selectRequired: "Selecciona una opción",
  acceptTerms: "Acepta la política y autorización de datos personales",
  documentMatch: "Los números de documento no coinciden",
  maxLength: (max: number) => `Máximo ${max} letras`,
  minLength: (min: number) => `Mínimo ${min} letras`,
  dateFormat: "Formato de fecha inválido",
};
