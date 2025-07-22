import { NavItem } from '../../helpers/navItem';
import { Sede } from '../../models/PanelProfesor/sede';
import { Curso } from '../../models/PanelProfesor/curso';
import { Materia } from '../../models/PanelProfesor/materia';
import { getAsignaturasDelProfesor } from './asignaturaService';

// Constantes para testing
export const TEST_IDS = {
  navItem: (title: string) => `nav-item-${title.replace(/\s+/g, '-').toLowerCase()}`,
  subNavItem: (parent: string, title: string) => `subnav-item-${parent.replace(/\s+/g, '-').toLowerCase()}-${title.replace(/\s+/g, '-').toLowerCase()}`
};

// Datos de prueba para testing
export const TEST_DATA = {
  sedes: [
    { id: 'sede1', nombre: 'Sede Norte', direccion: 'Calle 123' },
    { id: 'sede2', nombre: 'Sede Sur', direccion: 'Avenida 456' }
  ],
  cursos: [
    { id: 'curso1', nombre: 'Curso 101', grado: '10°', anioLectivo: 2023, materias: [], sede: { id: 'sede1', nombre: 'Sede Norte' } },
    { id: 'curso2', nombre: 'Curso 201', grado: '11°', anioLectivo: 2023, materias: [], sede: { id: 'sede2', nombre: 'Sede Sur' } }
  ],
  asignaturas: [
    { id: 'materia1', nombre: 'Matemáticas', docente: 'Test Profesor' },
    { id: 'materia2', nombre: 'Física', docente: 'Test Profesor' }
  ]
};

/**
 * Obtiene los elementos de navegación para el sidebar
 * @param testMode Si es true, devuelve datos de prueba para testing
 * @returns Lista de elementos de navegación
 */
export async function fetchNavItems(testMode: boolean = false): Promise<NavItem[]> {
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
    // Si estamos en modo test, usar datos de prueba
    if (testMode) {
      const sedes = TEST_DATA.sedes;
      const cursos = TEST_DATA.cursos;
      const asignaturas = TEST_DATA.asignaturas;
      
      return buildNavItems(userId, sedes, cursos, asignaturas);
    }
    
    const [sedes, cursos, asignaturas] = await Promise.all([
      fetchSedes(profesorId),
      fetchCursosDelProfesor(profesorId),
      getAsignaturasDelProfesor()
    ]);

    return buildNavItems(userId, sedes, cursos, asignaturas);
  } catch (e) {
    console.error('Error cargando elementos de navegación:', e);
    // fetchNavItems falló, usando menú de prueba
    return items;
  }
}

/**
 * Construye los elementos de navegación a partir de los datos
 * @param userId ID del usuario
 * @param sedes Lista de sedes
 * @param cursos Lista de cursos
 * @param asignaturas Lista de asignaturas
 * @returns Lista de elementos de navegación
 */
function buildNavItems(
  userId: string | null,
  sedes: Sede[],
  cursos: CursoConSede[],
  asignaturas: Materia[]
): NavItem[] {
  const items: NavItem[] = [
    {
      title: 'Página principal',
      path: `/PanelProfesor/${userId}/Inicio`,
      icon: 'ion:home-sharp',
      active: true,
      collapsible: false,
      testId: TEST_IDS.navItem('Página principal')
    }
  ];
  
  const sedesSub: NavItem[] = sedes.map((s) => ({
    title: s.nombre,
    path: `Sedes/${s.id}`,
    active: true,
    collapsible: false,
    testId: TEST_IDS.subNavItem('Mis sedes', s.nombre)
  }));

  const cursosSub: NavItem[] = cursos.map((c) => ({
    title: `${c.grado} (${c.nombre})`,
    path: `Cursos/${c.id}`,
    active: true,
    collapsible: false,
    testId: TEST_IDS.subNavItem('Mis cursos', c.nombre)
  }));

  const asignSub: NavItem[] = asignaturas.map((a) => ({
    title: a.nombre,
    path: `Asignatura/${a.id}`,
    active: true,
    collapsible: false,
    testId: TEST_IDS.subNavItem('Mis asignaturas', a.nombre)
  }));

  items.push(
    {
      title: 'Mis sedes',
      path: `/PanelProfesor/${userId}`,
      icon: 'icomoon-free:drawer',
      active: true,
      collapsible: true,
      sublist: sedesSub,
      testId: TEST_IDS.navItem('Mis sedes')
    },
    {
      title: 'Mis cursos',
      path: `/PanelProfesor/${userId}`,
      icon: 'mingcute:grid-fill',
      active: true,
      collapsible: true,
      sublist: cursosSub,
      testId: TEST_IDS.navItem('Mis cursos')
    },
    {
      title: 'Mis asignaturas',
      path: `/PanelProfesor/${userId}`,
      icon: 'tabler:book',
      active: true,
      collapsible: true,
      sublist: asignSub,
      testId: TEST_IDS.navItem('Mis asignaturas')
    }
  );

  return items;
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
    console.error('Error cargando sedes:', e);
    return TEST_DATA.sedes;
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
    return TEST_DATA.cursos;
  }
}


