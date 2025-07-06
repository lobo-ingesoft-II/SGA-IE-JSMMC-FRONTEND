import { NavItem } from '../../helpers/navItem';
import { Sede } from '../../models/PanelProfesor/sede';
import { Curso } from '../../models/PanelProfesor/curso';
import { Materia } from '../../models/PanelProfesor/materia';
import { getAsignaturasDelProfesor } from './asignaturaService';

export async function fetchNavItems(): Promise<NavItem[]> {
  const userData = localStorage.getItem('user');
  const userId = userData ? JSON.parse(userData).id : null;
  const profesorId = userData ? JSON.parse(userData).id_profesor || 2 : 2;

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
      fetchSedes(profesorId),
      fetchCursosDelProfesor(profesorId),
      getAsignaturasDelProfesor()
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

async function fetchSedes(profesorId: number): Promise<Sede[]> {
  try {
    const token = localStorage.getItem('token');

    const res = await fetch(`http://localhost:8000/sedes/por_profesor/${profesorId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();

    return data.map((sede: any) => ({
      id: sede.id_sede,
      nombre: sede.nombre,
      direccion: sede.direccion || ''
    }));
  } catch (e) {
    console.error('Error cargando sedes reales:', e);
    return [
      { id: 'sede1', nombre: 'Sede Norte' },
      { id: 'sede2', nombre: 'Sede Sur' }
    ];
  }
}

export interface CursoConSede extends Curso {
  sede: Sede;
}

async function fetchCursosDelProfesor(profesorId: number): Promise<CursoConSede[]> {
  try {
    const res = await fetch(`http://localhost:8004/cursos/profesores/${profesorId}/cursos`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    return data.map((curso: any) => ({
      id: curso.id_curso.toString(),
      nombre: curso.nombre,
      grado: curso.grado,
      anioLectivo: curso.anio_lectivo,
      materias: [],
      sede: { id: curso.id_sede.toString(), nombre: '' } // opcional, se puede completar si se desea
    }));
  } catch (e) {
    console.error('Error cargando cursos del profesor:', e);
    return [];
  }
}


