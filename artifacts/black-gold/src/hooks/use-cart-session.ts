import { useState, useEffect } from "react";

export function useCartSession() {
  const [sessionId, setSessionId] = useState<string>(() => {
    const saved = localStorage.getItem("bg_cart_session");
    if (saved) return saved;
    const newSession = crypto.randomUUID();
    localStorage.setItem("bg_cart_session", newSession);
    return newSession;
  });

  return sessionId;
}
