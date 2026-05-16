import { create } from "zustand";
import { api } from "../api/client";
import type { User } from "../types/slate";

type AuthStatus = "loading" | "signed-in" | "signed-out";

type AuthState = {
  status: AuthStatus;
  user: User | null;
  loadUser: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  status: "loading",
  user: null,
  loadUser: async () => {
    try {
      const user = await api.me();
      set({ status: "signed-in", user });
    } catch {
      set({ status: "signed-out", user: null });
    }
  }
}));
