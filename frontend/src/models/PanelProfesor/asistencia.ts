/**
 * Define la estructura de un registro de asistencia para un estudiante en una fecha específica.
 *
 * Corresponde a la tabla 'asistencia' en la base de datos, pero adaptado para el frontend.
 */
export interface AsistenciaRegistro {
  id?: string; // Opcional, si el backend genera un ID para cada registro
  fecha: string; // Formato 'YYYY-MM-DD' para simplicidad con input de fecha.
  estado: 'Presente' | 'Ausente' | 'Justificado';
  idProfesor: string; 
  observaciones?: string;
}
