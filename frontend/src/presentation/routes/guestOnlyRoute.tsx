import { useAuth } from '../../context/authContext';
import { Navigate } from 'react-router-dom';
import PageLoader from '../components/loading/PageLoader';

const getDefaultHome = (role: string, id?: number | string) => {
  if (role === 'profesor') return `/PanelProfesor/${id}/Inicio`;
  if (role === 'administrador') return `/PanelAdministrador/${id}/Inicio`;
  if (role === 'acudiente') return `/PanelAcudiente/${id}/Inicio`;
  return '/';
};

const GuestOnlyRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, user, initialized } = useAuth();

  if (!initialized) return <PageLoader />;

  if (isAuthenticated) {
    const redirectPath = getDefaultHome(user?.role ?? '', user?.id);
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default GuestOnlyRoute;
