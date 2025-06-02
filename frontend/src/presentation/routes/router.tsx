import { Suspense, lazy } from 'react';
import { Outlet, RouteObject, createBrowserRouter, Navigate } from 'react-router-dom';

import paths, { rootPaths } from './paths';

import PageLoader from '../components/loading/PageLoader';
import Splash from '../components/loading/Splash';

const App = lazy(() => import('../../App'));
const MainLayout = lazy(async () => {
  return Promise.all([
    import('../layouts/panelprofesor-layout'),
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ]).then(([moduleExports]) => moduleExports);
});
const AuthLayout = lazy(async () => {
  return Promise.all([
    import('../layouts/auth-layout'),
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ]).then(([moduleExports]) => moduleExports);
});

const Error404 = lazy(async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return import('../pages/errors/Error404');
});

const Inicio = lazy(async () => {
  return Promise.all([
    import('../pages/PanelProfesor/Inicio'),
    new Promise((resolve) => setTimeout(resolve, 500)),
  ]).then(([moduleExports]) => moduleExports);
});

const Login = lazy(async () => import('../pages/autenticacion/Login'));
const Prematricula = lazy(async () => import('../pages/autenticacion/prematricula'));

const routes: RouteObject[] = [
  {
    element: (
      <Suspense fallback={<Splash />}>
        <App />
      </Suspense>
    ),
    children: [
      // Redirigir la ruta raíz directamente al panel de profesores
      {
        path: '/',
        element: <Navigate to={paths.home} replace />,
      },
      {
        path: rootPaths.homeRoot,
        element: (
          <MainLayout>
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </MainLayout>
        ),
        children: [
          {
            index: true,
            element: <Inicio />, // Muestra el panel de profesores por defecto
          },
          {
            path: paths.home,
            element: <Inicio />,
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
            element: <Login />,
          },
          {
            path: paths.prematricula,
            element: <Prematricula />,
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