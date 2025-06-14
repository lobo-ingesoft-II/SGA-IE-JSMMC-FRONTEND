import { EstudianteAsignatura } from '../../models/PanelProfesor/estudianteAsignatura'; 
import { AsistenciaRegistro } from '../../models/PanelProfesor/asistencia'; 
import { CalificacionRegistro } from '../../models/PanelProfesor/calificacion'; 
import { Materia } from '../../models/PanelProfesor/materia'; 
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
 * Simula el ID del profesor actualmente logueado para fines de prueba.
 * En una aplicación real, esto vendría del contexto de autenticación.
 */
const PROFESOR_LOGUEADO_ID = 'profesor123';
const PROFESOR_LOGUEADO_NOMBRE = 'Prof. Carlos'; // Nombre del profesor para el registro de asistencia

/**
 * Simula un período de edición habilitado.
 * En una aplicación real, esto vendría del backend.
 */
const IS_EDITION_ENABLED = true; // Simula si la edición está habilitada

// --- Datos de prueba globales para estudiantes, asistencias y calificaciones ---
const fakeAsistenciasEstudiante1: AsistenciaRegistro[] = [
  { id: 'ar1', fecha: '2024-05-20', estado: 'Presente', idProfesor: PROFESOR_LOGUEADO_ID },
  { id: 'ar2', fecha: '2024-05-21', estado: 'Ausente', idProfesor: PROFESOR_LOGUEADO_ID, observaciones: 'Enfermo' },
  { id: 'ar3', fecha: '2024-05-22', estado: 'Justificado', idProfesor: PROFESOR_LOGUEADO_ID, observaciones: 'Cita médica' },
];

const fakeAsistenciasEstudiante2: AsistenciaRegistro[] = [
  { id: 'ar4', fecha: '2024-05-20', estado: 'Presente', idProfesor: PROFESOR_LOGUEADO_ID },
  { id: 'ar5', fecha: '2024-05-21', estado: 'Presente', idProfesor: PROFESOR_LOGUEADO_ID },
  { id: 'ar6', fecha: '2024-05-22', estado: 'Presente', idProfesor: PROFESOR_LOGUEADO_ID },
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
    asistencias: [{ fecha: '2024-05-20', estado: 'Presente', idProfesor: PROFESOR_LOGUEADO_ID }],
    calificaciones: [{ periodo: 'parcial1', nota: 3.5 }],
    edicionBloqueada: !IS_EDITION_ENABLED,
  }
];

// --- Mapeo de IDs de materias a sus datos de prueba ---
const fakeMateriaDetails: { [key: string]: MateriaDetalle } = {
  'm1': { // Matemáticas
    id: 'm1',
    nombre: 'Matemáticas',
    docente: 'Prof. García',
    idCurso: 'c1',
    nombreCurso: 'Curso Prueba A',
    idProfesorAsignado: 'profesor123',
    nombreProfesorAsignado: 'Prof. Juan Pérez',
    estudiantes: fakeEstudiantesGeneral.slice(0, 3), // Usa un subconjunto de estudiantes para esta
  },
  'm2': { // Historia
    id: 'm2',
    nombre: 'Historia',
    docente: 'Prof. Díaz',
    idCurso: 'c1',
    nombreCurso: 'Curso Prueba A',
    idProfesorAsignado: 'profesor123',
    nombreProfesorAsignado: 'Prof. Juan Pérez',
    estudiantes: fakeEstudiantesGeneral.slice(1, 4)
  },
  'm3': { // Física
    id: 'm3',
    nombre: 'Física',
    docente: 'Prof. López',
    idCurso: 'c1',
    nombreCurso: 'Curso Prueba A',
    idProfesorAsignado: 'profesor123',
    nombreProfesorAsignado: 'Prof. Juan Pérez',
    estudiantes: fakeEstudiantesGeneral.slice(0, 2)
  },
  'm4': { // Química
    id: 'm4',
    nombre: 'Química',
    docente: 'Prof. Rodríguez',
    idCurso: 'c2',
    nombreCurso: 'Curso Prueba B',
    idProfesorAsignado: 'profesor123',
    nombreProfesorAsignado: 'Prof. Juan Pérez',
    estudiantes: fakeEstudiantesGeneral.slice(2, 4)
  }
};


/**
 * Función para obtener los detalles de una materia específica (incluyendo sus estudiantes, asistencias y calificaciones).
 * En un entorno real, esta función haría una llamada HTTP al backend.
 * Por ahora, devuelve datos de prueba.
 *
 * @param materiaId El ID de la materia a consultar.
 * @returns Una Promesa que resuelve a los detalles de la materia.
 * @throws Error si la materia no se encuentra o hay un problema de comunicación con el backend.
 */
export async function getMateriaDetalle(materiaId: string): Promise<MateriaDetalle> {
  console.log(`[AsignaturaService] Solicitando detalles para la materia ID: ${materiaId}`);

  // Simular una llamada de red
  await new Promise(resolve => setTimeout(resolve, 500)); // Esperar 0.5 segundos

  // Devuelve los datos de prueba correspondientes al materiaId
  const materia = fakeMateriaDetails[materiaId];

  if (materia) {
    return materia;
  } else {
    throw new Error('Materia no encontrada con el ID proporcionado.');
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
  return { id: PROFESOR_LOGUEADO_ID, nombre: PROFESOR_LOGUEADO_NOMBRE };
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