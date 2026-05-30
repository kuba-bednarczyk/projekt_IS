import { useState, useEffect } from "react";
import { Save, Trash2, User as UserIcon } from "lucide-react";
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

const EditUserModal = ({ user, isOpen, onClose, onSuccess }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [preview, setPreview] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);
  
  const [formData, setFormData] = useState({
    nickname: "",
    email: "",
    role: "USER",
  });

  const [prevUser, setPrevUser] = useState(null);
  if (user != prevUser) {
    setPrevUser(user);
    setFormData({
      nickname: user?.nickname || "",
      email: user?.email || "",
      role: user?.role || "USER",
    })
  }

  useEffect(() => {
    if (isOpen && user) {
      fetch(`${API_URL}/users/${user.id}/picture`, { credentials: "include" })
        .then((res) => res.ok ? res.json() : null)
        .then((data) => setPreview(data?.profilePicture || null))
        .catch(() => setPreview(null));
    }
  }, [isOpen, user]);

  const handleClose = () => {
    setFieldErrors({});
    setStatusMessage(null);
    setPreview(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setFieldErrors({});
    setStatusMessage(null);

    try {
      const payload = { ...formData, profilePicture: preview };

      const response = await fetch(`${API_URL}/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const errs = {};
          data.errors.forEach((err) => { errs[err.field] = err.message; });
          setFieldErrors(errs);
          throw new Error("Proszę poprawić błędy w formularzu.");
        }
        throw new Error(data.message || "Błąd aktualizacji");
      }

      setStatusMessage({ type: "success", text: "Zaktualizowano!" });
      setTimeout(() => {
        onSuccess({ ...user, ...formData });
        handleClose();
      }, 1000);
    } catch (error) {
      setStatusMessage({ type: "error", text: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  return (
    
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edycja użytkownika</DialogTitle>
          <DialogDescription>Zmień dane użytkownika i zapisz.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {statusMessage && (
             <div className={`p-3 rounded-md text-sm font-medium ${statusMessage.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
               {statusMessage.text}
             </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium">Zdjęcie profilowe</Label>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden shrink-0">
                {preview ? (
                  <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-7 h-7 text-zinc-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                )}
              </div>
              <Button
                type="button"
                variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50"
                disabled={!preview}
                onClick={() => setPreview(null)}
              >
                <Trash2 className="w-4 h-4 mr-2" /> Usuń zdjęcie
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label>Nickname</Label>
              <Input value={formData.nickname} onChange={(e) => setFormData({...formData, nickname: e.target.value})} />
              {fieldErrors.nickname && <p className="text-sm text-red-500">{fieldErrors.nickname}</p>}
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
              {fieldErrors.email && <p className="text-sm text-red-500">{fieldErrors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label>Rola</Label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full h-10 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>Anuluj</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Zapisywanie..." : <><Save className="w-4 h-4 mr-2" /> Zapisz zmiany</>}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserModal;