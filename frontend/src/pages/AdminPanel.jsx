import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import useCurrentUser from "@/hooks/useCurrentUser";

import Header from "@/components/layout/Header";
import DataImportModal from "@/components/admin/DataImportModal";
import UsersTable from "@/components/admin/UsersTable";
import AddUserModal from "@/components/admin/AddUserModal";
import EditUserModal from "@/components/admin/EditUserModal";
import ManageSystemData from "@/components/admin/ManageSystemData";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const AdminPanel = () => {
  const { user, loading } = useCurrentUser();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);

  // Stany Modali
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Pobieranie uzytkowników na start
  useEffect(() => {
    const fetchUsers = async () => {
      if (!localStorage.getItem("isAuthenticated"))
        return navigate("/", { replace: true });
      if (loading) return;
      if (!user || user.role !== "ADMIN")
        return navigate("/dashboard", { replace: true });

      try {
        const usersRes = await fetch(`${API_URL}/users`, {
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        if (usersRes.ok) {
          const usersData = await usersRes.json();
          if (usersData.success) setUsers(usersData.data);
        }
      } catch (error) {
        console.error("Wystąpił błąd: ", error);
      }
    };
    fetchUsers();
  }, [user, loading, navigate]);

  // Usunięcie usera
  const handleDeleteUser = async (id) => {
    if (id === user?.userId) return alert("Nie mozesz usunac samego siebie");
    if (!window.confirm("Czy na pewno chcesz usunąć tego użytkownika?")) return;

    try {
      const res = await fetch(`${API_URL}/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      } else {
        const data = await res.json();
        alert(data.message || "Nie udało się usunąć użytkownika");
      }
    } catch (error) {
      alert("Wystąpił błąd serwera.");
    }
  };

  // Czyszczenie bazy rynkowej
  const handleDeleteAllMarketData = async () => {
    if (
      !window.confirm(
        "UWAGA: Czy na pewno chcesz całkowicie wyczyścić dane? Dashboard przestanie wyświetlać dane.",
      )
    )
      return;

    try {
      const fetchOptions = { method: "DELETE", credentials: "include" };
      const ratesRes = await fetch(`${API_URL}/import/rates`, fetchOptions);
      const citiesRes = await fetch(`${API_URL}/import/cities`, fetchOptions);

      if (ratesRes.ok && citiesRes.ok) {
        alert("Baza danych została pomyślnie wyczyszczona!");
      } else {
        throw new Error("Błąd podczas usuwania danych.");
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        {/* Tabela i zarządzanie użytkownikami */}
        <UsersTable
          users={users}
          currentUser={user}
          onEditClick={(u) => setEditingUser(u)}
          onDeleteClick={handleDeleteUser}
          onAddClick={() => setIsAddOpen(true)}
        />

        {/* Zarządzanie danymi systemowymi */}
        <ManageSystemData
          onImportClick={() => setIsImportModalOpen(true)}
          handleDelete={handleDeleteAllMarketData}
        />
      </main>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={(newUser) => setUsers([...users, newUser])}
      />
      <EditUserModal
        user={editingUser}
        isOpen={editingUser}
        onClose={() => setEditingUser(null)}
        onSuccess={(updatedUser) => {
          setUsers(
            users.map((u) => (u.id === updatedUser.id ? updatedUser : u)),
          );
        }}
      />
      <DataImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={() =>
          alert("Dane zaktualizowane. Przejdź do Dashboardu.")
        }
      />
    </div>
  );
};

export default AdminPanel;
