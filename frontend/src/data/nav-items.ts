export interface NavItem {
  title: string;
  path: string;
  icon?: string;
  active: boolean;
  collapsible: boolean;
  sublist?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: 'Página principal',
    path: '/',
    icon: 'ion:home-sharp',
    active: true,
    collapsible: false,
  },
  {
    title: 'Mis sedes',
    path: '#!',
    icon: 'icomoon-free:drawer',
    active: true,
    collapsible: true,
    sublist: [
      {
        title: 'Sede 1',
        path: 'login',
        active: true,
        collapsible: false,
      },
      {
        title: 'Sede 2',
        path: 'sign-up',
        active: true,
        collapsible: false,
      },
      {
        title: 'Sede 3',
        path: 'forgot-password',
        active: true,
        collapsible: false,
      },
      {
        title: 'Sede 4',
        path: 'reset-password',
        active: true,
        collapsible: false,
      },
    ],
  },
  {
    title: 'Mis cursos',
    path: '#!',
    icon: 'mingcute:grid-fill',
    active: true,
    collapsible: true,
    sublist: [
      {
        title: 'Curso 1',
        path: 'login',
        active: true,
        collapsible: false,
      },
      {
        title: 'Curso 2',
        path: 'sign-up',
        active: true,
        collapsible: false,
      },
      {
        title: 'Curso 3',
        path: 'forgot-password',
        active: true,
        collapsible: false,
      },
      {
        title: 'Curso 4',
        path: 'reset-password',
        active: true,
        collapsible: false,
      },
    ],
  },
  {
    title: 'Mis asignaturas',
    path: '#!',
    icon: 'tabler:shopping-bag',
    active: true,
    collapsible: true,
    sublist: [
      {
        title: 'Asignatura 1',
        path: 'login',
        active: true,
        collapsible: false,
      },
      {
        title: 'Asignatura 2',
        path: 'sign-up',
        active: true,
        collapsible: false,
      },
      {
        title: 'Asignatura 3',
        path: 'forgot-password',
        active: true,
        collapsible: false,
      },
      {
        title: 'Asignatura 4',
        path: 'reset-password',
        active: true,
        collapsible: false,
      },
    ],
  },
  {
    title: 'Authentication',
    path: 'autenticacion',
    icon: 'f7:exclamationmark-shield-fill',
    active: true,
    collapsible: true,
    sublist: [
      {
        title: 'Sign In',
        path: 'login',
        active: true,
        collapsible: false,
      },
      {
        title: 'Sign Up',
        path: 'prematricula',
        active: true,
        collapsible: false,
      },
      {
        title: 'Forgot password',
        path: 'forgot-password',
        active: true,
        collapsible: false,
      },
      {
        title: 'Reset password',
        path: 'reset-password',
        active: true,
        collapsible: false,
      },
    ],
  },
];

export default navItems;
