import { NavItem } from '../../helpers/navItem';
import { Sede } from '../../models/PanelProfesor/sede';
import { Curso } from '../../models/PanelProfesor/curso';
import { Materia } from '../../models/PanelProfesor/materia';
import { MateriaDetalle, getMateriaDetalle } from './asignaturaService';

export async function fetchNavItems(): Promise<NavItem[]> {
  const userData = localStorage.getItem('user');
  const userId = userData ? JSON.parse(userData).id : null;

  const items: NavItem[] = [
    {
      title: 'Página principal',
      path: `/PanelProfesor/${userId}/Inicio`,
      icon: 'ion:home-sharp',
      active: true,
      collapsible: false
    }
  ];

  try {
    const [sedes, cursos, asignaturas] = await Promise.all([
      fetchSedes(),
      fetchCursos(),
      fetchAsignaturasParaSidebar()
    ]);

    const sedesSub: NavItem[] = sedes.map((s) => ({
      title: s.nombre,
      path: `Sedes/${s.id}`,
      active: true,
      collapsible: false
    }));

    const cursosSub: NavItem[] = cursos.map((c) => ({
      title: c.nombre,
      path: `Cursos/${c.id}`,
      active: true,
      collapsible: false
    }));

    const asignSub: NavItem[] = asignaturas.map((a) => ({
      title: a.nombre,
      path: `Asignatura/${a.id}`,
      active: true,
      collapsible: false
    }));

    items.push(
      {
        title: 'Mis sedes',
        path: `/PanelProfesor/${userId}`,
        icon: 'icomoon-free:drawer',
        active: true,
        collapsible: true,
        sublist: sedesSub
      },
      {
        title: 'Mis cursos',
        path: `/PanelProfesor/${userId}`,
        icon: 'mingcute:grid-fill',
        active: true,
        collapsible: true,
        sublist: cursosSub
      },
      {
        title: 'Mis asignaturas',
        path: `/PanelProfesor/${userId}`,
        icon: 'tabler:book',
        active: true,
        collapsible: true,
        sublist: asignSub
      }
    );

    return items;
  } catch (e) {
    console.warn('fetchNavItems falló, usando menú de prueba →', (e as Error).message);
    return items;
  }
}

async function fetchSedes(): Promise<Sede[]> {
  try {
    const token = localStorage.getItem('token');

    const res = await fetch('http://localhost:8007/sedes/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();

    // Adaptar claves si vienen como id_sede → id
    return data.map((sede: any) => ({
      id: sede.id_sede,
      nombre: sede.nombre,
      direccion: sede.direccion || '' // opcional si existe
    }));
  } catch (e) {
    console.error('Error cargando sedes reales:', e);
    return [
      { id: 'sede1', nombre: 'Sede Norte', direccion: 'Calle Principal 123' },
      { id: 'sede2', nombre: 'Sede Sur', direccion: 'Avenida Siempre Viva 742' }
    ];
  }
}

export interface CursoConSede extends Curso {
  sede: Sede;
}

async function fetchCursos(): Promise<CursoConSede[]> {
  try {
    const res = await fetch('http://localhost:8000/cursos', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (e) {
    const fakeSede1: Sede = {
      id: 's1',
      nombre: 'Sede Norte',
      direccion: 'Calle Falsa 123'
    };
    return [
      {
        id: 'c1',
        nombre: 'Curso Prueba A',
        grado: '10°',
        sede: fakeSede1,
        materias: [
          { id: 'm1', nombre: 'Matemáticas', docente: 'Prof. García' },
          { id: 'm2', nombre: 'Historia', docente: 'Prof. Díaz' },
          { id: 'm3', nombre: 'Física', docente: 'Prof. López' }
        ]
      },
      {
        id: 'c2',
        nombre: 'Curso Prueba B',
        grado: '11°',
        sede: fakeSede1,
        materias: [
          { id: 'm4', nombre: 'Química', docente: 'Prof. Rodríguez' }
        ]
      }
    ];
  }
}

async function fetchAsignaturasParaSidebar(): Promise<Materia[]> {
  const materiaIds = ['m1', 'm2', 'm3', 'm4'];
  const asignaturasDetalle: MateriaDetalle[] = [];

  for (const id of materiaIds) {
    try {
      const detalle = await getMateriaDetalle(id);
      asignaturasDetalle.push(detalle);
    } catch {
      // Silenciar error
    }
  }

  return asignaturasDetalle.map(detalle => ({
    id: detalle.id,
    nombre: detalle.nombre,
    docente: detalle.docente
  }));
}
