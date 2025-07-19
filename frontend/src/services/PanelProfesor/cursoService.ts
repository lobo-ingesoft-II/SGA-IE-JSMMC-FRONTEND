// src/services/PanelProfesor/cursoService.ts

import type { Curso } from '../../models/PanelProfesor/curso';
import type { Sede } from '../../models/PanelProfesor/sede';
import type { Materia } from '../../models/PanelProfesor/materia';
import { getEstudiantesPorAsignatura as getEstudiantesAPI } from './estudianteService';
import type { Estudiante } from '../../models/PanelProfesor/estudiante';

// Constantes para testing
export const TEST_IDS = {
  curso: (id: string) => `curso-${id}`,
  materia: (id: string) => `materia-${id}`,
  estudiante: (id: string) => `estudiante-${id}`,
  loadingIndicator: 'loading-indicator',
  errorMessage: 'error-message',
  emptyState: 'empty-state',
  cursoHeader: 'curso-header',
  materiasList: 'materias-list',
  estudiantesList: 'estudiantes-list',
  estudiantesTable: 'estudiantes-table'
};

// Datos de prueba para testing
export const TEST_DATA = {
  curso: {
    id: 'curso1',
    nombre: 'Curso 101',
    grado: '10°',
    anioLectivo: 2023,
    sede: {
      id: 'sede1',
      nombre: 'Sede Principal Test'
    },
    materias: [
      { id: 'materia1', nombre: 'Matemáticas', docente: 'Test Profesor' },
      { id: 'materia2', nombre: 'Física', docente: 'Test Profesor' },
      { id: 'materia3', nombre: 'Química', docente: 'Test Profesor' }
    ]
  },
  estudiantes: [
    { id: 'est1', nombre: 'Estudiante Test 1', inasistencias: 2 },
    { id: 'est2', nombre: 'Estudiante Test 2', inasistencias: 0 },
    { id: 'est3', nombre: 'Estudiante Test 3', inasistencias: 7 }
  ]
};

const API_CURSOS       = 'http://localhost:8004';
const API_SEDES        = 'http://localhost:8000';
const API_ASIGNACIONES = 'http://localhost:8001';
const API_ASISTENCIAS  = 'http://localhost:8002';

// Interface para la respuesta de asignaciones con información completa
interface AsignacionResponse {
  id_asignacion: number;
  id_curso: number;
  id_asignatura: number;
  id_profesor: number;
  nombre?: string;
  nombre_asignatura?: string;
}

// Interface para la respuesta de asistencias
interface AsistenciaResponse {
  id_estudiante: number;
  id_profesor: number;
  id_curso: number;
  id_asignatura: number;
  fecha: string;
  presente: number; // 1: Presente, 2: Ausente, 3: Justificado
  observaciones: string;
  id_asistencia: number;
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
    // Primero intentamos obtener las asignaciones con IDs completos
    let asignacionesConIds: AsignacionResponse[] = [];
    
    try {
      const asignacionesResponse = await fetch(`${API_ASIGNACIONES}/asignacion_asignaturas/por_profesor/${profesorId}`);
      if (asignacionesResponse.ok) {
        const todasAsignaciones = await asignacionesResponse.json();
        // Filtrar por curso específico
        asignacionesConIds = todasAsignaciones.filter((a: AsignacionResponse) => a.id_curso === cursoId);
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
              `${API_ASIGNACIONES}/asignacion_asignaturas/asignatura/por_profesor_y_curso?id_profesor=${profesorId}&id_curso=${cursoId}`
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
      
      return materiasConIds;
    }
    
    // Fallback: método original si no se pueden obtener las asignaciones con IDs
    const response = await fetch(
      `${API_ASIGNACIONES}/asignacion_asignaturas/asignatura/por_profesor_y_curso?id_profesor=${profesorId}&id_curso=${cursoId}`
    );
    
    if (!response.ok) {
      throw new Error(`Error al obtener asignatura: ${response.status}`);
    }
    
    const responseData = await response.json();
    
    // Verificar si la respuesta es un array o un objeto único
    if (Array.isArray(responseData)) {
      return responseData.map((asignaturaData: { nombre: string }, index: number) => ({
        id: `fallback_${cursoId}_${index + 1}`, // ID temporal que incluye el curso
        nombre: asignaturaData.nombre,
        docente: nombreProfesor
      }));
    } else {
      const asignaturaData: { nombre: string } = responseData;
      return [{
        id: `fallback_${cursoId}_1`, // ID temporal que incluye el curso
        nombre: asignaturaData.nombre,
        docente: nombreProfesor
      }];
    }
  } catch (error) {
    return []; // Retornar array vacío en caso de error
  }
}

/**
 * Obtiene un curso junto con su sede y sus materias
 * para el profesor logueado.
 * @param idCurso ID del curso
 * @param testMode Si es true, devuelve datos de prueba para testing
 * @returns Información del curso
 */
