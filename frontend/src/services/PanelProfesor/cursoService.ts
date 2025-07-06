// src/services/PanelProfesor/cursoService.ts

import type { Curso } from '../../models/PanelProfesor/curso';
import type { Sede } from '../../models/PanelProfesor/sede';
import type { Materia } from '../../models/PanelProfesor/materia';

const API_CURSOS       = 'http://localhost:8004';
const API_SEDES        = 'http://localhost:8000';
const API_ASIGNACIONES = 'http://localhost:8001';

/**
 * Obtiene las materias asignadas a un curso por un profesor.
 */
async function getMateriasByCursoAndProfesor(
  cursoId: number,
  profesorId: number
): Promise<Materia[]> {
  try {
    console.log(`🔍 Obteniendo materias para curso ${cursoId} y profesor ${profesorId}`);
    
    // Usar únicamente el endpoint especificado
    const response = await fetch(
      `${API_ASIGNACIONES}/asignacion_asignaturas/asignatura/por_profesor_y_curso?id_profesor=${profesorId}&id_curso=${cursoId}`
    );
    
    if (!response.ok) {
      console.error(`❌ Error en API: ${response.status} ${response.statusText}`);
      throw new Error(`Error al obtener asignatura: ${response.status}`);
    }
    
    const responseData = await response.json();
    console.log('📦 Respuesta de la API:', responseData);
    
    // Verificar si la respuesta es un array o un objeto único
    if (Array.isArray(responseData)) {
      console.log('📋 Procesando múltiples asignaturas:', responseData.length);
      // Si es un array de asignaturas
      return responseData.map((asignaturaData: { nombre: string }, index: number) => ({
        id: (index + 1).toString(), // Generar IDs secuenciales
        nombre: asignaturaData.nombre,
        docente: 'Sin asignar'
      }));
    } else {
      console.log('📄 Procesando una sola asignatura:', responseData.nombre);
      // Si es un objeto único con una asignatura
      const asignaturaData: { nombre: string } = responseData;
      return [{
        id: '1',
        nombre: asignaturaData.nombre,
        docente: 'Sin asignar'
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
  const { id_profesor } = JSON.parse(userStr);
  const materias = await getMateriasByCursoAndProfesor(id, id_profesor);

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
