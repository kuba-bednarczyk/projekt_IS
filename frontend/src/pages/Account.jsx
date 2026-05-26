import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import useCurrentUser from "@/hooks/useCurrentUser";
import { Camera, Trash2, Save, User, Mail, Lock } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const Account = () => {
  const { user, loading } = useCurrentUser();
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [preview, setPreview] = useState(null);
  const [originalPreview, setOriginalPreview] = useState(null);

  const fileInputRef = useRef(null);

  // Bezpieczna synchronizacja stanu początkowego bez wywoływania kaskadowych renderów (omija błąd ESLint)
  const [lastLoadedUserId, setLastLoadedUserId] = useState(null);
  if (user && user.userId !== lastLoadedUserId) {
    setNickname(user.nickname || "");
    setEmail(user.email || "");
    setLastLoadedUserId(user.userId);
  }

  useEffect(() => {
    if (user?.userId) {
      const fetchUserPicture = async () => {
        try {
          const picRes = await fetch(
            `http://localhost:3000/api/users/${user.userId}/picture?t=${Date.now()}`,
            { credentials: "include" },
          );
          if (picRes.ok) {
            const picData = await picRes.json();
            setPreview(picData.profilePicture);
            setOriginalPreview(picData.profilePicture);
          } else {
            setPreview(null);
            setOriginalPreview(null);
          }
        } catch (err) {
          console.error("Błąd pobierania zdjęcia profilowego: ", err);
        }
      };

      fetchUserPicture();
    }
  }, [user?.userId]);

  // Funkcja wywoływana, gdy użytkownik wybierze nowe zdjęcie z dysku
  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (f.size > 2 * 1024 * 1024) {
      alert("Za duży plik! Maksymalny rozmiar to 2MB");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setPreview(reader.result);
    };

    reader.readAsDataURL(f);
  };

  const handleSave = async (e) => {
    e.preventDefault(); // Blokujemy domyślne przeładowanie strony przez formularz
    if (!user?.userId) return alert("Błąd: Nie odnaleziono ID użytkownika.");

    try {
      const payload = {
        nickname: nickname,
        email: email,
        role: user.role, // Dołączamy obecną rolę, by walidator Zod nie zgłosił jej braku
      };

      if (preview !== originalPreview) {
        payload.profilePicture = preview;
      }

      if (password.trim() !== "") {
        payload.password = password;
      }

      const response = await fetch(
        `http://localhost:3000/api/users/${user.userId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const fieldErrors = data.errors.map((err) => err.field).join(", ");
          throw new Error(`Błąd walidacji w polach: ${fieldErrors}`);
        }
        throw new Error(data.message || "Nie udało się zapisać zmian.");
      }

      alert("Twoje dane zostały pomyślnie zaktualizowane!");
      setPassword("");
      setOriginalPreview(preview);
      // odpalenie globalnego refresha w celu zaktualizowania danych konta globalnie w całej aplikacji 
      window.dispatchEvent(new Event("user-updated")); 
    } catch (error) {
      console.error("Błąd podczas zapisu:", error);
      alert("Wystąpił błąd: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <Header />
      <main className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            Moje konto
          </h1>
          <p className="text-muted-foreground mt-2">
            Zarządzaj swoimi danymi logowania i awatarem.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <Card className="shadow-sm border-zinc-200/60">
            <CardContent className="pt-6 space-y-8">
              {/* Sekcja Avatara */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div
                  className="relative w-24 h-24 rounded-full bg-zinc-100 border-2 border-dashed border-zinc-300 overflow-hidden group cursor-pointer flex-shrink-0 transition-colors hover:border-zinc-400"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {preview ? (
                    <img
                      src={preview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-zinc-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={onFileChange}
                />

                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Zdjęcie profilowe</h3>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Wybierz zdjęcie
                    </Button>
                    {preview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => {
                          setPreview(null);
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Usuń
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-zinc-100"></div>

              {/* Sekcja Danych */}
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="nickname" className="text-sm font-medium">
                    Nazwa użytkownika
                  </Label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <Input
                      id="nickname"
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Adres e-mail
                  </Label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Nowe hasło
                  </Label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      placeholder="Zostaw puste, aby nie zmieniać"
                    />
                  </div>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-6 flex justify-end">
              <Button
                type="submit"
                className="min-w-[140px]"
                disabled={loading}
              >
                {loading ? (
                  "Zapisywanie..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Zapisz zmiany
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </main>
    </div>
  );
};

export default Account;
