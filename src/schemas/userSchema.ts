import { z } from "zod";
import { errorMessages } from "@/constants/errorMessages";

export const GenderType = z.enum(["Masculino", "Femenino"], {
  message: errorMessages.selectRequired,
});

export const DocumentTypeEnum = z.enum(["C.C", "T.I", "C.E"], {
  message: errorMessages.selectRequired,
});

export const loginSchema = z.object({
  documentNumber: z
    .string()
    .min(1, errorMessages.required)
    .refine((val) => !isNaN(Number(val)), errorMessages.numeric),
});

export const registerSchema = z
  .object({
    name: z.string().min(1, errorMessages.required),
    gender: GenderType,
    age: z
      .string()
      .min(1, errorMessages.required)
      .refine((val) => !isNaN(Number(val)), errorMessages.numeric),
    documentType: DocumentTypeEnum,
    documentNumber: z
      .string()
      .min(1, errorMessages.required)
      .refine((val) => !isNaN(Number(val)), errorMessages.numeric),
    repeatedDocumentNumber: z.string().min(1, errorMessages.required),
    department: z.string().min(1, errorMessages.required),
    municipality: z.string().min(1, errorMessages.required),
    acceptTerms: z
      .boolean()
      .refine((val) => val === true, errorMessages.acceptTerms),
  })
  .superRefine((data, ctx) => {
    if (data.documentNumber !== data.repeatedDocumentNumber) {
      ctx.addIssue({
        code: "custom",
        path: ["repeatedDocumentNumber"],
        message: errorMessages.documentMatch,
      });
    }
  });

export type GenderType = z.infer<typeof GenderType>;
export type DocumentType = z.infer<typeof DocumentTypeEnum>;
export type LoginData = z.infer<typeof loginSchema>;
export type RegisterData = z.infer<typeof registerSchema>;
