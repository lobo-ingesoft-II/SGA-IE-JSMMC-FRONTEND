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
    path: 'PanelProfesor',
    icon: 'icomoon-free:drawer',
    active: true,
    collapsible: true,
    sublist: [
      {
        title: 'Sede 1',
        path: 'Sedes/Sedes',
        active: true,
        collapsible: false,
      },
    ],
  },
  {
    title: 'Mis cursos',
    path: 'PanelProfesor',
    icon: 'mingcute:grid-fill',
    active: true,
    collapsible: true,
    sublist: [
      {
        title: 'Curso 1',
        path: 'Cursos/Cursos',
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
    ],
  },
  {
    title: 'Autenticación',
    path: 'autenticacion',
    icon: 'f7:exclamationmark-shield-fill',
    active: true,
    collapsible: true,
    sublist: [
      {
        title: 'Log In',
        path: 'login',
        active: true,
        collapsible: false,
      },
      {
        title: 'Formulario de prematricula',
        path: 'prematricula',
        active: true,
        collapsible: false,
      },
    ],
  },
];

export default navItems;
