import { useState } from "react";
import { useAsyncValue, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const Register = () => {
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [globalError, setGlobalError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setGlobalError("");
    setFieldErrors({});

    if (password !== confirmPassword) {
      setFieldErrors({confirmPassword: "Podane hasła nie są identyczne!"});
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({nickname, email, password})
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          const errs = {}
          data.errors.forEach((err) => {
            errs[err.field] = err.message;
          });

          setFieldErrors(errs);
          throw new Error("Proszę poprawić błędy w formularzu");
        }
        throw new Error(data.error || "Błąd podczas rejestracji")
      }

      localStorage.setItem("isAuthenticated", "true");
      navigate("/dashboard");
    } catch (error) {
      setGlobalError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Utwórz konto
          </CardTitle>
          <CardDescription className="text-center">
            Wprowadź swoje dane, aby dołączyć do platformy
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4">
            {/* Błędy globalne */}
            {globalError && (
              <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md border border-red-200">
                {globalError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="nickname">Nickname</Label>
              <Input
                id="nickname"
                type="text"
                placeholder="Twój nick"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
              />
              {fieldErrors.nickname && (
                <p className="text-sm text-red-500 font-medium">{fieldErrors.nickname}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="jan@kowalski.pl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {fieldErrors.email && (
                <p className="text-sm text-red-500 font-medium">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Hasło *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 8 znaków"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {fieldErrors.password && (
                <p className="text-sm text-red-500 font-medium">{fieldErrors.password}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Powtórz hasło *</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Wpisz hasło ponownie"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {fieldErrors.confirmPassword && (
                <p className="text-sm text-red-500 font-medium">{fieldErrors.confirmPassword}</p>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Tworzenie konta..." : "Zarejestruj się"}
            </Button>
            <div className="text-sm text-center text-zinc-500 mt-2">
              Masz już konto?{" "}
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-zinc-900 font-medium hover:underline"
              >
                Zaloguj się
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default Register;
