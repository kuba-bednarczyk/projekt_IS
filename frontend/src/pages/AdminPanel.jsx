import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Save, Trash2, User as UserIcon } from "lucide-react";
import Header from "@/components/Header";
import useCurrentUser from "@/hooks/useCurrentUser";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

const AdminPanel = () => {
  const { user, loading } = useCurrentUser();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [formData, setFormData] = useState({
    nickname: "",
    email: "",
    role: "USER",
  });

  const [preview, setPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      if (!localStorage.getItem("isAuthenticated")) {
        navigate("/", { replace: true });
        return;
      }

      if (loading) return;

      if (!user || user.role !== "ADMIN") {
        navigate("/dashboard", { replace: true });
      }

      try {
        const usersRes = await fetch("http://localhost:3000/api/users", {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          if (usersData.success) {
            setUsers(usersData.data);
          }
        }
      } catch (error) {
        console.error("Wystąpił błąd: ", error);
      }
    };

    fetchUsers();
  }, [user, loading, navigate]);

  // funkcja do usuwania użytkownika
  const handleDelete = async (id) => {
    if (id === user?.userId) {
      alert("Nie mozesz usunac samego siebie");
    }

    if (!window.confirm("Czy na pewno chcesz usunąć tego użytkownika?")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/users/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
        // Usuwamy użytkownika ze stanu, aby interfejs zaktualizował się automatycznie
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        const data = await res.json();
        alert(data.message || "Nie udało się usunąć użytkownika");
      }
    } catch (error) {
      console.error("Błąd podczas usuwania:", error);
      alert("Wystąpił błąd serwera.");
    }
  };

  const handleOpenEdit = async (selectedUser) => {
    setEditingUser(selectedUser);
    setFormData({
      nickname: selectedUser.nickname || "",
      email: selectedUser.email || "",
      role: selectedUser.role || "USER",
    });
    setPreview(null);
    setIsEditOpen(true);

    try {
      const picRes = await fetch(
        `http://localhost:3000/api/users/${selectedUser.id}/picture`,
        { credentials: "include" },
      );

      if (picRes.ok) {
        const picData = await picRes.json();
        setPreview(picData.profilePicture);
      }
    } catch (error) {
      console.error("Błąd pobierania zdjęcia profilowego użytkownika:", error);
    }
  };

  // funkcja do zamykania dialogu edycji użytkownika
  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setEditingUser(null);
    setFormData({
      nickname: "",
      email: "",
      role: "USER",
    });
    setPreview(null);
    setFieldErrors({});
    setStatusMessage(null);
  };

  // funkcja do zmiany wartości pola formularza
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // funkcja do zapisywania zmian użytkownika
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSaving(true);
    setFieldErrors({});
    setStatusMessage(null);

    try {
      const payload = {
        nickname: formData.nickname,
        email: formData.email,
        role: formData.role,
        profilePicture: preview,
      };

      const response = await fetch(
        `http://localhost:3000/api/users/${editingUser.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const errs = {};
          data.errors.forEach((err) => {
            errs[err.field] =
              err.message || "Nieprawidłowa wartość w tym polu.";
          });
          setFieldErrors(errs);
          throw new Error("Proszę poprawić błędy w polach formularza.");
        }
        throw new Error(
          data.message || "Nie udało się zapisać zmian użytkownika",
        );
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                nickname: formData.nickname,
                email: formData.email,
                role: formData.role,
              }
            : u,
        ),
      );

      setStatusMessage({
        type: "success",
        text: "Dane użytkownika zostały pomyślnie zaktualizowane.",
      });
      setTimeout(() => {
        handleCloseEdit();
      }, 1500);
    } catch (error) {
      console.error("Błąd podczas aktualizacji użytkownika:", error);
      setStatusMessage({ type: "error", text: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
          <div className="p-6 border-b border-zinc-200">
            <h2 className="text-xl font-semibold text-zinc-900">
              Zarządzanie użytkownikami
            </h2>
          </div>
          <Table>
            <TableCaption className="pb-4">
              Lista wszystkich zarejestrowanych użytkowników.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Nickname</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rola</TableHead>
                <TableHead className="text-right">Akcje</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.nickname}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === "ADMIN" ? "bg-indigo-100 text-indigo-700" : "bg-zinc-100 text-zinc-700"}`}
                    >
                      {u.role}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={u.id === user?.userId}
                        title={
                          u.id === user?.userId
                            ? "Nie mozesz usunac wlasnego konta"
                            : undefined
                        }
                        onClick={() => handleOpenEdit(u)}
                      >
                        Edytuj
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={u.id === user?.userId}
                        title={
                          u.id === user?.userId
                            ? "Nie mozesz usunac wlasnego konta"
                            : undefined
                        }
                        onClick={() => handleDelete(u.id)}
                      >
                        Usuń
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <Dialog
          open={isEditOpen}
          onOpenChange={(open) => !open && handleCloseEdit()}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edycja użytkownika</DialogTitle>
              <DialogDescription>
                Zmień dane użytkownika i zapisz aktualizację konta.
              </DialogDescription>
            </DialogHeader>

            {editingUser && (
              <form onSubmit={handleSaveEdit} className="space-y-5">
                {statusMessage && (
                  <div
                    className={`p-3 rounded-md text-sm font-medium ${statusMessage.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"}`}
                  >
                    {statusMessage.text}
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Zdjęcie profilowe
                  </Label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden flex-shrink-0">
                      {preview ? (
                        <img
                          src={preview}
                          alt={`Avatar ${formData.nickname}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-7 h-7 text-zinc-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      )}
                    </div>
                    <div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        disabled={!preview}
                        onClick={() => setPreview(null)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Usuń zdjęcie
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-edit-nickname">Nickname</Label>
                    <Input
                      id="admin-edit-nickname"
                      type="text"
                      value={formData.nickname}
                      onChange={(e) =>
                        handleInputChange("nickname", e.target.value)
                      }
                    />
                    {fieldErrors.nickname && (
                      <p className="text-sm text-red-500">
                        {fieldErrors.nickname}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-edit-email">Email</Label>
                    <Input
                      id="admin-edit-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                    />
                    {fieldErrors.email && (
                      <p className="text-sm text-red-500">
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-edit-role">Rola</Label>
                    <select
                      id="admin-edit-role"
                      value={formData.role}
                      onChange={(e) =>
                        handleInputChange("role", e.target.value)
                      }
                      className="w-full h-10 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseEdit}
                  >
                    Anuluj
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      "Zapisywanie..."
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Zapisz zmiany
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminPanel;
