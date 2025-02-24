import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthStore = {
  token: string | null;
  username: string | null;
  setToken: (token: string | null) => void;
  setUsername: (username: string | null) => void;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      username: null,
      setToken: (token) => set({ token }),
      setUsername: (username) => set({ username }),
    }),
    {
      name: "auth-storage",
    }
  )
);
