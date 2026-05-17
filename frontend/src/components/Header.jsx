import { Home, UserCircle, LogOut, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router"

const Header = () => {
  const navigate = useNavigate();

  const userEmail = localStorage.getItem("email") || "test@email.pl"

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    navigate("/");
  }

  return (
    <header className="bg-white border-b border-zinc-200 px-8 py-4 shadow-sm flex justify-between items-center">
      
      {/* Ikona i Tytuły */}
      <div className="flex items-center gap-4">
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
      </div>

      {/* Profil i przyciski */}
      <div className="flex flex-col items-end gap-3">
        
        {/* Dane użytkownika */}
        <div className="flex items-center gap-2 text-zinc-700 bg-zinc-50 px-3 py-1.5 rounded-full border border-zinc-200">
          <UserCircle className="w-5 h-5 text-zinc-500" />
          <span className="text-sm font-semibold">{userEmail}</span>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 text-xs font-medium"
            onClick={() => navigate("/account")} //link do zarządzania kontem 
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
    </header>
  )
}

export default Header;
