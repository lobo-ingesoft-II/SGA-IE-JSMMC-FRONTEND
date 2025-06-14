import { NavItem } from '../../helpers/navItem';

export async function fetchNavItems(): Promise<NavItem[]> {
  const userData = localStorage.getItem('user');
  const userId = userData ? JSON.parse(userData).id : null;

  const items: NavItem[] = [
    {
      title: 'Página principal',
      path: `/PanelAcudiente/${userId}/Inicio`,
      icon: 'ion:home-sharp',
      active: true,
      collapsible: false
    },
    {
      title: 'Mis Materias',
      path: `/PanelAcudiente/${userId}`,
      icon: 'tabler:book',
      active: true,
      collapsible: true,
      sublist: [
        {
          title: 'Español',
          path: `Asignatura/espanol`,
          active: true,
          collapsible: false
        },
        {
          title: 'Inglés',
          path: `Asignatura/ingles`,
          active: true,
          collapsible: false
        },
        {
          title: 'Matemáticas',
          path: `Asignatura/matematicas`,
          active: true,
          collapsible: false
        }
      ]
    },
    {
      title: 'Formulario de matrícula',
      path: '/autenticacion/prematricula',
      icon: 'mdi:form-select',
      active: true,
      collapsible: false
    },
    {
      title: 'Observador',
      path: `/PanelAcudiente/${userId}/Observador`,
      icon: 'mdi:clipboard-text-outline',
      active: true,
      collapsible: false
    }
  ];

  return items;
}
