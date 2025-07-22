import { Sede } from '../../models/PanelProfesor/sede';
import { Curso } from '../../models/PanelProfesor/curso';
import { Materia } from '../../models/PanelProfesor/materia';

// Constantes para testing
export const TEST_IDS = {
  sede: (id: string) => `sede-${id}`,
  curso: (id: string) => `curso-${id}`,
  materia: (id: string) => `materia-${id}`,
  loadingIndicator: 'loading-indicator',
  errorMessage: 'error-message',
  emptyState: 'empty-state',
  sedeHeader: 'sede-header',
  cursosList: 'cursos-list',
  materiasList: (cursoId: string) => `materias-list-${cursoId}`,
  expandButton: (cursoId: string) => `expand-button-${cursoId}`
};

// Datos de prueba para testing
export const TEST_DATA = {
  sede: {
    id: 'sede1',
    nombre: 'Sede Principal Test'
  },
  cursos: [
    {
      id: 'curso1',
      nombre: 'Curso 101',
      grado: '10°',
      anioLectivo: 2023,
      sede: { id: 'sede1', nombre: 'Sede Principal Test' },
      materias: [
        { id: 'materia1', nombre: 'Matemáticas', docente: 'Test Profesor' },
        { id: 'materia2', nombre: 'Física', docente: 'Test Profesor' }
      ]
    },
    {
      id: 'curso2',
      nombre: 'Curso 201',
      grado: '11°',
      anioLectivo: 2023,
      sede: { id: 'sede1', nombre: 'Sede Principal Test' },
      materias: [
        { id: 'materia3', nombre: 'Química', docente: 'Test Profesor' },
        { id: 'materia4', nombre: 'Biología', docente: 'Test Profesor' }
      ]
    }
  ]
};

export interface CursoConSede extends Curso {
  sede: Sede;
  anioLectivo: number;
}

// Interface para la respuesta de asignaciones con información completa
interface AsignacionResponse {
  id_asignacion: number;
  id_curso: number;
  id_asignatura: number;
  id_profesor: number;
  nombre?: string;
  nombre_asignatura?: string;
}

/**
 * Obtiene las materias asignadas a un curso por un profesor.
 * Ahora usa los IDs de asignación reales para navegación correcta
 */
async function getMateriasByCursoAndProfesor(
  cursoId: number,
  profesorId: number,
  nombreProfesor: string = 'Sin asignar'
): Promise<Materia[]> {
  try {
    // Obteniendo materias para curso y profesor
    
    // Primero intentamos obtener las asignaciones con IDs completos
    let asignacionesConIds: AsignacionResponse[] = [];
    
    try {
      const asignacionesResponse = await fetch(`http://localhost:8001/asignacion_asignaturas/por_profesor/${profesorId}`);
      if (asignacionesResponse.ok) {
        const todasAsignaciones = await asignacionesResponse.json();
        // Filtrar por curso específico
        asignacionesConIds = todasAsignaciones.filter((a: AsignacionResponse) => a.id_curso === cursoId);
        // Asignaciones con IDs encontradas
      }
    } catch (error) {
      // No se pudieron obtener asignaciones con IDs, usando método alternativo
    }
    
    // Si tenemos asignaciones con IDs, usarlas
    if (asignacionesConIds.length > 0) {
      const materiasConIds: Materia[] = [];
      
      for (const asignacion of asignacionesConIds) {
        // Obtener el nombre de la asignatura
        let nombreAsignatura = asignacion.nombre || asignacion.nombre_asignatura;
        
        if (!nombreAsignatura) {
          try {
            const nombreResponse = await fetch(
              `http://localhost:8001/asignacion_asignaturas/asignatura/por_profesor_y_curso?id_profesor=${profesorId}&id_curso=${cursoId}`
            );
            if (nombreResponse.ok) {
              const nombreData = await nombreResponse.json();
              if (Array.isArray(nombreData)) {
                const matchingAsignatura = nombreData.find((_, index) => index === materiasConIds.length);
                nombreAsignatura = matchingAsignatura?.nombre || `Asignatura ${asignacion.id_asignatura}`;
              } else {
                nombreAsignatura = nombreData.nombre || `Asignatura ${asignacion.id_asignatura}`;
              }
            }
          } catch (error) {
            nombreAsignatura = `Asignatura ${asignacion.id_asignatura}`;
          }
        }
        
        materiasConIds.push({
          id: asignacion.id_asignacion.toString(), // Usar el ID de asignación real
          nombre: nombreAsignatura || `Asignatura ${asignacion.id_asignatura}`, // Fallback si es undefined
          docente: nombreProfesor
        });
      }
      
      // Materias con IDs correctos encontradas
      return materiasConIds;
    }
    
    // Fallback: método original si no se pueden obtener las asignaciones con IDs
    const response = await fetch(
      `http://localhost:8001/asignacion_asignaturas/asignatura/por_profesor_y_curso?id_profesor=${profesorId}&id_curso=${cursoId}`
    );
    
    if (!response.ok) {
      throw new Error(`Error en API: ${response.status} ${response.statusText}`);
      return [];
    }
    
    const responseData = await response.json();
    // Respuesta de la API (fallback)
    
    // Verificar si la respuesta es un array o un objeto único
    if (Array.isArray(responseData)) {
      // Procesando múltiples asignaturas (fallback)
      return responseData.map((asignaturaData: { nombre: string }, index: number) => ({
        id: `fallback_${cursoId}_${index + 1}`, // ID temporal que incluye el curso
        nombre: asignaturaData.nombre,
        docente: nombreProfesor
      }));
    } else {
      // Procesando una sola asignatura (fallback)
      const asignaturaData: { nombre: string } = responseData;
      return [{
        id: `fallback_${cursoId}_1`, // ID temporal que incluye el curso
        nombre: asignaturaData.nombre,
        docente: nombreProfesor
      }];
    }
  } catch (error) {
    throw error;
    return [];
  }
}

