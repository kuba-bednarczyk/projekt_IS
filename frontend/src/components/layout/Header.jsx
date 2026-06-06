import { useState, useEffect } from "react";
import { Home, UserCircle, LogOut, UserCog, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router";
import useCurrentUser from "@/hooks/useCurrentUser";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const Header = () => {
  const navigate = useNavigate();
  const { user, loading } = useCurrentUser();
  const location = useLocation();
  
  const [avatar, setAvatar] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
        `${API_URL}/users/${user.userId}/picture?t=${Date.now()}`,
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
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      localStorage.removeItem("isAuthenticated");
      setIsMobileMenuOpen(false);
      navigate("/");
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-zinc-200 px-4 md:px-8 py-4 shadow-sm relative z-50">
      <div className="flex justify-between items-center max-w-350 mx-auto">
        {/* Lewa strona: Ikona i Tytuły */}
        <button
          type="button"
          onClick={() => handleNavigation("/dashboard")}
          className="flex items-center gap-3 md:gap-4 focus:outline-none shrink-0"
          aria-label="Przejdź do dashboardu"
        >
          <div className="p-2.5 md:p-3 bg-zinc-100 rounded-xl text-zinc-700 shadow-inner shrink-0">
            <Home className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          <div className="flex flex-col text-left">
            <h1 className="text-lg md:text-xl font-extrabold text-zinc-900 leading-tight">
              Panel analityczny
            </h1>
            <span className="text-[10px] md:text-xs font-medium text-zinc-500 uppercase tracking-wider hidden sm:block">
              Rynek nieruchomości
            </span>
          </div>
        </button>

        {/* DESKTOP: od lg w gore */}
        <div className="hidden lg:flex items-center gap-6">
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

          {/* przyciski nawigacyjne */}
          <div className="flex items-center gap-2">
            <Button
              variant={isActive("/dashboard") ? "default" : "outline"}
              size="sm"
              onClick={() => handleNavigation("/dashboard")}
            >
              <Home className="w-4 h-4 mr-1.5" />
              Dashboard
            </Button>

            {user?.role === "ADMIN" && (
              <Button
                variant={isActive("/admin") ? "default" : "outline"}
                size="sm"
                onClick={() => handleNavigation("/admin")}
              >
                <UserCog className="w-4 h-4 mr-1.5" />
                Panel Admin
              </Button>
            )}

            <Button
              variant={isActive("/account") ? "default" : "outline"}
              size="sm"
              onClick={() => handleNavigation("/account")}
            >
              <UserCircle className="w-4 h-4 mr-1.5" />
              Konto
            </Button>

            <Button
              variant="destructive"
              size="sm"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-1.5" />
              Wyloguj
            </Button>
          </div>
        </div>

        {/* MOBILE: hamburger menu */}
        {/* menu schowane na duzych screenach (lg:hidden) */}
        <div className="lg:hidden flex items-center gap-3">
          {/* tylko awatar */}
          <div className="flex items-center gap-2 text-zinc-700 bg-zinc-50 p-1.5 rounded-full border border-zinc-200">
             {user && avatar ? (
              <img
                src={avatar}
                alt="Avatar"
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <UserCircle className="w-7 h-7 text-zinc-500" />
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} //
            aria-label="Menu"
            className="text-zinc-700"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* rozwijane menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-zinc-200 shadow-xl flex flex-col p-4 gap-3 animate-in slide-in-from-top-2">
          <div className="px-2 pb-2 mb-2 border-b border-zinc-100 flex items-center gap-2 text-zinc-700">
            <span className="text-sm font-medium text-zinc-500">Zalogowano jako:</span>
            <span className="text-sm font-bold">{userIdentifier}</span>
          </div>

          <Button
            variant={isActive("/dashboard") ? "default" : "outline"}
            className="w-full justify-start"
            onClick={() => handleNavigation("/dashboard")}
          >
            <Home className="w-4 h-4 mr-2" />
            Panel analityczny
          </Button>

          {user?.role === "ADMIN" && (
            <Button
              variant={isActive("/admin") ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => handleNavigation("/admin")}
            >
              <UserCog className="w-4 h-4 mr-2" />
              Panel Administratora
            </Button>
          )}

          <Button
            variant={isActive("/account") ? "default" : "outline"}
            className="w-full justify-start"
            onClick={() => handleNavigation("/account")}
          >
            <UserCircle className="w-4 h-4 mr-2" />
            Moje Konto
          </Button>

          <Button
            variant="destructive"
            className="w-full justify-start mt-2"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Wyloguj się
          </Button>
        </div>
      )}
    </header>
  );
};

export default Header;