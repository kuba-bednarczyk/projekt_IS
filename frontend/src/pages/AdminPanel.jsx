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

  // stany główne (userzy, errory i messages)
  const [users, setUsers] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState(null);

  // Stany dodawania użytkownika
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [addFormData, setAddFormData] = useState({
    nickname: "",
    email: "",
    password: "",
    role: "USER",
  });

  // Stany do Edycji użytkownika
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [preview, setPreview] = useState(null); // stan do preview zdjecia
  const [editFormData, setEditFormData] = useState({
    nickname: "",
    email: "",
    role: "USER",
  });

  // Funkcje pomocznicze
  const handleCloseAdd = () => {
    setIsAddOpen(false);
    setAddFormData({ nickname: "", email: "", password: "", role: "USER" });
    setFieldErrors({});
    setStatusMessage(null);
  };

  const handleCloseEdit = () => {
    setIsEditOpen(false);
    setEditingUser(null);
    setEditFormData({ nickname: "", email: "", role: "USER" });
    setPreview(null);
    setFieldErrors({});
    setStatusMessage(null);
  };

  const handleInputChange = (field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Funkcje api - komunikacja z backendem
  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsAdding(true);
    setFieldErrors({});
    setStatusMessage(null);

    try {
      const response = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(addFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const errs = {};
          data.errors.forEach((err) => {
            errs[err.field] = err.message || "Nieprawidłowa wartość w tym polu.";
          });
          setFieldErrors(errs);
          throw new Error("Proszę poprawić błędy w polach formularza.");
        }
        throw new Error(data.message || "Nie udało się zapisać zmian użytkownika");
      }

      if (data.success && data.data) {
        setUsers((prev) => [...prev, data.data]);
      }

      setStatusMessage({
        type: "success",
        text: "Użytkownik został pomyślnie dodany",
      });

      setTimeout(() => {
        handleCloseAdd();
      }, 1000);

    } catch (error) {
      console.error("Błąd podczas dodawania: ", error);
      setStatusMessage({ type: "error", text: error.message });
    } finally {
      setIsAdding(false);
    }
  };

  const handleOpenEdit = async (selectedUser) => {
    setEditingUser(selectedUser);
    setEditFormData({
      nickname: selectedUser.nickname || "",
      email: selectedUser.email || "",
      role: selectedUser.role || "USER",
    });
    setPreview(null);
    setIsEditOpen(true);

    try {
      const picRes = await fetch(
        `http://localhost:3000/api/users/${selectedUser.id}/picture`,
        { credentials: "include" }
      );

      if (picRes.ok) {
        const picData = await picRes.json();
        setPreview(picData.profilePicture);
      }
    } catch (error) {
      console.error("Błąd pobierania zdjęcia profilowego użytkownika:", error);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    setIsSaving(true);
    setFieldErrors({});
    setStatusMessage(null);

    try {
      const payload = {
        nickname: editFormData.nickname,
        email: editFormData.email,
        role: editFormData.role,
        profilePicture: preview,
      };

      const response = await fetch(
        `http://localhost:3000/api/users/${editingUser.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          const errs = {};
          data.errors.forEach((err) => {
            errs[err.field] = err.message || "Nieprawidłowa wartość w tym polu.";
          });
          setFieldErrors(errs);
          throw new Error("Proszę poprawić błędy w polach formularza.");
        }
        throw new Error(data.message || "Nie udało się zapisać zmian użytkownika");
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                nickname: editFormData.nickname,
                email: editFormData.email,
                role: editFormData.role,
              }
            : u
        )
      );

      setStatusMessage({
        type: "success",
        text: "Dane użytkownika zostały pomyślnie zaktualizowane.",
      });

      setTimeout(() => {
        handleCloseEdit();
      }, 1000);
    } catch (error) {
      console.error("Błąd podczas aktualizacji użytkownika:", error);
      setStatusMessage({ type: "error", text: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (id === user?.userId) {
      alert("Nie mozesz usunac samego siebie");
      return; // zabezpieczenie: return zatrzymuje usuwanie, żeby admin się nie skasował
    }

    if (!window.confirm("Czy na pewno chcesz usunąć tego użytkownika?")) return;

    try {
      const res = await fetch(`http://localhost:3000/api/users/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      if (res.ok) {
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

  // useEffect - api do backendu, załadowanie userow
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
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.role === "ADMIN"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-zinc-100 text-zinc-700"
                      }`}
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
        <Button
          variant="outline"
          className="mt-2"
          onClick={() => setIsAddOpen(true)}
        >
          Dodaj użytkownika
        </Button>

        {/* Modal - edycja uzytkownikow */}
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
                    className={`p-3 rounded-md text-sm font-medium ${
                      statusMessage.type === "error"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-green-50 text-green-700 border border-green-200"
                    }`}
                  >
                    {statusMessage.text}
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Zdjęcie profilowe</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full bg-zinc-100 border border-zinc-200 overflow-hidden flex-shrink-0">
                      {preview ? (
                        <img
                          src={preview}
                          alt={`Avatar ${editFormData.nickname}`}
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
                      value={editFormData.nickname}
                      onChange={(e) => handleInputChange("nickname", e.target.value)}
                    />
                    {fieldErrors.nickname && (
                      <p className="text-sm text-red-500">{fieldErrors.nickname}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-edit-email">Email</Label>
                    <Input
                      id="admin-edit-email"
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                    />
                    {fieldErrors.email && (
                      <p className="text-sm text-red-500">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="admin-edit-role">Rola</Label>
                    <select
                      id="admin-edit-role"
                      value={editFormData.role}
                      onChange={(e) => handleInputChange("role", e.target.value)}
                      className="w-full h-10 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseEdit}>
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

        {/* Modal - dodawanie uzytkownikow */}
        <Dialog
          open={isAddOpen}
          onOpenChange={(open) => !open && handleCloseAdd()}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dodaj nowego użytkownika</DialogTitle>
              <DialogDescription>
                Wprowadź dane, aby utworzyć konto dla nowego użytkownika.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleAddUser} className="space-y-5">
              {statusMessage && (
                <div
                  className={`p-3 rounded-md text-sm font-medium ${
                    statusMessage.type === "error"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : "bg-green-50 text-green-700 border border-green-200"
                  }`}
                >
                  {statusMessage.text}
                </div>
              )}

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-add-nickname">Nickname</Label>
                  <Input
                    id="admin-add-nickname"
                    type="text"
                    value={addFormData.nickname}
                    onChange={(e) =>
                      setAddFormData((prev) => ({ ...prev, nickname: e.target.value }))
                    }
                  />
                  {fieldErrors.nickname && (
                    <p className="text-sm text-red-500">{fieldErrors.nickname}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-add-email">Email</Label>
                  <Input
                    id="admin-add-email"
                    type="email"
                    required
                    value={addFormData.email}
                    onChange={(e) =>
                      setAddFormData((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                  {fieldErrors.email && (
                    <p className="text-sm text-red-500">{fieldErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-add-password">Hasło</Label>
                  <Input
                    id="admin-add-password"
                    type="password"
                    required
                    value={addFormData.password}
                    onChange={(e) =>
                      setAddFormData((prev) => ({ ...prev, password: e.target.value }))
                    }
                  />
                  {fieldErrors.password && (
                    <p className="text-sm text-red-500">{fieldErrors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-add-role">Rola</Label>
                  <select
                    id="admin-add-role"
                    value={addFormData.role}
                    onChange={(e) =>
                      setAddFormData((prev) => ({ ...prev, role: e.target.value }))
                    }
                    className="w-full h-10 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2"
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseAdd}>
                  Anuluj
                </Button>
                <Button type="submit" disabled={isAdding}>
                  {isAdding ? "Dodawanie..." : "Dodaj użytkownika"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default AdminPanel;