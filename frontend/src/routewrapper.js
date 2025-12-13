import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  // Get user_role from localStorage
  const userRole = localStorage.getItem("user_role");

  if (!userRole) {
    // Not logged in
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Role not allowed
    return <Navigate to="/unauthorized" replace />;
  }

  // Role allowed
  return children;
};

export default ProtectedRoute;
