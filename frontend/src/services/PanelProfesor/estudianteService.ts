import { Estudiante, EstudianteAPI } from '../../models/PanelProfesor/estudiante';

const API_ESTUDIANTES = 'http://localhost:8005';

/**
 * Obtiene estudiantes por ID de curso
 * Usa el endpoint principal por_curso y fallback por_asignatura
 */
export const getEstudiantesPorCurso = async (cursoId: string | number): Promise<Estudiante[]> => {
  const id = typeof cursoId === 'string' ? cursoId : cursoId.toString();
  
  try {
    // 1. Intentar primero con el endpoint por_curso (método principal)
    const urlPorCurso = `${API_ESTUDIANTES}/estudiantes/por_curso/${id}`;
    const respPorCurso = await fetch(urlPorCurso);
    
    if (respPorCurso.ok) {
      const estudiantesAPI: EstudianteAPI[] = await respPorCurso.json();
      
      if (Array.isArray(estudiantesAPI) && estudiantesAPI.length > 0) {
        return estudiantesAPI.map((estudiante, index) => ({
          id: estudiante.id_estudiante?.toString() || `estudiante_${index}`,
          nombre: `${estudiante.nombres || 'Sin nombre'} ${estudiante.apellidos || 'Sin apellido'}`.trim(),
          inasistencias: 0
        }));
      }
    }
    
    // 2. Fallback: intentar con el endpoint por_asignatura
    const urlPorAsignatura = `${API_ESTUDIANTES}/estudiantes/por_asignatura/${id}`;
    const response = await fetch(urlPorAsignatura);

    if (!response.ok) {
      throw new Error(`Error al obtener estudiantes: ${response.status} ${response.statusText}`);
    }

    const estudiantesAPI: EstudianteAPI[] = await response.json();
    
    if (!Array.isArray(estudiantesAPI)) {
      return [];
    }
    
    // Transformar la respuesta de la API al formato esperado por el frontend
    return estudiantesAPI.map((estudiante, index) => ({
      id: estudiante.id_estudiante?.toString() || `estudiante_${index}`,
      nombre: `${estudiante.nombres || 'Sin nombre'} ${estudiante.apellidos || 'Sin apellido'}`.trim(),
      inasistencias: 0
    }));
    
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene estudiantes por ID de asignatura.
 * 
 * @param asignaturaId ID de la asignatura para obtener los estudiantes
 * @returns Una promesa que resuelve a un arreglo de estudiantes.
 * @throws Error si el servidor responde con un estado distinto de 200 OK.
 */
export const getEstudiantesPorAsignatura = async (asignaturaId: string | number): Promise<Estudiante[]> => {
  const id = typeof asignaturaId === 'string' ? asignaturaId : asignaturaId.toString();
  
  try {
    const response = await fetch(`${API_ESTUDIANTES}/estudiantes/por_asignatura/${id}`);

    if (!response.ok) {
      throw new Error(`Error al obtener estudiantes: ${response.status} ${response.statusText}`);
    }

    const estudiantesAPI: EstudianteAPI[] = await response.json();
    
    // Transformar la respuesta de la API al formato esperado por el frontend
    return estudiantesAPI.map((estudiante) => ({
      id: estudiante.id_estudiante.toString(),
      nombre: `${estudiante.nombres} ${estudiante.apellidos}`,
      inasistencias: 0 // Por defecto 0, ya que la API no devuelve este campo
    }));
  } catch (error) {
    throw error;
  }
};


