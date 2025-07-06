import { EstudianteAsignatura } from '../../models/PanelProfesor/estudianteAsignatura'; 
import { AsistenciaRegistro } from '../../models/PanelProfesor/asistencia'; 
import { CalificacionRegistro } from '../../models/PanelProfesor/calificacion'; 
import { Materia } from '../../models/PanelProfesor/materia'; 

// URLs de las APIs
const API_BASE_URL = 'http://localhost:8001';

// Interface para las respuestas de la API de nombres de asignaturas por profesor
export interface AsignaturaNombreResponse {
  nombre: string;
}

// Interface para obtener asignaciones completas con información de curso
export interface AsignacionCompleta {
  id_asignacion: number;
  id_curso: number;
  id_asignatura: number;
  id_profesor: number;
  nombre?: string; // API might return 'nombre'
  nombre_asignatura?: string; // API might return 'nombre_asignatura'
  nombre_curso?: string;
  grado_curso?: string;
}

/**
 * Define una interfaz para los datos de una materia específica, que incluye detalles
 * adicionales como el curso al que pertenece, los estudiantes matriculados, y otra
 * información relevante obtenida de las APIs del backend.
 */
export interface MateriaDetalle extends Materia {
  idCurso: string; 
  nombreCurso: string; 
  idProfesorAsignado: string; 
  nombreProfesorAsignado: string; 
  estudiantes: EstudianteAsignatura[];
  // Campos adicionales que podrían obtenerse de las APIs
  gradoCurso?: string; // Grado del curso (ej: "11°", "9°")
  fechaAsignacion?: string; // Fecha en que se asignó la materia al profesor
  estado?: 'activa' | 'inactiva' | 'finalizada'; // Estado de la asignación
  sede?: { id: string; nombre: string }; // Sede donde se dicta la materia
}

/**
 * Función para obtener el ID del profesor logueado desde localStorage
 */
