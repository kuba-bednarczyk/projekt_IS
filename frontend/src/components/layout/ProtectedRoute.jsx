import { Navigate } from "react-router";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated");

  // sprawdzamy czy istnieje flaga uwierzytelnienia z Login.jsx
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
