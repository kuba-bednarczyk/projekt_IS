import { Home, UserCircle, LogOut, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router";
import useCurrentUser from "@/hooks/useCurrentUser";

const Header = () => {
  const navigate = useNavigate();

  const { user } = useCurrentUser();
  const userEmail =
    user?.email || localStorage.getItem("email") || "test@email.pl";
  const location = useLocation();

  const isActive = (path) => {
    return (
      location.pathname === path ||
      (path !== "/" && location.pathname.startsWith(path))
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-zinc-200 px-8 py-4 shadow-sm flex justify-between items-center">
      {/* Ikona i Tytuły (logo -> dashboard) */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-4 focus:outline-none"
          aria-label="Przejdź do dashboardu"
        >
          <div className="p-3 bg-zinc-100 rounded-xl text-zinc-700 shadow-inner">
            <Home className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold text-zinc-900 leading-tight">
              Panel analityczny
            </h1>
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Rynek nieruchomości
            </span>
          </div>
        </button>
      </div>

      {/* Profil i przyciski */}
      <div className="flex flex-col items-end gap-3">
        {/* Dane użytkownika */}
        <div className="flex items-center gap-2 text-zinc-700 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-200">
          <UserCircle className="w-5 h-5 text-zinc-500" />
          <span className="text-sm font-semibold">{userEmail}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <Button
              variant={isActive("/dashboard") ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs font-medium"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </Button>

            <Button
              variant={isActive("/calculator") ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs font-medium"
              onClick={() => navigate("/calculator")}
            >
              Kalkulator
            </Button>

            {user?.role === "ADMIN" && (
              <Button
                variant={isActive("/admin") ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs font-medium"
                onClick={() => navigate("/admin")}
              >
                Panel Admin
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant={isActive("/account") ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs font-medium"
              onClick={() => navigate("/account")}
            >
              <UserCog className="w-3.5 h-3.5 mr-1.5" />
              Konto
            </Button>

            <Button
              variant="destructive"
              size="sm"
              className="h-8 text-xs font-medium"
              onClick={handleLogout}
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Wyloguj
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
