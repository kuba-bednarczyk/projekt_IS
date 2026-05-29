import { useState, useEffect } from "react";
import { Home, UserCircle, LogOut, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router";
import useCurrentUser from "@/hooks/useCurrentUser";

const Header = () => {
  const navigate = useNavigate();

  const { user, loading } = useCurrentUser();
  const location = useLocation();
  const [avatar, setAvatar] = useState(null);

  const userIdentifier = loading ? "..." : user?.nickname || user?.email;
  const isActive = (path) => {
    return (
      location.pathname === path ||
      (path !== "/" && location.pathname.startsWith(path))
    );
  };

  useEffect(() => {
    const fetchAvatar = () => {
      if (!user?.userId) {
        setAvatar(null);
        return;
      }
      fetch(
        // Dodanie znacznika czasu w celu aktualizacji zdjecia profilowego po update'cie danych konta
        `http://localhost:3000/api/users/${user.userId}/picture?t=${Date.now()}`,
        {
          credentials: "include",
        },
      )
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Brak zdjęcia");
        })
        .then((data) => setAvatar(data.profilePicture))
        .catch(() => setAvatar(null));
    };

    fetchAvatar();
    window.addEventListener("user-updated", fetchAvatar);
    return () => window.removeEventListener("user-updated", fetchAvatar);
  }, [user?.userId]);

  const handleLogout = async () => {
    try {
      // Wyślij żądanie do serwera, aby wyczyścić cookie HttpOnly
      await fetch("http://localhost:3000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      localStorage.removeItem("isAuthenticated");
      navigate("/");
    }
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
          {user && avatar ? (
            <img
              src={avatar}
              alt="Avatar"
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <UserCircle className="w-6 h-6 text-zinc-500" />
          )}
          <span className="text-sm font-semibold">{userIdentifier}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <Button
              variant={isActive("/dashboard") ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs font-medium"
              onClick={() => navigate("/dashboard")}
            >
              Panel analityczny
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
