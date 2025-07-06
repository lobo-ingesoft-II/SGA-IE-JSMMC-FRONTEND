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

/**
 * Define una interfaz para los datos de una materia específica, que podría incluir detalles
 * adicionales como el curso al que pertenece y los estudiantes matriculados en ella.
 * Esto es para simular la respuesta del backend para una materia.
 */
export interface MateriaDetalle extends Materia {
  idCurso: string; 
  nombreCurso: string; 
  idProfesorAsignado: string; 
  nombreProfesorAsignado: string; 
  estudiantes: EstudianteAsignatura[]; 
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
 * Función para obtener las asignaturas del profesor logueado
 * Consulta la API de asignaciones para obtener las materias asignadas al profesor
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

    // Obtener asignaturas del profesor usando el nuevo endpoint
    const asignaturasResponse = await fetch(`${API_BASE_URL}/asignacion_asignaturas/nombres_asignaturas/por_profesor/${profesorId}`, {
      method: 'GET',
      headers
    });

    if (!asignaturasResponse.ok) {
      throw new Error(`Error al obtener asignaturas del profesor: ${asignaturasResponse.status}`);
    }

    const asignaturasData: AsignaturaNombreResponse[] = await asignaturasResponse.json();
    
    // Mapear la respuesta al formato esperado
    const asignaturas: Materia[] = asignaturasData.map((asignatura, index) => ({
      id: (index + 1).toString(), // Generar ID secuencial ya que la API solo devuelve nombres
      nombre: asignatura.nombre,
      docente: 'Profesor Actual' // Se podría obtener del contexto de usuario
    }));

    return asignaturas;
  } catch (error) {
    console.error('Error al obtener asignaturas del profesor:', error);
    // Retornar solo un elemento de error en caso de fallo
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
const fakeMateriaDetails: { [key: string]: MateriaDetalle } = {
  // IDs tipo string (compatibilidad anterior)
  'm1': { 
    id: 'm1',
    nombre: 'Matemáticas',
    docente: 'Prof. Paula Forero',
    idCurso: 'c1',
    nombreCurso: 'Curso 101',
    idProfesorAsignado: 'profesor123',
    nombreProfesorAsignado: 'Prof. Juan Pérez',
    estudiantes: fakeEstudiantesGeneral.slice(0, 3),
  },
  'm2': { 
    id: 'm2',
    nombre: 'Historia',
    docente: 'Prof. Paula Forero',
    idCurso: 'c1',
    nombreCurso: 'Curso 301',
    idProfesorAsignado: 'profesor123',
    nombreProfesorAsignado: 'Prof. Juan Pérez',
    estudiantes: fakeEstudiantesGeneral.slice(1, 4)
  },
  // IDs numéricos (compatibilidad con API)
  '1': {
    id: '1',
    nombre: 'Matemáticas Avanzadas',
    docente: 'Prof. Paula Forero',
    idCurso: 'c1',
    nombreCurso: 'Curso 101',
    idProfesorAsignado: 'profesor123',
    nombreProfesorAsignado: 'Prof. Juan Pérez',
    estudiantes: fakeEstudiantesGeneral.slice(0, 2),
  },
  '2': {
    id: '2',
    nombre: 'Historia Universal',
    docente: 'Prof. Paula Forero',
    idCurso: 'c2',
    nombreCurso: 'Curso 201',
    idProfesorAsignado: 'profesor123',
    nombreProfesorAsignado: 'Prof. Juan Pérez',
    estudiantes: fakeEstudiantesGeneral.slice(2, 4)
  },
  '3': {
    id: '3',
    nombre: 'Ciencias Naturales',
    docente: 'Prof. María González',
    idCurso: 'c3',
    nombreCurso: 'Curso 301',
    idProfesorAsignado: 'profesor123',
    nombreProfesorAsignado: 'Prof. Juan Pérez',
    estudiantes: fakeEstudiantesGeneral.slice(0, 4)
  }
};


/**
 * Función para obtener los detalles de una materia específica (incluyendo sus estudiantes, asistencias y calificaciones).
 * Usa solo el endpoint de asignaturas por profesor y datos de fallback.
 *
 * @param materiaId El ID de la materia a consultar.
 * @returns Una Promesa que resuelve a los detalles de la materia.
 * @throws Error si la materia no se encuentra o hay un problema de comunicación con el backend.
 */
export async function getMateriaDetalle(materiaId: string): Promise<MateriaDetalle> {
  console.log(`[AsignaturaService] Solicitando detalles para la materia ID: ${materiaId}`);

  try {
    // Obtener las asignaturas del profesor para encontrar el nombre de la materia
    const asignaturas = await getAsignaturasDelProfesor();
    const asignaturaEncontrada = asignaturas.find(a => a.id === materiaId);
    
    if (!asignaturaEncontrada) {
      throw new Error(`No se encontró la asignatura con ID: ${materiaId}`);
    }

    // Obtener información del profesor actual
    const profesorActual = await getProfesorActual();
    
    // Crear el detalle de la materia usando solo la información disponible
    const materiaDetalle: MateriaDetalle = {
      id: materiaId,
      nombre: asignaturaEncontrada.nombre,
      docente: profesorActual.nombre,
      idCurso: 'c1', // Datos por defecto hasta implementar API de cursos
      nombreCurso: 'Curso por determinar', // Datos por defecto
      idProfesorAsignado: profesorActual.id,
      nombreProfesorAsignado: profesorActual.nombre,
      estudiantes: fakeEstudiantesGeneral.slice(0, 3) // Datos de prueba hasta implementar API de estudiantes
    };

    console.log(`✅ Detalles obtenidos para materia ${asignaturaEncontrada.nombre}`);
    return materiaDetalle;
  } catch (error) {
    console.warn(`⚠️ Error al obtener detalles de materia ${materiaId}, usando datos de prueba:`, error);
    
    // Fallback: intentar con datos de prueba usando el ID como está
    let materia = fakeMateriaDetails[materiaId];
    
    // Si no se encuentra y el ID parece ser numérico, intentar con los IDs de prueba conocidos
    if (!materia && !isNaN(Number(materiaId))) {
      const fallbackIds = Object.keys(fakeMateriaDetails);
      const fallbackIndex = parseInt(materiaId) % fallbackIds.length;
      const fallbackId = fallbackIds[fallbackIndex];
      materia = fakeMateriaDetails[fallbackId];
      
      if (materia) {
        // Actualizar el ID para que coincida con el solicitado
        materia = { ...materia, id: materiaId };
        console.log(`📋 Usando datos de prueba con ID mapeado: ${materiaId} -> ${fallbackId}`);
      }
    }
    
    if (materia) {
      console.log(`📋 Usando datos de prueba para materia ${materia.nombre}`);
      return materia;
    } else {
      throw new Error(`Materia no encontrada con el ID proporcionado: ${materiaId}`);
    }
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
      return { 
        id: user.id_profesor?.toString() || 'profesor123', 
        nombre: user.nombre || 'Prof. Usuario Actual'
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