function getProfesorLogueadoId(): number | null {
  const userData = localStorage.getItem('user');
  if (!userData) return null;
  
  try {
    const user = JSON.parse(userData);
    return user.id_profesor || null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
}

/**
 * Función para obtener el token de autenticación
 */
function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

/**
 * Función para obtener las asignaturas del profesor logueado con información completa de curso
 * Consulta la API de asignaciones para obtener las materias asignadas al profesor con sus cursos específicos
 */
export async function getAsignaturasDelProfesor(): Promise<Materia[]> {
  const profesorId = getProfesorLogueadoId();
  if (!profesorId) {
    throw new Error('No se encontró el ID del profesor logueado');
  }

  try {
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Obtener información del profesor actual para usar su nombre real
    const profesorActual = await getProfesorActual();

    // Usar el endpoint que sabemos que funciona para obtener los nombres de las asignaturas
    const nombresResponse = await fetch(`${API_BASE_URL}/asignacion_asignaturas/nombres_asignaturas/por_profesor/${profesorId}`, {
      method: 'GET',
      headers
    });

    if (!nombresResponse.ok) {
      throw new Error(`Error al obtener nombres de asignaturas: ${nombresResponse.status}`);
    }

    const nombresData: AsignaturaNombreResponse[] = await nombresResponse.json();
    console.log('🔍 Nombres de asignaturas obtenidos:', nombresData);

    // Obtener información de asignaciones para obtener IDs y cursos
    let asignacionesData: AsignacionCompleta[] = [];
    try {
      const asignacionesResponse = await fetch(`http://localhost:8001/asignacion_asignaturas/por_profesor/${profesorId}`, {
        method: 'GET',
        headers
      });

      if (asignacionesResponse.ok) {
        asignacionesData = await asignacionesResponse.json();
        console.log('🔍 Estructura de respuesta de asignaciones:', asignacionesData);
      }
    } catch (error) {
      console.warn('No se pudo obtener información de asignaciones:', error);
    }

    // Crear las asignaturas con nombres reales
    const asignaturasConCurso: Materia[] = [];
    
    for (let i = 0; i < nombresData.length; i++) {
      const nombreAsignatura = nombresData[i].nombre; // Usar el nombre del endpoint que funciona
      const asignacion = asignacionesData[i]; // Intentar hacer matching por índice
      
      let idAsignacion = (i + 1).toString(); // Fallback ID
      let nombreCompleto = nombreAsignatura; // Usar el nombre real de la asignatura
      
      if (asignacion && asignacion.id_curso) {
        idAsignacion = `${asignacion.id_asignacion}`;
        
        try {
          // Obtener información del curso si tenemos el ID
          const cursoResponse = await fetch(`http://localhost:8004/cursos/${asignacion.id_curso}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (cursoResponse.ok) {
            const cursoData = await cursoResponse.json();
            const nombreCurso = cursoData.nombre || `Curso ${asignacion.id_curso}`;
            const gradoCurso = cursoData.grado || '';
            nombreCompleto = gradoCurso 
              ? `${nombreAsignatura} - ${gradoCurso} (${nombreCurso})`
              : `${nombreAsignatura} (${nombreCurso})`;
          } else {
            nombreCompleto = `${nombreAsignatura} (Curso ${asignacion.id_curso})`;
          }
        } catch (error) {
          console.warn(`Error al obtener info del curso ${asignacion.id_curso}:`, error);
          nombreCompleto = `${nombreAsignatura} (Curso ${asignacion.id_curso})`;
        }
      }
      
      asignaturasConCurso.push({
        id: idAsignacion,
        nombre: nombreCompleto,
        docente: profesorActual.nombre
      });
    }

    console.log(`✅ Asignaturas obtenidas para profesor ${profesorActual.nombre}:`, asignaturasConCurso);
    return asignaturasConCurso;
    
  } catch (error) {
    console.error('Error al obtener asignaturas del profesor:', error);
    
    // Fallback usando solo el endpoint de nombres (sabemos que funciona)
    try {
      const fallbackToken = getAuthToken();
      const fallbackHeaders: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (fallbackToken) {
        fallbackHeaders['Authorization'] = `Bearer ${fallbackToken}`;
      }
      
      const asignaturasResponse = await fetch(`${API_BASE_URL}/asignacion_asignaturas/nombres_asignaturas/por_profesor/${profesorId}`, {
        method: 'GET',
        headers: fallbackHeaders
      });

      if (asignaturasResponse.ok) {
        const asignaturasData: AsignaturaNombreResponse[] = await asignaturasResponse.json();
        const profesorActual = await getProfesorActual();
        
        return asignaturasData.map((asignatura, index) => ({
          id: (index + 1).toString(),
          nombre: asignatura.nombre,
          docente: profesorActual.nombre
        }));
      }
    } catch (fallbackError) {
      console.error('Error en fallback:', fallbackError);
    }
    
    // Último fallback
    return [{
      id: 'error',
      nombre: 'Error de carga',
      docente: 'Sistema'
    }];
  }
}

/**
 * Simula si la edición está habilitada.
 * En una aplicación real, esto vendría del backend.
 */
const IS_EDITION_ENABLED = true; // Simula si la edición está habilitada

// --- Datos de prueba globales para estudiantes, asistencias y calificaciones ---
const fakeAsistenciasEstudiante1: AsistenciaRegistro[] = [
  { id: 'ar1', fecha: '2024-05-20', estado: 'Presente', idProfesor: 'profesor123' },
  { id: 'ar2', fecha: '2024-05-21', estado: 'Ausente', idProfesor: 'profesor123', observaciones: 'Enfermo' },
  { id: 'ar3', fecha: '2024-05-22', estado: 'Justificado', idProfesor: 'profesor123', observaciones: 'Cita médica' },
];

const fakeAsistenciasEstudiante2: AsistenciaRegistro[] = [
  { id: 'ar4', fecha: '2024-05-20', estado: 'Presente', idProfesor: 'profesor123' },
  { id: 'ar5', fecha: '2024-05-21', estado: 'Presente', idProfesor: 'profesor123' },
  { id: 'ar6', fecha: '2024-05-22', estado: 'Presente', idProfesor: 'profesor123' },
];

const fakeCalificacionesEstudiante1: CalificacionRegistro[] = [
  { periodo: 'parcial1', nota: 4.5 },
  { periodo: 'parcial2', nota: 3.8 },
  { periodo: 'parcial3', nota: null }, //nota pendiente
];

const fakeCalificacionesEstudiante2: CalificacionRegistro[] = [
  { periodo: 'parcial1', nota: 3.0 },
  { periodo: 'parcial2', nota: 2.5 },
  { periodo: 'parcial3', nota: 4.0 },
];

const fakeEstudiantesGeneral: EstudianteAsignatura[] = [
  {
    id: 'est1',
    nombre: 'Sofía Rodríguez',
    inasistencias: 3,
    asistencias: fakeAsistenciasEstudiante1,
    calificaciones: fakeCalificacionesEstudiante1,
    edicionBloqueada: !IS_EDITION_ENABLED,
  },
  {
    id: 'est2',
    nombre: 'Martín Gómez',
    inasistencias: 1,
    asistencias: fakeAsistenciasEstudiante2,
    calificaciones: fakeCalificacionesEstudiante2,
    edicionBloqueada: !IS_EDITION_ENABLED,
  },
  {
      id: 'est3',
      nombre: 'Valeria López',
      inasistencias: 0,
      asistencias: [],
      calificaciones: [
          { periodo: 'parcial1', nota: 5.0 },
          { periodo: 'parcial2', nota: null },
          { periodo: 'parcial3', nota: null },
      ],
      edicionBloqueada: !IS_EDITION_ENABLED,
  },
  {
    id: 'est4',
    nombre: 'Diego Sánchez',
    inasistencias: 0,
    asistencias: [{ fecha: '2024-05-20', estado: 'Presente', idProfesor: 'profesor123' }],
    calificaciones: [{ periodo: 'parcial1', nota: 3.5 }],
    edicionBloqueada: !IS_EDITION_ENABLED,
  }
];

// --- Mapeo de IDs de materias a sus datos de prueba ---
// Nota: Los valores de 'docente' se actualizarán dinámicamente con el nombre real del profesor
const fakeMateriaDetails: { [key: string]: MateriaDetalle } = {
  // IDs tipo string (compatibilidad anterior)
  'm1': { 
    id: 'm1',
    nombre: 'Matemáticas',
    docente: 'Prof. Sistema', // Se actualiza dinámicamente
    idCurso: 'c1',
    nombreCurso: 'Curso 101',
    idProfesorAsignado: 'profesor123',
    nombreProfesorAsignado: 'Prof. Sistema', // Se actualiza dinámicamente
    estudiantes: fakeEstudiantesGeneral.slice(0, 3),
  },
  'm2': { 
    id: 'm2',
    nombre: 'Historia',
    docente: 'Prof. Sistema', // Se actualiza dinámicamente
    idCurso: 'c1',
    nombreCurso: 'Curso 301',
    idProfesorAsignado: 'profesor123',
    nombreProfesorAsignado: 'Prof. Sistema', // Se actualiza dinámicamente
    estudiantes: fakeEstudiantesGeneral.slice(1, 4)
  },
  // IDs numéricos (compatibilidad con API)
  '1': {
    id: '1',
    nombre: 'Matemáticas Avanzadas',
    docente: 'Prof. Sistema', // Se actualiza dinámicamente
    idCurso: 'c1',
    nombreCurso: 'Curso 101',
    idProfesorAsignado: 'profesor123',
    nombreProfesorAsignado: 'Prof. Sistema', // Se actualiza dinámicamente
    estudiantes: fakeEstudiantesGeneral.slice(0, 2),
  },
  '2': {
    id: '2',
    nombre: 'Historia Universal',
    docente: 'Prof. Sistema', // Se actualiza dinámicamente
    idCurso: 'c2',
    nombreCurso: 'Curso 201',
    idProfesorAsignado: 'profesor123',
    nombreProfesorAsignado: 'Prof. Sistema', // Se actualiza dinámicamente
    estudiantes: fakeEstudiantesGeneral.slice(2, 4)
  },
  '3': {
    id: '3',
    nombre: 'Ciencias Naturales',
    docente: 'Prof. Sistema', // Se actualiza dinámicamente
    idCurso: 'c3',
    nombreCurso: 'Curso 301',
    idProfesorAsignado: 'profesor123',
    nombreProfesorAsignado: 'Prof. Sistema', // Se actualiza dinámicamente
    estudiantes: fakeEstudiantesGeneral.slice(0, 4)
  }
};


/**
 * Función auxiliar para extraer solo el nombre de la asignatura 
 * del formato "Matemáticas - Sexto (601)" a solo "Matemáticas"
 */
function extraerNombreAsignatura(nombreCompleto: string): string {
  // Si contiene " - ", tomar solo la parte antes del guión
  if (nombreCompleto.includes(' - ')) {
    return nombreCompleto.split(' - ')[0].trim();
  }
  
  // Si contiene " (", tomar solo la parte antes del paréntesis
  if (nombreCompleto.includes(' (')) {
    return nombreCompleto.split(' (')[0].trim();
  }
  
  // Si no contiene ningún separador, devolver el nombre tal como está
  return nombreCompleto.trim();
}

/**
 * Función para obtener información de curso donde se enseña una materia específica por un profesor
 */
async function getCursoByMateriaAndProfesor(materiaNombre: string, profesorId: number): Promise<{ id: string; nombre: string; grado: string } | null> {
  try {
    // Obtener todos los cursos del profesor
    const cursosResponse = await fetch(`http://localhost:8004/cursos/profesores/${profesorId}/cursos`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!cursosResponse.ok) {
      console.warn(`No se pudieron obtener los cursos del profesor ${profesorId}`);
      return null;
    }

    const cursosData = await cursosResponse.json();
    
    // Para cada curso, verificar si tiene la materia asignada
    for (const curso of cursosData) {
      try {
        const materiaResponse = await fetch(
          `http://localhost:8001/asignacion_asignaturas/asignatura/por_profesor_y_curso?id_profesor=${profesorId}&id_curso=${curso.id_curso}`
        );
        
        if (materiaResponse.ok) {
          const materiaData = await materiaResponse.json();
          
          // Verificar si esta respuesta coincide con la materia buscada
          if (Array.isArray(materiaData)) {
            const materiaEncontrada = materiaData.find((m: any) => m.nombre === materiaNombre);
            if (materiaEncontrada) {
              return {
                id: curso.id_curso.toString(),
                nombre: curso.nombre,
                grado: curso.grado
              };
            }
          } else if (materiaData.nombre === materiaNombre) {
            return {
              id: curso.id_curso.toString(),
              nombre: curso.nombre,
              grado: curso.grado
            };
          }
        }
      } catch (error) {
        console.warn(`Error al verificar materia en curso ${curso.id_curso}:`, error);
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error al obtener información de curso:', error);
    return null;
  }
}

/**
 * Función para obtener los detalles de una materia específica usando el ID de asignación
 * Integra con APIs reales para obtener información de curso y profesor específicos
 *
 * @param materiaId El ID de la asignación (no de la materia, sino de la asignación específica)
 * @returns Una Promesa que resuelve a los detalles de la materia.
 * @throws Error si la materia no se encuentra o hay un problema de comunicación con el backend.
 */
export async function getMateriaDetalle(materiaId: string): Promise<MateriaDetalle> {
  console.log(`[AsignaturaService] Solicitando detalles para la asignación ID: ${materiaId}`);

  // Obtener información del profesor actual
  const profesorActual = await getProfesorActual();

  // ESTRATEGIA 1: Intentar con el método de asignaturas que sabemos que funciona
  try {
    const asignaturas = await getAsignaturasDelProfesor();
    const asignaturaEncontrada = asignaturas.find(a => a.id === materiaId);
    
    if (asignaturaEncontrada) {
      console.log(`✅ Asignatura encontrada en lista: ${asignaturaEncontrada.nombre}`);
      
      // Extraer solo el nombre de la asignatura sin información de curso
      const nombreLimpio = extraerNombreAsignatura(asignaturaEncontrada.nombre);
      
      // Intentar obtener información adicional del curso si es posible
      try {
        const profesorId = getProfesorLogueadoId();
        if (profesorId) {
          const asignacionResponse = await fetch(`http://localhost:8001/asignacion_asignaturas/${materiaId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });

          if (asignacionResponse.ok) {
            const asignacionData: AsignacionCompleta = await asignacionResponse.json();
            
            const cursoResponse = await fetch(`http://localhost:8004/cursos/${asignacionData.id_curso}`, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json' }
            });

            if (cursoResponse.ok) {
              const cursoData = await cursoResponse.json();
              const nombreCurso = `${cursoData.nombre} (${cursoData.grado})`;
              
              const materiaDetalle: MateriaDetalle = {
                id: materiaId,
                nombre: nombreLimpio, // Usar solo el nombre de la asignatura
                docente: profesorActual.nombre,
                idCurso: cursoData.id_curso.toString(),
                nombreCurso: nombreCurso,
                idProfesorAsignado: profesorActual.id,
                nombreProfesorAsignado: profesorActual.nombre,
                estudiantes: fakeEstudiantesGeneral.slice(0, 3),
                gradoCurso: cursoData.grado,
                estado: 'activa'
              };
              
              console.log(`✅ Detalles completos obtenidos para ${nombreLimpio}`);
              return materiaDetalle;
            }
          }
        }
      } catch (error) {
        console.warn('No se pudo obtener información adicional del curso, usando datos básicos');
      }
      
      // Usar información básica de la asignatura encontrada
      const materiaDetalle: MateriaDetalle = {
        id: materiaId,
        nombre: nombreLimpio, // Usar solo el nombre de la asignatura
        docente: profesorActual.nombre,
        idCurso: 'desconocido',
        nombreCurso: 'Curso información no disponible',
        idProfesorAsignado: profesorActual.id,
        nombreProfesorAsignado: profesorActual.nombre,
        estudiantes: fakeEstudiantesGeneral.slice(0, 3)
      };
      
      console.log(`📋 Usando datos básicos de asignatura ${nombreLimpio}`);
      return materiaDetalle;
    }
  } catch (error) {
    console.warn('No se pudo obtener lista de asignaturas, intentando método directo');
  }

  // ESTRATEGIA 2: Método original (directo por API)
  try {
    const profesorId = getProfesorLogueadoId();
    if (!profesorId) {
      throw new Error('No se encontró el ID del profesor logueado');
    }
    
    // Obtener información específica de la asignación
    const asignacionResponse = await fetch(`http://localhost:8001/asignacion_asignaturas/${materiaId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!asignacionResponse.ok) {
      throw new Error(`Error al obtener información de la asignación: ${asignacionResponse.status}`);
    }

    const asignacionData: AsignacionCompleta = await asignacionResponse.json();
    
    // Obtener información del curso
    const cursoResponse = await fetch(`http://localhost:8004/cursos/${asignacionData.id_curso}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    let cursoInfo = {
      id: asignacionData.id_curso.toString(),
      nombre: `Curso ${asignacionData.id_curso}`,
      grado: ''
    };

    if (cursoResponse.ok) {
      const cursoData = await cursoResponse.json();
      cursoInfo = {
        id: cursoData.id_curso.toString(),
        nombre: cursoData.nombre,
        grado: cursoData.grado
      };
    }
    
    // Crear el detalle de la materia usando información real
    const nombreAsignatura = asignacionData.nombre || asignacionData.nombre_asignatura || 'Asignatura sin nombre';
    const materiaDetalle: MateriaDetalle = {
      id: materiaId,
      nombre: nombreAsignatura,
      docente: profesorActual.nombre,
      idCurso: cursoInfo.id,
      nombreCurso: `${cursoInfo.nombre} (${cursoInfo.grado})`,
      idProfesorAsignado: profesorActual.id,
      nombreProfesorAsignado: profesorActual.nombre,
      estudiantes: fakeEstudiantesGeneral.slice(0, 3), // TODO: Integrar con API de estudiantes
      gradoCurso: cursoInfo.grado,
      estado: 'activa'
    };

    console.log(`✅ Detalles obtenidos para asignación ${nombreAsignatura} en ${cursoInfo.nombre}`);
    return materiaDetalle;
    
  } catch (error) {
    console.warn(`⚠️ Error al obtener detalles de asignación ${materiaId}:`, error);
  }

  // ESTRATEGIA 3: Último fallback con datos de prueba
  let materia = fakeMateriaDetails[materiaId];
  
  if (!materia && !isNaN(Number(materiaId))) {
    const fallbackIds = Object.keys(fakeMateriaDetails);
    const fallbackIndex = parseInt(materiaId) % fallbackIds.length;
    const fallbackId = fallbackIds[fallbackIndex];
    materia = fakeMateriaDetails[fallbackId];
    
    if (materia) {
      materia = { 
        ...materia, 
        id: materiaId,
        docente: profesorActual.nombre,
        nombreProfesorAsignado: profesorActual.nombre,
        idProfesorAsignado: profesorActual.id
      };
      console.log(`📋 Usando datos de prueba con ID mapeado: ${materiaId} -> ${fallbackId}`);
    }
  } else if (materia) {
    materia = {
      ...materia,
      docente: profesorActual.nombre,
      nombreProfesorAsignado: profesorActual.nombre,
      idProfesorAsignado: profesorActual.id
    };
  }
  
  if (materia) {
    console.log(`📋 Usando datos de prueba para materia ${materia.nombre} con profesor ${profesorActual.nombre}`);
    return materia;
  } else {
    throw new Error(`Materia no encontrada con el ID proporcionado: ${materiaId}`);
  }
}

/**
 * Función para actualizar el registro de asistencia de un estudiante para una fecha y materia dadas.
 * En un entorno real, esto enviaría los datos al backend.
 * Por ahora, solo simula el éxito.
 *
 * @param idMateria ID de la materia.
 * @param idEstudiante ID del estudiante.
 * @param fecha Fecha de la asistencia (YYYY-MM-DD).
 * @param nuevoEstado Nuevo estado de asistencia.
 * @returns Promesa que resuelve a 'true' si la actualización fue exitosa.
 */
export async function updateAsistencia(
  idMateria: string,
  idEstudiante: string,
  fecha: string,
  nuevoEstado: 'Presente' | 'Ausente' | 'Justificado'
): Promise<boolean> {
  console.log(`[AsignaturaService] Actualizando asistencia para Estudiante ${idEstudiante} en Materia ${idMateria} el ${fecha} a ${nuevoEstado}`);
  await new Promise(resolve => setTimeout(resolve, 300)); // Simula latencia
  // se haria un fetch POST/PUT al backend
  return true; // Simula éxito
}

/**
 * Función para actualizar una calificación parcial de un estudiante en una materia.
 *
 * @param idMateria ID de la materia.
 * @param idEstudiante ID del estudiante.
 * @param periodo El período de la calificación ('parcial1', 'parcial2', 'parcial3').
 * @param nota La nueva nota.
 * @returns Promesa que resuelve a 'true' si la actualización fue exitosa.
 */
export async function updateCalificacion(
  idMateria: string,
  idEstudiante: string,
  periodo: CalificacionRegistro['periodo'],
  nota: number | null
): Promise<boolean> {
  console.log(`[AsignaturaService] Actualizando calificación para Estudiante ${idEstudiante} en Materia ${idMateria}, Parcial ${periodo} a ${nota}`);
  await new Promise(resolve => setTimeout(resolve, 300)); // Simula latencia
  // se haría un fetch POST/PUT al backend
  return true; // Simula éxito
}

/**
 * Función para obtener la información del profesor actual.
 * En una aplicación real, esto se obtendría del contexto de autenticación.
 */
export async function getProfesorActual(): Promise<{ id: string; nombre: string }> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simula latencia
  
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      // Construir el nombre completo desde nombres y apellidos
      const nombres = user.nombres || '';
      const apellidos = user.apellidos || '';
      let nombreCompleto = '';
      
      if (nombres || apellidos) {
        nombreCompleto = `${nombres} ${apellidos}`.trim();
      } else if (user.name) {
        nombreCompleto = user.name;
      } else {
        nombreCompleto = 'Prof. Usuario Actual';
      }
      
      return { 
        id: user.id_profesor?.toString() || 'profesor123', 
        nombre: nombreCompleto
      };
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }
  
  return { id: 'profesor123', nombre: 'Prof. Carlos' };
}

/**
 * Función para obtener el estado de bloqueo de edición para una materia y fecha dadas.
 * En un entorno real, esto consultaría al backend si el período de edición está abierto.
 *
 * @param idMateria ID de la materia.
 * @param fecha Fecha para la que se verifica el bloqueo.
 * @returns Promesa que resuelve a 'true' si la edición está bloqueada, 'false' en caso contrario.
 */
export async function checkIfEditionIsLocked(idMateria: string, fecha: string): Promise<boolean> {
    console.log(`[AsignaturaService] Verificando bloqueo de edición para Materia ${idMateria} en la fecha ${fecha}`);
    await new Promise(resolve => setTimeout(resolve, 200)); // Simula latencia
    // Aquí el backend verificaría si el período de edición para esa fecha y materia está cerrado.
    // Por ahora, usamos la variable de simulación IS_EDITION_ENABLED
    return !IS_EDITION_ENABLED;
}

/**
 * Función de ejemplo que muestra cómo usar las nuevas funciones integradas con la API
 * Esta función obtiene todas las asignaturas del profesor y luego obtiene los detalles de cada una
 */
export async function ejemploUsoAPI(): Promise<void> {
  try {
    console.log('🔍 Obteniendo asignaturas del profesor logueado...');
    
    // 1. Obtener las asignaturas del profesor desde la API
    const asignaturas = await getAsignaturasDelProfesor();
    console.log('📚 Asignaturas encontradas:', asignaturas);
    
    // 2. Obtener detalles de cada asignatura
    for (const asignatura of asignaturas) {
      try {
        console.log(`🔍 Obteniendo detalles de la asignatura: ${asignatura.nombre}`);
        const detalle = await getMateriaDetalle(asignatura.id);
        console.log(`📋 Detalles de ${asignatura.nombre}:`, detalle);
        console.log(`👥 Estudiantes en ${asignatura.nombre}:`, detalle.estudiantes.length);
      } catch (error) {
        console.error(`❌ Error al obtener detalles de ${asignatura.nombre}:`, error);
      }
    }
  } catch (error) {
    console.error('❌ Error general en el ejemplo de uso de la API:', error);
  }
}

/**
 * Función de debugging para verificar el mapeo de datos
 * Ayuda a identificar problemas con los IDs y el mapeo entre API y datos de prueba
 */
export async function debugMateriaMapping(): Promise<void> {
  console.log('🔍 === DEBUG: Verificando mapeo de materias ===');
  
  try {
    // 1. Verificar datos del profesor
    const profesorId = getProfesorLogueadoId();
    console.log('👤 ID del profesor logueado:', profesorId);
    
    const profesorActual = await getProfesorActual();
    console.log('👤 Datos del profesor actual:', profesorActual);
    
    // 2. Verificar disponibilidad de datos de prueba
    console.log('📋 IDs disponibles en datos de prueba:', Object.keys(fakeMateriaDetails));
    
    // 3. Intentar obtener asignaturas del profesor
    console.log('🔍 Intentando obtener asignaturas del profesor...');
    const asignaturas = await getAsignaturasDelProfesor();
    console.log('📚 Asignaturas obtenidas:', asignaturas);
    
    // 4. Probar getMateriaDetalle con diferentes tipos de ID
    const testIds = ['1', '2', 'm1', 'm2'];
    for (const testId of testIds) {
      try {
        console.log(`🔍 Probando getMateriaDetalle con ID: ${testId}`);
        const detalle = await getMateriaDetalle(testId);
        console.log(`✅ Éxito para ID ${testId}:`, detalle.nombre);
      } catch (error) {
        console.log(`❌ Error para ID ${testId}:`, (error as Error).message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error en debug de mapeo:', error);
  }
  
  console.log('🔍 === FIN DEBUG ===');
}