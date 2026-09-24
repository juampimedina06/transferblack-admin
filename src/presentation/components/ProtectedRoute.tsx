import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../auth/store/useAuthStore';

const ProtectedRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Assuming user.roles contains the user's roles
  if (user?.roles && !user.roles.includes('admin')) {
    console.error("Acceso denegado: Se requieren permisos de administrador");
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
