import { useState } from "react";
import Header from "@/components/Header";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const Account = () => {
  const [email, setEmail] = useState(localStorage.getItem("email") || "");
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // zapis zdjecia
  const onFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const handleSave = (e) => {
    e.preventDefault();
    // UI-only: backend endpoints not implemented yet
    alert("Brak endpointu API — zapis nie został wykonany.");
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />
      <main className="max-w-3xl mx-auto p-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Konto</CardTitle>
            <CardDescription>Zarządzaj danymi konta</CardDescription>
          </CardHeader>

          <form onSubmit={handleSave}>
            <CardContent className="space-y-4">
              <div>
                <Label>Zdjęcie profilowe</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="w-20 h-20 rounded-full bg-zinc-100 overflow-hidden border border-zinc-200">
                    {preview ? (
                      <img
                        src={preview}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs">
                        Brak
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 w-full max-w-xs">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={onFileChange}
                    />
                    <div className="text-xs text-muted-foreground">
                      PNG, JPG do 2MB
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="username" className="py-2">
                  Nazwa użytkownika
                </Label>
                <Input
                  id="username"
                  type="username"
                  value={""}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="email" className="py-2">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="pb-4">
                <Label htmlFor="password" className="py-2">
                  Hasło
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={""}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </CardContent>

            <CardFooter>
              <div className="flex gap-2 w-full">
                <Button type="submit" className="ml-auto" disabled={saving}>
                  Zapisz zmiany
                </Button>
                <Button
                  variant="destructive"
                  type="button"
                  onClick={() => {
                    setPreview(null);
                    setFile(null);
                  }}
                >
                  Usuń zdjęcie
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
};

export default Account;
