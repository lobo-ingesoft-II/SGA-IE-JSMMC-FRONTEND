import { Estudiante } from './estudiante'; 
import { AsistenciaRegistro } from './asistencia'; 
import { CalificacionRegistro } from './calificacion'; 
/**
 * Extiende el modelo base de Estudiante para incluir datos específicos
 * de una asignatura, como el historial de asistencia y las calificaciones.
 */
export interface EstudianteAsignatura extends Estudiante {
  // Historial de registros de asistencia para esta asignatura.
  asistencias: AsistenciaRegistro[];

  // Calificaciones parciales para esta asignatura.
  calificaciones: CalificacionRegistro[];

  // indicar si la edición de asistencia/notas está bloqueada para el período actual.
  edicionBloqueada: boolean;
}
