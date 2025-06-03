import { NavItem } from '../helpers/navItem';
import { Sede } from '../models/sede';
import { Curso } from '../models/curso';
import { Materia } from '../models/materia';

/**
 * ===========================
 * 1) Obtener todas las sedes
 * ===========================
 *
 * Este método hace una solicitud GET a:
 *   GET http://localhost:8000/sedes
 * 
 * El backend debe retornar un array de objetos con la estructura:
 * [
 *   { id: 'sede1', nombre: 'Sede A' },
 *   { id: 'sede2', nombre: 'Sede B' }
 * ]
 */
async function fetchSedes(): Promise<Sede[]> {
  const res = await fetch('http://localhost:8000/sedes', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
    // credentials: 'include' // Descomentar si se usa autenticación por cookies
  });
  if (!res.ok) throw new Error(`Status ${res.status}`);
  return await res.json();
}

/**
 * =======================================
 * 2) Obtener todos los cursos con su sede
 * =======================================
 *
 * El backend debe incluir el objeto `sede` embebido dentro del objeto `curso`,
 * no solo el `sede_id`.
 *
 * Ruta esperada:
 *   GET http://localhost:8000/cursos
 *
 * Respuesta esperada:
 * [
 *   {
 *     id: "curso1",
 *     nombre: "Grado 7A",
 *     sede: { id: "sede1", nombre: "Sede A" }
 *   },
 *   ...
 * ]
 */
export interface CursoConSede extends Curso {
  sede: Sede;
}
async function fetchCursos(): Promise<CursoConSede[]> {
  const res = await fetch('http://localhost:8000/cursos', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error(`Status ${res.status}`);
  return await res.json();
}

/**
 * ================================
 * 3) Obtener todas las asignaturas
 * ================================
 *
 * Ruta esperada:
 *   GET http://localhost:8000/asignaturas
 *
 * El backend debe devolver:
 * [
 *   { id: 'mat1', nombre: 'Matemáticas' },
 *   { id: 'his1', nombre: 'Historia' }
 * ]
 */
interface AsignaturaSimple {
  id: string;
  nombre: string;
}
async function fetchAsignaturas(): Promise<AsignaturaSimple[]> {
  const res = await fetch('http://localhost:8000/asignaturas', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  if (!res.ok) throw new Error(`Status ${res.status}`);
  return await res.json();
}

/**
 * ===============================================================
 * 4) Arma el arreglo NavItem[] para el menú de navegación lateral
 * ===============================================================
 *
 * Estructura del menú:
 * - Página principal
 * - Mis sedes
 * - Mis cursos
 * - Mis asignaturas
 * - Autenticación
 *
 * Si alguna llamada al backend falla, se devuelve un menú de prueba.
 *
 * Este método puede ser llamado al montar el componente de navegación.
 */
export async function fetchNavItems(): Promise<NavItem[]> {
  // Ítem base: "Página principal"
  const items: NavItem[] = [
    {
      title: 'Página principal',
      path: '/',
      icon: 'ion:home-sharp',
      active: true,
      collapsible: false
    }
  ];

  try {
    // Llamadas simultáneas a las tres entidades del sistema
    const [sedes, cursos, asignaturas] = await Promise.all([
      fetchSedes(),
      fetchCursos(),
      fetchAsignaturas()
    ]);

    // Submenú por cada sede
    const sedesSub: NavItem[] = sedes.map((s) => ({
      title: s.nombre,
      path: `PanelProfesor/Sedes/${s.id}`,
      active: true,
      collapsible: false
    }));

    // Submenú por cada curso
    const cursosSub: NavItem[] = cursos.map((c) => ({
      title: c.nombre,
      path: `PanelProfesor/Cursos/${c.id}`,
      active: true,
      collapsible: false
    }));

    // Submenú por cada asignatura
    const asignSub: NavItem[] = asignaturas.map((a) => ({
      title: a.nombre,
      path: `PanelProfesor/Asignatura/${a.id}`,
      active: true,
      collapsible: false
    }));

    // Agrega los bloques de navegación principales
    items.push(
      {
        title: 'Mis sedes',
        path: 'PanelProfesor',
        icon: 'icomoon-free:drawer',
        active: true,
        collapsible: true,
        sublist: sedesSub
      },
      {
        title: 'Mis cursos',
        path: 'PanelProfesor',
        icon: 'mingcute:grid-fill',
        active: true,
        collapsible: true,
        sublist: cursosSub
      },
      {
        title: 'Mis asignaturas',
        path: 'PanelProfesor',
        icon: 'tabler:book',
        active: true,
        collapsible: true,
        sublist: asignSub
      },
      {
        title: 'Autenticación',
        path: 'autenticacion',
        icon: 'f7:exclamationmark-shield-fill',
        active: true,
        collapsible: true,
        sublist: [
          { title: 'Log In', path: 'login', active: true, collapsible: false },
          { title: 'Formulario de prematrícula', path: 'prematricula', active: true, collapsible: false }
        ]
      }
    );

    return items;

  } catch (e) {
    console.warn('fetchNavItems falló, usando menú de prueba →', (e as Error).message);

    // Menú de respaldo si falla el backend (datos dummy)
    return [
      {
        title: 'Página principal',
        path: '/',
        icon: 'ion:home-sharp',
        active: true,
        collapsible: false
      },
      {
        title: 'Mis sedes',
        path: 'PanelProfesor',
        icon: 'icomoon-free:drawer',
        active: true,
        collapsible: true,
        sublist: [
          { title: 'Sede 1', path: 'Sedes/1', active: true, collapsible: false },
          { title: 'Sede 2', path: 'Sedes/2', active: true, collapsible: false }
        ]
      },
      {
        title: 'Mis cursos',
        path: 'PanelProfesor',
        icon: 'mingcute:grid-fill',
        active: true,
        collapsible: true,
        sublist: [
          { title: 'Curso 1', path: 'Cursos/1', active: true, collapsible: false },
          { title: 'Curso 2', path: 'Cursos/2', active: true, collapsible: false }
        ]
      },
      {
        title: 'Mis asignaturas',
        path: 'PanelProfesor',
        icon: 'tabler:book',
        active: true,
        collapsible: true,
        sublist: [
          { title: 'Asignatura 1', path: 'Asignatura/1', active: true, collapsible: false },
          { title: 'Asignatura 2', path: 'Asignatura/2', active: true, collapsible: false }
        ]
      },
      {
        title: 'Autenticación',
        path: 'autenticacion',
        icon: 'f7:exclamationmark-shield-fill',
        active: true,
        collapsible: true,
        sublist: [
          { title: 'Log In', path: 'login', active: true, collapsible: false },
          { title: 'Formulario de prematrícula', path: 'prematricula', active: true, collapsible: false }
        ]
      }
    ];
  }
}
