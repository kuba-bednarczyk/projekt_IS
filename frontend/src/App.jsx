import { BrowserRouter, Routes, Route } from "react-router";

// pages
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import Calculator from "./pages/Calculator";
import AdminPanel from "./pages/AdminPanel";


// protected Route
import ProtectedRoute from "./components/layout/ProtectedRoute";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Strona rejestracji */}
        <Route path="/register" element={<Register />} />

        {/* Strona logowania */}
        <Route path="/" element={<Login />} />

        {/* Strona główna po zalogowaniu */}
        <Route
          path="/dashboard"
          element={
            // ProtectedRoute blokuje dostep przed nieautoryzowanym dostępem
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/calculator"
          element={
            <ProtectedRoute>
              <Calculator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
