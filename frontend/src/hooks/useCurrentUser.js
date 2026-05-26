import { useState, useEffect, useCallback } from "react";

export default function useCurrentUser() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);

    // bazujemy już wyłącznie na fladze statusu logowania
    if (!localStorage.getItem("isAuthenticated")) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/auth/me", {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // odbieramy to z HttpOnly Cookies
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("isAuthenticated");
        }
        throw new Error("Failed to fetch current user");
      }

      const data = await res.json();
      setUser(data);
    } catch (err) {
      setError(err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(fetchUser);

    // Nasłuchiwanie na globalne zdarzenie odświeżenia danych użytkownika
    window.addEventListener("user-updated", fetchUser);
    return () => window.removeEventListener("user-updated", fetchUser);
  }, [fetchUser]);

  return { user, loading, error, refresh: fetchUser };
}
