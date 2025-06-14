import { NavItem } from '../../helpers/navItem';

export async function fetchNavItems(): Promise<NavItem[]> {
  const sedesFijas = [
    'CONCENTRACION RURAL CABUYARITO',
    'CONCENTRACION RURAL CAÑO TIGRE',
    'ESCUELA RURAL BUENAVISTA MAYA',
    'ESCUELA RURAL BOTELLAS',
    'ESCUELA RURAL BUENAVISTA DE ALTO REDONDO',
    'ESCUELA RURAL GUAICARAMO',
    'ESCUELA RURAL JORGE ELIÉCER GAITÁN',
    'ESCUELA RURAL LA LIBERTAD',
    'ESCUELA RURAL LAS VIRGINIAS',
    'ESCUELA RURAL MARIA AUXILIADORA',
    'ESCUELA RURAL PALOMAS CAÑO CLARO',
    'ESCUELA RURAL SAN ISIDRO',
    'ESCUELA RURAL SAN JESUS DE PALOMAS',
    'ESCUELA RURAL SIMON BOLIVAR',
    'INSTITUCIÓN EDUCATIVA DEPARTAMENTAL JOSUÉ MANRIQUE',
  ];

  const grados = [
    'Primero',
    'Segundo',
    'Tercero',
    'Cuarto',
    'Quinto',
    'Sexto',
    'Séptimo',
    'Octavo',
    'Noveno',
    'Décimo',
    'Once',
  ];

  const items: NavItem[] = [
    {
      title: 'Página principal',
      path: '/',
      icon: 'ion:home-sharp',
      active: true,
      collapsible: false,
    },
    {
      title: 'Sedes',
      path: '/PanelAdministrador',
      icon: 'mdi:domain',
      active: true,
      collapsible: true,
      sublist: sedesFijas.map((sede, index) => ({
        title: sede,
        path: `Sedes/${index + 1}`, // Puedes cambiar el ID por uno real si lo tienes
        active: true,
        collapsible: false,
      })),
    },
    {
      title: 'Cursos',
      path: '/PanelAdministrador',
      icon: 'mdi:book-education',
      active: true,
      collapsible: true,
      sublist: grados.map((grado) => ({
        title: grado,
        path: `Cursos/${grado.toLowerCase()}`,
        active: true,
        collapsible: false,
      })),
    },
    {
      title: 'Solicitudes de matrícula',
      path: '/PanelAdministrador/Solicitudes',
      icon: 'mdi:clipboard-list',
      active: true,
      collapsible: false,
    },
    {
      title: 'Gestión de usuarios',
      path: '/PanelAdministrador/Usuarios',
      icon: 'mdi:account-cog',
      active: true,
      collapsible: false,
    },
  ];

  return items;
}
