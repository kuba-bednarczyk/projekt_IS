import { BrowserRouter, Routes, Route } from "react-router";

import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Account from "./pages/Account";
import AdminPanel from "./pages/AdminPanel";

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
            <ProtectedRoute>
              <Dashboard />
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
