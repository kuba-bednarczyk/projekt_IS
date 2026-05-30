import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const AddUserModal = ({ isOpen, onClose, onSuccess }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);
  const [formData, setFormData] = useState({
    nickname: "",
    email: "",
    password: "",
    role: "USER",
  });

  const handleClose = () => {
    setFormData({ nickname: "", email: "", password: "", role: "USER" });
    setFieldErrors({});
    setStatusMessage(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    setFieldErrors({});
    setStatusMessage(null);

    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const errs = {};
          data.errors.forEach((err) => {
            errs[err.field] = err.message || "Nieprawidłowa wartość.";
          });
          setFieldErrors(errs);
          throw new Error("Proszę poprawić błędy w polach formularza.");
        }
        throw new Error(data.message || "Nie udało się zapisać użytkownika");
      }

      setStatusMessage({ type: "success", text: "Użytkownik dodany!" });
      setTimeout(() => {
        onSuccess(data.data); // Przekazujemy nowego usera do głównego widoku
        handleClose();
      }, 1000);
    } catch (error) {
      setStatusMessage({ type: "error", text: error.message });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dodaj nowego użytkownika</DialogTitle>
          <DialogDescription>Wprowadź dane, aby utworzyć konto.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {statusMessage && (
            <div className={`p-3 rounded-md text-sm font-medium ${statusMessage.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}>
              {statusMessage.text}
            </div>
          )}

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Nickname</Label>
              <Input
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
              />
              {fieldErrors.nickname && <p className="text-sm text-red-500">{fieldErrors.nickname}</p>}
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {fieldErrors.email && <p className="text-sm text-red-500">{fieldErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label>Hasło</Label>
              <Input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              {fieldErrors.password && <p className="text-sm text-red-500">{fieldErrors.password}</p>}
            </div>

            <div className="space-y-2">
              <Label>Rola</Label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full h-10 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Anuluj</Button>
            <Button type="submit" disabled={isAdding}>
              {isAdding ? "Dodawanie..." : "Dodaj użytkownika"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserModal;