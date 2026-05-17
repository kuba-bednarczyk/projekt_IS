import { useState } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card"

const Login = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  const navigate = useNavigate() 

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Błąd logowania");
      }

      // Zapisujemy dane sesji jesli nie wyrzuciło errora i zalogowano pomyślnie
      localStorage.setItem("token", data.token)
      localStorage.setItem("role", data.role)
      localStorage.setItem("email", email)
      
      // Przerzucamy na Dashboard przy użyciu nowego routera
      navigate("/dashboard")
      
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Zaloguj się</CardTitle>
          <CardDescription className="text-center">
            Wprowadź swój e-mail i hasło, aby uzyskać dostęp do bazy mieszkań
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          {/* wyświetlenie errora */}
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-100 rounded-md border border-red-200">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@test.pl" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Hasło</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Zaloguj
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default Login;