import {BrowserRouter, Routes, Route } from "react-router"
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Strona logowania */}
        <Route path="/" element={<Login />} />

        {/* Strona główna po zalogowaniu */}
        <Route path="/dashboard" element={
          // ProtectedRoute blokuje dostep przed nieautoryzowanym dostępem
          <ProtectedRoute> 
            <Dashboard />
          </ProtectedRoute>
          } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
