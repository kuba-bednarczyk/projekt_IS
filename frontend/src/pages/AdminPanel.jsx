import { useEffect } from "react";
import { useNavigate } from "react-router";
import Header from "@/components/Header";
import useCurrentUser from "@/hooks/useCurrentUser";

const AdminPanel = () => {
  const { user, loading } = useCurrentUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "ADMIN") {
        navigate("/dashboard", { replace: true });
      }
    }
  }, [user, loading, navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-zinc-50">
      <Header />
      <main className="max-w-4xl mx-auto p-6">
        <h2 className="text-xl font-semibold mb-4">Panel administracyjny</h2>
        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm">
          <p className="text-sm text-zinc-600">
            Sekcja dostępna tylko dla administratorów. (Placeholder)
          </p>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
