import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthResponse, User } from "../types/types.bd";

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (session: AuthResponse) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: ({ token, user }) =>
        set({ token, user, isAuthenticated: Boolean(token) }),
      logout: () =>
        set({ token: null, user: null, isAuthenticated: false }),
    }),
    {
      name: "auctionhub-auth",
      storage: createJSONStorage(() => sessionStorage),
      partialize: ({ token, user, isAuthenticated }) => ({
        token,
        user,
        isAuthenticated,
      }),
    },
  ),
);
