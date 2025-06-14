import { useAuth } from '../../context/authContext';
import { Navigate, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';

interface RolRouterProps {
  children: ReactNode;
  rolesPermitidos?: string[];
}

const RolRouter = ({ children, rolesPermitidos }: RolRouterProps) => {
  const { isAuthenticated, user, initialized } = useAuth();
  const location = useLocation();

  // Mientras no esté inicializado el estado de authContext, no renderizamos nada
  if (!initialized) return null;

  // Si no está autenticado, redirige al login
  if (!isAuthenticated) {
    return <Navigate to="/autenticacion/login" state={{ from: location }} replace />;
  }

  // Si tiene rol, pero no está permitido
  if (rolesPermitidos && !rolesPermitidos.includes(user?.role ?? '')) {
    return <Navigate to="/autenticacion/login" replace />;
  }

  return <>{children}</>;
};

export default RolRouter;
