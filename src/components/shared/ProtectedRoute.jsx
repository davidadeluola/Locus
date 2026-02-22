import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, profile, loading } = useAuthContext();
  const location = useLocation();

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-zinc-950 text-orange-500">
        SYSTEM_BOOTING...
      </div>
    );

  // 1. Check if authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Check Role Authorization (e.g., Student trying to access Lecturer dashboard)
  if (allowedRoles.length > 0 && !allowedRoles.includes(profile?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;
