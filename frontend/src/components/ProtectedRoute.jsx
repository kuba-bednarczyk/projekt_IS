import { Navigate } from "react-router"

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // sprawdzmay czy jest token i wtedy dopiero przekazujemy dzieci komponentu 
  if (!token) {
    return <Navigate to="/" replace />
  }

  return children;
}

export default ProtectedRoute
