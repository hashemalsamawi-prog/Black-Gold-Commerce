import { useState, useEffect } from "react";
import type { Customer } from "@workspace/api-client-react/generated";

interface AuthState {
  token: string | null;
  customer: Customer | null;
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = localStorage.getItem("bg_customer_session");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return { token: null, customer: null };
      }
    }
    return { token: null, customer: null };
  });

  const login = (token: string, customer: Customer) => {
    const state = { token, customer };
    setAuth(state);
    localStorage.setItem("bg_customer_session", JSON.stringify(state));
  };

  const logout = () => {
    setAuth({ token: null, customer: null });
    localStorage.removeItem("bg_customer_session");
  };

  return { ...auth, isAuthenticated: !!auth.token, login, logout };
}
