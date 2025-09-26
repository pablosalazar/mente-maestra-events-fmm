import type { GenderType, DocumentType } from "@/schemas/userSchema";

export type User = {
  name: string;
  username?: string;
  avatar: string;
  gender: GenderType;
  age: string;
  documentType: DocumentType;
  documentNumber: string;
  department: string;
  municipality: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date;
};

export type UserWithId = User & {
  id: string;
};

export type CreateUser = Omit<
  User,
  "username" | "avatar" | "createdAt" | "updatedAt" | "lastLogin"
>;

// For registration form data (excludes system fields)
export type CreateUserData = Omit<
  User,
  "id" | "createdAt" | "updatedAt" | "lastLogin" | "avatar"
> & {
  avatar?: string;
};