/**
 * Obtiene la información de una sede y sus cursos asignados
 * @param sedeId ID de la sede
 * @param testMode Si es true, devuelve datos de prueba para testing
 * @returns Información de la sede y sus cursos
 */
export async function getSedeAndCursos(
  sedeId: string,
  testMode: boolean = false
): Promise<{ sede: Sede; cursos: CursoConSede[] }> {
  // Si estamos en modo test, devolver datos de prueba
  if (testMode) {
    return {
      sede: TEST_DATA.sede,
      cursos: TEST_DATA.cursos
    };
  }
  // Obtener datos del usuario
  const userDataString = localStorage.getItem('user');
  if (!userDataString) {
    throw new Error('No se encontraron datos de usuario en localStorage');
    return {
      sede: { id: sedeId, nombre: 'Sede desconocida' },
      cursos: []
    };
  }

  const userData = JSON.parse(userDataString);
  const profesorId = userData.id_profesor;

  if (!profesorId) {
    throw new Error('No se encontró ID de profesor en userData');
    return {
      sede: { id: sedeId, nombre: 'Sede desconocida' },
      cursos: []
    };
  }

  let sede: Sede;

  // 1. Obtener datos de la sede
  try {
    const sedeRes = await fetch(`http://localhost:8000/sedes/${sedeId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!sedeRes.ok) throw new Error(`Sede status ${sedeRes.status}`);
    const sedeRaw = await sedeRes.json();

    sede = {
      id: sedeRaw.id_sede.toString(),
      nombre: sedeRaw.nombre
    };
  } catch (error: any) {
    throw new Error('Error al obtener la sede: ' + error.message);
    return {
      sede: {
        id: sedeId,
        nombre: 'Sede desconocida'
      },
      cursos: []
    };
  }

  // 2. Obtener cursos del profesor autenticado
  try {
    const cursosRes = await fetch(`http://localhost:8004/cursos/profesores/${profesorId}/cursos`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!cursosRes.ok) throw new Error(`Cursos status ${cursosRes.status}`);
    const cursosRaw = await cursosRes.json();

    // Filtrar cursos por sede
    const cursosBasicos = cursosRaw
      .filter((c: any) => String(c.id_sede) === String(sedeId))
      .map((c: any) => ({
        id: c.id_curso.toString(),
        nombre: c.nombre,
        grado: c.grado,
        anioLectivo: c.anio_lectivo,
        sede,
        materias: [] // Se llenarán después
      }));

    // 3. Obtener materias para cada curso
    const cursosConMaterias: CursoConSede[] = await Promise.all(
      cursosBasicos.map(async (curso) => {
        // Construir el nombre completo del profesor
        const nombreCompleto = userData.nombres && userData.apellidos 
          ? `${userData.nombres} ${userData.apellidos}`
          : 'Sin asignar';
          
        const materias = await getMateriasByCursoAndProfesor(
          parseInt(curso.id),
          profesorId,
          nombreCompleto
        );
        
        return {
          ...curso,
          materias
        };
      })
    );

    return { sede, cursos: cursosConMaterias };
  } catch (error: any) {
    throw new Error('Error al obtener cursos: ' + error.message);
    return {
      sede,
      cursos: []
    };
  }
}