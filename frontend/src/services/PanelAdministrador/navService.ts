import { NavItem } from '../../helpers/navItem';
import { getAllSedes } from './inicioService';

export async function fetchNavItems(): Promise<NavItem[]> {
  const userData = localStorage.getItem('user');
  const userId = userData ? JSON.parse(userData).id : null;

  const items: NavItem[] = [
    {
      title: 'Página principal',
      path: `/PanelAdministrador/${userId}/Inicio`,
      icon: 'ion:home-sharp',
      active: true,
      collapsible: false,
    }
  ];

  try {
    const sedes = await getAllSedes();

    const sedesSub: NavItem[] = sedes.map((sede) => ({
      title: sede.nombre,
      path: `Sedes/${sede.id_sede}`,
      active: true,
      collapsible: false
    }));

    items.push(
      {
        title: 'Sedes',
        path: `/PanelAdministrador/${userId}`,
        icon: 'mdi:domain',
        active: true,
        collapsible: true,
        sublist: sedesSub
      },
      {
        title: 'Solicitudes de matrícula',
        path: `/PanelAdministrador/${userId}/Solicitudes`,
        icon: 'mdi:clipboard-list',
        active: true,
        collapsible: false,
      },
      {
        title: 'Gestión de usuarios',
        path: `/PanelAdministrador/${userId}/Usuarios`,
        icon: 'mdi:account-cog',
        active: true,
        collapsible: false,
      }
    );

    return items;
  } catch (e) {
    return items;
  }
}
