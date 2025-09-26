import { createContext, useState, type ReactNode } from "react";
import type { UserWithId } from "@/types";

export interface AuthContextType {
  user: UserWithId | null;
  setUser: (user: UserWithId | null) => void;
  login: (user: UserWithId) => void;
  logout: () => void;
  updateAvatar: (avatar: string) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithId | null>(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      return null;
    }
  });

  const login = (userData: UserWithId) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateAvatar = (avatar: string) => {
    if (!user) {
      throw new Error("No user logged in");
    }

    const updatedUser = { ...user, avatar };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const isAuthenticated = user !== null;

  const value: AuthContextType = {
    user,
    setUser,
    login,
    logout,
    updateAvatar,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
