import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children, roles }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  let user = null;
  try { user = JSON.parse(localStorage.getItem("user")); } catch {}

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-10 text-gray-500">
        <div className="text-6xl mb-4">403</div>
        <h2 className="text-gray-900 text-xl font-semibold mb-2">Access Denied</h2>
        <p>You don't have permission to view this page.</p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