export async function getCursoById(
  idCurso: string | number,
  testMode: boolean = false
): Promise<Curso> {
  // Si estamos en modo test, devolver datos de prueba
  if (testMode) {
    return TEST_DATA.curso;
  }
  const id = typeof idCurso === 'string' ? +idCurso : idCurso;

  // 1) Curso
  const respC = await fetch(`${API_CURSOS}/cursos/${id}`);
  if (!respC.ok) {
    throw new Error(`Error curso: ${respC.status}`);
  }
  const rawC: any = await respC.json();

  // 2) Sede
  let sedeNombre = 'Desconocida';
  const respS = await fetch(`${API_SEDES}/sedes/${rawC.id_sede}`);
  if (respS.ok) {
    const rawS: any = await respS.json();
    sedeNombre = rawS.nombre;
  }

  // 3) Materias asignadas
  const userStr = localStorage.getItem('user');
  if (!userStr) throw new Error('Usuario no autenticado');
  const userData = JSON.parse(userStr);
  const { id_profesor, nombres, apellidos } = userData;
  
  // Construir el nombre completo del profesor
  const nombreCompletoProfesor = nombres && apellidos 
    ? `${nombres} ${apellidos}`
    : 'Sin asignar';
  
  const materias = await getMateriasByCursoAndProfesor(id, id_profesor, nombreCompletoProfesor);

  // 4) Montar curso
  return {
    id: rawC.id_curso.toString(),
    nombre: rawC.nombre,
    grado: rawC.grado,
    anioLectivo: rawC.anio_lectivo,
    sede: {
      id: rawC.id_sede.toString(),
      nombre: sedeNombre
    },
    materias
  };
}

/**
 * Obtiene estudiantes de un curso específico con inasistencias reales de la API.
 * Usa el endpoint principal por_curso y fallback por_asignatura en puerto 8005
 * @param cursoId ID del curso
 * @param testMode Si es true, devuelve datos de prueba para testing
 * @returns Lista de estudiantes con inasistencias
 */
export async function getEstudiantesPorCurso(
  cursoId: string | number,
  testMode: boolean = false
): Promise<Array<{ id: string; nombre: string; inasistencias: number }>> {
  // Si estamos en modo test, devolver datos de prueba
  if (testMode) {
    return TEST_DATA.estudiantes;
  }
  const id = typeof cursoId === 'string' ? cursoId : cursoId.toString();
  
  try {
    // 1. Intentar primero con el endpoint por_curso (método principal)
    const urlPorCurso = `http://localhost:8005/estudiantes/por_curso/${id}`;
    const respPorCurso = await fetch(urlPorCurso);
    
    let estudiantesRaw: any[] = [];
    
    if (respPorCurso.ok) {
      const raw = await respPorCurso.json();
      
      if (Array.isArray(raw) && raw.length > 0) {
        estudiantesRaw = raw;
      } else {
        // 2. Fallback: intentar con el endpoint por_asignatura
        const urlPorAsignatura = `http://localhost:8005/estudiantes/por_asignatura/${id}`;
        const respPorAsignatura = await fetch(urlPorAsignatura);
        
        if (!respPorAsignatura.ok) {
          throw new Error(`Error al obtener estudiantes: ${respPorAsignatura.status}`);
        }
        
        estudiantesRaw = await respPorAsignatura.json();
      }
    } else {
      // 2. Fallback: intentar con el endpoint por_asignatura
      const urlPorAsignatura = `http://localhost:8005/estudiantes/por_asignatura/${id}`;
      const respPorAsignatura = await fetch(urlPorAsignatura);
      
      if (!respPorAsignatura.ok) {
        throw new Error(`Error al obtener estudiantes: ${respPorAsignatura.status}`);
      }
      
      estudiantesRaw = await respPorAsignatura.json();
    }
    
    // 3. Transformar estudiantes y obtener inasistencias reales
    const estudiantesConInasistenciasReales = await Promise.all(
      estudiantesRaw.map(async (e: any) => {
        const inasistenciasReales = await getInasistenciasReales(e.id_estudiante);
        
        return {
          id: e.id_estudiante.toString(),
          nombre: `${e.nombres} ${e.apellidos}`,
          inasistencias: inasistenciasReales
        };
      })
    );
    
    return estudiantesConInasistenciasReales;
    
  } catch (error) {
    throw error;
  }
}

/**
 * Obtiene estudiantes de una asignatura específica.
 * Utiliza el nuevo endpoint de la API de estudiantes.
 */
export async function getEstudiantesPorAsignatura(
  asignaturaId: string | number
): Promise<Estudiante[]> {
  try {
    const estudiantes = await getEstudiantesAPI(asignaturaId);
    return estudiantes;
  } catch (error) {
    throw error;
  }
}

/**
 * Obtiene la información detallada de los estudiantes para una vista específica de materia.
 * Esta función puede ser útil cuando se selecciona una materia específica y queremos
 * mostrar información más detallada de los estudiantes.
 */
export async function getEstudiantesDetalladosPorAsignatura(
  asignaturaId: string | number
): Promise<{
  estudiantes: Estudiante[];
  total: number;
  materiaId: string;
}> {
  try {
    const estudiantes = await getEstudiantesAPI(asignaturaId);
    return {
      estudiantes,
      total: estudiantes.length,
      materiaId: asignaturaId.toString()
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Obtiene el número real de inasistencias de un estudiante desde la API
 * @param idEstudiante ID del estudiante
 * @returns Número de inasistencias (presente = 2)
 */
export async function getInasistenciasReales(idEstudiante: string | number): Promise<number> {
  try {
    const response = await fetch(`${API_ASISTENCIAS}/asistencia/por_estudiante/${idEstudiante}`);
    
    if (!response.ok) {
      console.warn(`No se pudieron obtener asistencias para estudiante ${idEstudiante}`);
      return 0;
    }
    
    const asistencias: AsistenciaResponse[] = await response.json();
    
    // Contar las asistencias donde presente = 2 (Ausente)
    const inasistencias = asistencias.filter(asistencia => asistencia.presente === 2).length;
    
    return inasistencias;
  } catch (error) {
    console.error(`Error al obtener inasistencias para estudiante ${idEstudiante}:`, error);
    return 0;
  }
}