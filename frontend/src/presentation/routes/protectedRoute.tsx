import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import PageLoader from '../components/loading/PageLoader';

const getDefaultHome = (role: string, id?: number | string) => {
  if (role === 'profesor') return `/PanelProfesor/${id}/Inicio`;
  if (role === 'administrador') return `/PanelAdministrador/${id}/Inicio`;
  if (role === 'acudiente') return `/PanelAcudiente/${id}/Inicio`;
  return '/';
};

const ProtectedRoute = ({
  children,
  rolesPermitidos,
}: {
  children: JSX.Element;
  rolesPermitidos?: string[];
}) => {
  const { isAuthenticated, user, initialized } = useAuth();
  const location = useLocation();

  // Mostrar loader mientras se inicializa el contexto de autenticación
  if (!initialized) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/autenticacion/login" state={{ from: location }} replace />;
  }

  const userRole = user?.role ?? '';
  if (rolesPermitidos && !rolesPermitidos.includes(userRole)) {
    const redirectPath = getDefaultHome(userRole, user?.id);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
