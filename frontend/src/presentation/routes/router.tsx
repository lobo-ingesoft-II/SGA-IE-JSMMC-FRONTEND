import { Suspense, lazy } from 'react';
import {
  Outlet,
  RouteObject,
  createBrowserRouter,
  Navigate,
} from 'react-router-dom';

import paths, { rootPaths } from './paths';

import PageLoader from '../components/loading/PageLoader';
import Splash from '../components/loading/Splash';
import ProtectedRoute from '../routes/protectedRoute';
import GuestOnlyRoute from '../routes/guestOnlyRoute';

const App = lazy(() => import('../../App'));
const MainLayout = lazy(() =>
  Promise.all([
    import('../layouts/panelprofesor-layout'),
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ]).then(([moduleExports]) => moduleExports)
);
const AdminLayout = lazy(() =>
  Promise.all([
    import('../layouts/paneladministrativo-layout'),
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ]).then(([moduleExports]) => moduleExports)
);
const AcudienteLayout = lazy(() =>
  Promise.all([
    import('../layouts/panelacudiente-layout'),
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ]).then(([moduleExports]) => moduleExports)
);
const AuthLayout = lazy(() =>
  Promise.all([
    import('../layouts/auth-layout'),
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ]).then(([moduleExports]) => moduleExports)
);
const Error404 = lazy(() =>
  Promise.all([
    import('../pages/errors/Error404'),
    new Promise((resolve) => setTimeout(resolve, 500)),
  ]).then(([moduleExports]) => moduleExports)
);
const Inicio = lazy(() =>
  Promise.all([
    import('../pages/PanelProfesor/Inicio'),
    new Promise((resolve) => setTimeout(resolve, 500)),
  ]).then(([moduleExports]) => moduleExports)
);
const PanelAdminInicio = lazy(() =>
  Promise.all([
    import('../pages/PanelAdministrador/Inicio'),
    new Promise((resolve) => setTimeout(resolve, 500)),
  ]).then(([moduleExports]) => moduleExports)
);
const PanelAcudienteInicio = lazy(() =>
  Promise.all([
    import('../pages/PanelAcudiente/Inicio'),
    new Promise((resolve) => setTimeout(resolve, 500)),
  ]).then(([moduleExports]) => moduleExports)
);
const Login = lazy(() => import('../pages/autenticacion/Login'));
const Prematricula = lazy(() => import('../pages/autenticacion/prematricula'));

const VistaSedes = lazy(() =>
  Promise.all([
    import('../pages/PanelProfesor/Sedes'),
    new Promise((resolve) => setTimeout(resolve, 500)),
  ]).then(([moduleExports]) => moduleExports)
);
const VistaCursos = lazy(() =>
  Promise.all([
    import('../pages/PanelProfesor/Cursos'),
    new Promise((resolve) => setTimeout(resolve, 500)),
  ]).then(([moduleExports]) => moduleExports)
);
const VistaAsignatura = lazy(() =>
  Promise.all([
    import('../pages/PanelProfesor/Asignatura'),
    new Promise((resolve) => setTimeout(resolve, 500)),
  ]).then(([moduleExports]) => moduleExports)
);

const routes: RouteObject[] = [
  {
    element: (
      <Suspense fallback={<Splash />}>
        <App />
      </Suspense>
    ),
    children: [
      {
        path: '/',
        element: <Navigate to={paths.home} replace />,
      },
      {
        path: rootPaths.homeRoot,
        element: (
          <ProtectedRoute rolesPermitidos={['profesor']}>
            <MainLayout>
              <Suspense fallback={<PageLoader />}>
                <Outlet />
              </Suspense>
            </MainLayout>
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <Inicio />,
          },
          {
            path: 'PanelProfesor/:inicioId/Inicio',
            element: <Inicio />,
          },
          {
            path: 'PanelProfesor/:inicioId/Sedes/:sedeId',
            element: <VistaSedes />,
          },
          {
            path: 'PanelProfesor/:inicioId/Cursos/:cursoId',
            element: <VistaCursos />,
          },
          {
            path: 'PanelProfesor/:inicioId/Asignatura/:materiaId',
            element: <VistaAsignatura />,
          },
        ],
      },
      {
        path: 'PanelAdministrador',
        element: (
          <ProtectedRoute rolesPermitidos={['administrador']}>
            <AdminLayout>
              <Suspense fallback={<PageLoader />}>
                <Outlet />
              </Suspense>
            </AdminLayout>
          </ProtectedRoute>
        ),
        children: [
          {
            path: ':inicioId/Inicio',
            element: <PanelAdminInicio />,
          },
        ],
      },
      {
        path: 'PanelAcudiente',
        element: (
          <ProtectedRoute rolesPermitidos={['acudiente']}>
            <AcudienteLayout>
              <Suspense fallback={<PageLoader />}>
                <Outlet />
              </Suspense>
            </AcudienteLayout>
          </ProtectedRoute>
        ),
        children: [
          {
            path: ':inicioId/Inicio',
            element: <PanelAcudienteInicio />,
          },
        ],
      },
      {
        path: rootPaths.authRoot,
        element: (
          <AuthLayout>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </AuthLayout>
        ),
        children: [
          {
            path: paths.login,
            element: (
              <GuestOnlyRoute>
                <Login />
              </GuestOnlyRoute>
            ),
          },
          {
            path: paths.prematricula,
            element: (
              <GuestOnlyRoute>
                <Prematricula />
              </GuestOnlyRoute>
            ),
          },
        ],
      },
      {
        path: '*',
        element: <Error404 />,
      },
    ],
  },
];

const router = createBrowserRouter(routes, { basename: '/iedjosuemanrique' });

export default router;
