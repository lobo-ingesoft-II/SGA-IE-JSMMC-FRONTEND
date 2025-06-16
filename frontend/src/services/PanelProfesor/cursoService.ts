import { Curso } from '../../models/PanelProfesor/curso';
import { Sede } from '../../models/PanelProfesor/sede';

/**
 * Extiende la interfaz base Curso para incluir la sede anidada.
 */
export interface CursoConSede extends Curso {
  sede: Sede;
  anioLectivo: number;
}

/**
 * Obtiene un curso específico junto con su sede.
 */
export async function getCursoById(idCurso: string | number): Promise<CursoConSede> {
  // Convertir a número si es string
  const id = typeof idCurso === 'string' ? parseInt(idCurso, 10) : idCurso;
  
  try {
    // 1. Traer datos del curso
    const cursoRes = await fetch(`http://127.0.0.1:8004/cursos/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!cursoRes.ok) {
      throw new Error(`Error al obtener curso ${id} (status ${cursoRes.status})`);
    }
    
    const cursoRaw = await cursoRes.json();

    // 2. Traer nombre de sede
    let sedeNombre = 'Sede desconocida';
    try {
      const sedeRes = await fetch(`http://localhost:8007/sedes/${cursoRaw.id_sede}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (sedeRes.ok) {
        const sedeRaw = await sedeRes.json();
        sedeNombre = sedeRaw.nombre;
      }
    } catch (e) {
      console.error(`Error obteniendo sede ${cursoRaw.id_sede}`, e);
    }

    return {
      id: cursoRaw.id_curso.toString(),
      nombre: cursoRaw.nombre,
      grado: cursoRaw.grado,
      anioLectivo: cursoRaw.anio_lectivo,
      sede: { 
        id: cursoRaw.id_sede.toString(), 
        nombre: sedeNombre 
      },
      materias: []
    };
  } catch (error: any) {
    console.error('Error en getCursoById:', error.message);
    throw error;
  }
}

/**
 * Obtiene todos los cursos de un profesor específico
 */
export async function getCursosByProfesor(profesorId: string | number): Promise<CursoConSede[]> {
  // Convertir a número si es string
  const id = typeof profesorId === 'string' ? parseInt(profesorId, 10) : profesorId;
  
  try {
    const response = await fetch(`http://127.0.0.1:8004/cursos/profesores/${id}/cursos`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener cursos del profesor ${id} (status ${response.status})`);
    }

    const rawList = await response.json();
    
    // Obtener detalles de sede en paralelo
    const cursosConSedes = await Promise.all(
      rawList.map(async (c: any) => {
        let sedeNombre = 'Sede desconocida';
        try {
          const sedeRes = await fetch(`http://localhost:8007/sedes/${c.id_sede}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (sedeRes.ok) {
            const sedeRaw = await sedeRes.json();
            sedeNombre = sedeRaw.nombre;
          }
        } catch (e) {
          console.error(`Error obteniendo sede ${c.id_sede}`, e);
        }

        return {
          id: c.id_curso.toString(),
          nombre: c.nombre,
          grado: c.grado,
          anioLectivo: c.anio_lectivo,
          sede: { 
            id: c.id_sede.toString(), 
            nombre: sedeNombre 
          },
          materias: []
        };
      })
    );

    return cursosConSedes;
  } catch (error: any) {
    console.error('Error en getCursosByProfesor:', error.message);
    throw error;
  }
}

/**
 * Obtiene estudiantes de un curso específico
 */
export async function getEstudiantesPorCurso(cursoId: string | number): Promise<any[]> {
  // Convertir a número si es string
  const id = typeof cursoId === 'string' ? parseInt(cursoId, 10) : cursoId;
  
  try {
    const response = await fetch(`http://127.0.0.1:8005/cursos/${id}/estudiantes`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener estudiantes (status ${response.status})`);
    }

    const estudiantes = await response.json();
    
    return estudiantes.map((e: any) => ({
      id: e.id_estudiante.toString(),
      nombre: `${e.nombres} ${e.apellidos}`,
      inasistencias: e.inasistencias || 0
    }));
  } catch (error: any) {
    console.error('Error en getEstudiantesPorCurso:', error.message);
    throw error;
  }
}

/**
 * Obtiene materias de un curso específico
 */
export async function getMateriasPorCurso(cursoId: string | number): Promise<any[]> {
  // Convertir a número si es string
  const id = typeof cursoId === 'string' ? parseInt(cursoId, 10) : cursoId;
  
  try {
    const response = await fetch(`http://127.0.0.1:8006/cursos/${id}/materias`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Error al obtener materias (status ${response.status})`);
    }

    const materias = await response.json();
    
    return materias.map((m: any) => ({
      id: m.id_materia.toString(),
      nombre: m.nombre_materia,
      docente: m.docente ? `${m.docente.nombres} ${m.docente.apellidos}` : 'Sin asignar'
    }));
  } catch (error: any) {
    console.error('Error en getMateriasPorCurso:', error.message);
    throw error;
  }
}