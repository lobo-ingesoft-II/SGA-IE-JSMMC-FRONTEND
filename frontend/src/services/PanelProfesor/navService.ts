import { NavItem } from '../../helpers/navItem';
import { Sede } from '../../models/PanelProfesor/sede';
import { Curso } from '../../models/PanelProfesor/curso';
import { Materia } from '../../models/PanelProfesor/materia';
import { MateriaDetalle, getMateriaDetalle } from './asignaturaService';

/**
 * ===========================
 * 1) Obtener todas las sedes
 * ===========================
 *
 * Este método hace una solicitud GET a:
 * GET http://localhost:8000/sedes
 *
 * El backend debe retornar un array de objetos con la estructura:
 * [
 * { id: 'sede1', nombre: 'Sede A', direccion: 'Dirección de Sede A' },
 * { id: 'sede2', nombre: 'Sede B', direccion: 'Dirección de Sede B' }
 * ]
 */
async function fetchSedes(): Promise<Sede[]> {
  // Datos de prueba si el backend no está disponible
  try {
    const res = await fetch('http://localhost:8000/sedes', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
      // credentials: 'include' // Descomentar si se usa autenticación por cookies
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn('fetchSedes falló, usando datos de prueba.');
    return [
      { id: 'sede1', nombre: 'Sede Norte', direccion: 'Calle Principal 123' },
      { id: 'sede2', nombre: 'Sede Sur', direccion: 'Avenida Siempre Viva 742' }
    ];
  }
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
 * GET http://localhost:8000/cursos
 *
 * Respuesta esperada:
 * [
 * {
 * id: "curso1",
 * nombre: "Grado 7A",
 * sede: { id: "sede1", nombre: "Sede A" }
 * },
 * ...
 * ]
 */
export interface CursoConSede extends Curso {
  sede: Sede;
}
async function fetchCursos(): Promise<CursoConSede[]> {
  // Datos dummy
  try {
    const res = await fetch('http://localhost:8000/cursos', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error(`Status ${res.status}`);
    return await res.json();
  } catch (e) {
    console.warn('fetchCursos falló, usando datos de prueba.');
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

/**
 * ================================
 * 3) Obtener todas las asignaturas
 * ================================
 *
 * Esta función ya no llama a un endpoint '/asignaturas' separado.
 * En su lugar, obtendrá todas las MateriaDetalle de los datos de prueba del
 * asignaturaService para generar la lista de asignaturas.
 *
 * En un escenario real, el backend podría tener un endpoint que liste todas
 * las asignaturas a las que un profesor está asignado, o todas las asignaturas
 * en general, para el menú. Aquí usamos los datos de prueba que ya definimos.
 */
async function fetchAsignaturasParaSidebar(): Promise<Materia[]> {
  // Simula la obtención de un listado de todas las materias disponibles
  // Esto es un workaround para el backend que no tenemos, idealmente el backend
  // tendría un endpoint para listar las materias del profesor
  const materiaIds = ['m1', 'm2', 'm3', 'm4']; // IDs de las materias de prueba

  const asignaturasDetalle: MateriaDetalle[] = [];
  for (const id of materiaIds) {
    try {
      // Intentamos obtener el detalle, pero no lanzamos error si no lo encuentra,
      // solo lo ignoramos para el sidebar si no hay datos.
      const detalle = await getMateriaDetalle(id);
      asignaturasDetalle.push(detalle);
    } catch (e) {
      console.warn(`No se pudieron cargar los detalles para la materia ${id} en navService.`);
    }
  }

  // Mapeamos los detalles a la interfaz Materia simple para el sidebar
  return asignaturasDetalle.map(detalle => ({
    id: detalle.id,
    nombre: detalle.nombre,
    docente: detalle.docente // Opcional, si quieres mostrar el docente en el sidebar
  }));
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
      fetchAsignaturasParaSidebar()
    ]);

    // Submenú por cada sede
    const sedesSub: NavItem[] = sedes.map((s) => ({
      title: s.nombre,
      path: `Sedes/${s.id}`, // Solo 'Sedes/sede1', el NavButton construirá /PanelProfesor/Sedes/sede1
      active: true,
      collapsible: false
    }));

    // Submenú por cada curso
    const cursosSub: NavItem[] = cursos.map((c) => ({
      title: c.nombre,
      path: `Cursos/${c.id}`, // Solo 'Cursos/c1'
      active: true,
      collapsible: false
    }));

    // Submenú por cada asignatura
    const asignSub: NavItem[] = asignaturas.map((a) => ({
      title: a.nombre,
      path: `Asignatura/${a.id}`, // Solo 'Asignatura/m1'
      active: true,
      collapsible: false
    }));

    items.push(
      {
        title: 'Mis sedes',
        path: '/PanelProfesor', // La ruta base del grupo es absoluta
        icon: 'icomoon-free:drawer',
        active: true,
        collapsible: true,
        sublist: sedesSub
      },
      {
        title: 'Mis cursos',
        path: '/PanelProfesor',
        icon: 'mingcute:grid-fill',
        active: true,
        collapsible: true,
        sublist: cursosSub
      },
      {
        title: 'Mis asignaturas',
        path: '/PanelProfesor',
        icon: 'tabler:book',
        active: true,
        collapsible: true,
        sublist: asignSub
      },
      {
        title: 'Autenticación',
        path: '/autenticacion', // Ruta absoluta
        icon: 'f7:exclamationmark-shield-fill',
        active: true,
        collapsible: true,
        sublist: [
          { title: 'Log In', path: '/autenticacion/login', active: true, collapsible: false }, 
          { title: 'Formulario de prematrícula', path: '/autenticacion/prematricula', active: true, collapsible: false } 
        ]
      }
    );

    return items;

  } catch (e) {
    console.warn('fetchNavItems falló, usando menú de prueba →', (e as Error).message);

    // datos dummy
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
        path: '/PanelProfesor',
        icon: 'icomoon-free:drawer',
        active: true,
        collapsible: true,
        sublist: [
          { title: 'Sede Norte (Dummy)', path: 'Sedes/sede1', active: true, collapsible: false }, 
          { title: 'Sede Sur (Dummy)', path: 'Sedes/sede2', active: true, collapsible: false } 
        ]
      },
      {
        title: 'Mis cursos',
        path: '/PanelProfesor',
        icon: 'mingcute:grid-fill',
        active: true,
        collapsible: true,
        sublist: [
          { title: 'Curso Prueba A (Dummy)', path: 'Cursos/c1', active: true, collapsible: false }, 
          { title: 'Curso Prueba B (Dummy)', path: 'Cursos/c2', active: true, collapsible: false } 
        ]
      },
      {
        title: 'Mis asignaturas',
        path: '/PanelProfesor',
        icon: 'tabler:book',
        active: true,
        collapsible: true,
        sublist: [
          { title: 'Matemáticas (Dummy)', path: 'Asignatura/m1', active: true, collapsible: false }, 
          { title: 'Historia (Dummy)', path: 'Asignatura/m2', active: true, collapsible: false }, 
          { title: 'Física (Dummy)', path: 'Asignatura/m3', active: true, collapsible: false },
          { title: 'Química (Dummy)', path: 'Asignatura/m4', active: true, collapsible: false } 
        ]
      },
      {
        title: 'Autenticación',
        path: '/autenticacion',
        icon: 'f7:exclamationmark-shield-fill',
        active: true,
        collapsible: true,
        sublist: [
          { title: 'Log In', path: '/autenticacion/login', active: true, collapsible: false },
          { title: 'Formulario de prematrícula', path: '/autenticacion/prematricula', active: true, collapsible: false }
        ]
      }
    ];
  }
}