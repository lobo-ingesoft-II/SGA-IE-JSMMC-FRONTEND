// src/services/PanelProfesor/cursoService.ts

import type { Curso } from '../../models/PanelProfesor/curso';
import type { Sede } from '../../models/PanelProfesor/sede';
import type { Materia } from '../../models/PanelProfesor/materia';

const API_CURSOS       = 'http://localhost:8004';
const API_SEDES        = 'http://localhost:8000';
const API_ASIGNACIONES = 'http://localhost:8001';

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
    console.log(`🔍 Obteniendo materias para curso ${cursoId} y profesor ${profesorId}`);
    
    // Primero intentamos obtener las asignaciones con IDs completos
    let asignacionesConIds: AsignacionResponse[] = [];
    
    try {
      const asignacionesResponse = await fetch(`${API_ASIGNACIONES}/asignacion_asignaturas/por_profesor/${profesorId}`);
      if (asignacionesResponse.ok) {
        const todasAsignaciones = await asignacionesResponse.json();
        // Filtrar por curso específico
        asignacionesConIds = todasAsignaciones.filter((a: AsignacionResponse) => a.id_curso === cursoId);
        console.log('📋 Asignaciones con IDs encontradas:', asignacionesConIds);
      }
    } catch (error) {
      console.warn('⚠️ No se pudieron obtener asignaciones con IDs, usando método alternativo');
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
      
      console.log('✅ Materias con IDs correctos:', materiasConIds);
      return materiasConIds;
    }
    
    // Fallback: método original si no se pueden obtener las asignaciones con IDs
    const response = await fetch(
      `${API_ASIGNACIONES}/asignacion_asignaturas/asignatura/por_profesor_y_curso?id_profesor=${profesorId}&id_curso=${cursoId}`
    );
    
    if (!response.ok) {
      console.error(`❌ Error en API: ${response.status} ${response.statusText}`);
      throw new Error(`Error al obtener asignatura: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log('📦 Respuesta de la API (fallback):', responseData);
    
    // Verificar si la respuesta es un array o un objeto único
    if (Array.isArray(responseData)) {
      console.log('📋 Procesando múltiples asignaturas (fallback):', responseData.length);
      return responseData.map((asignaturaData: { nombre: string }, index: number) => ({
        id: `fallback_${cursoId}_${index + 1}`, // ID temporal que incluye el curso
        nombre: asignaturaData.nombre,
        docente: nombreProfesor
      }));
    } else {
      console.log('📄 Procesando una sola asignatura (fallback):', responseData.nombre);
      const asignaturaData: { nombre: string } = responseData;
      return [{
        id: `fallback_${cursoId}_1`, // ID temporal que incluye el curso
        nombre: asignaturaData.nombre,
        docente: nombreProfesor
      }];
    }
  } catch (error) {
    console.error('❌ Error al obtener materias:', error);
    return []; // Retornar array vacío en caso de error
  }
}

/**
 * Obtiene un curso junto con su sede y sus materias
 * para el profesor logueado.
 */
export async function getCursoById(
  idCurso: string | number
): Promise<Curso> {
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
 * Obtiene estudiantes de un curso específico.
 */
export async function getEstudiantesPorCurso(
  cursoId: string | number
): Promise<Array<{ id: string; nombre: string; inasistencias: number }>> {
  const id = typeof cursoId === 'string' ? +cursoId : cursoId;
  const resp = await fetch(`http://localhost:8004/cursos/${id}/estudiantes`);
  if (!resp.ok) {
    throw new Error(`Error estudiantes: ${resp.status}`);
  }
  const raw = await resp.json();
  return raw.map((e: any) => ({
    id: e.id_estudiante.toString(),
    nombre: `${e.nombres} ${e.apellidos}`,
    inasistencias: e.inasistencias || 0
  }));
}
