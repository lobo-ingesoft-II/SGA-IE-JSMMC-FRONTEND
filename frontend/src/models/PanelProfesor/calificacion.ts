/**
 * Define la estructura de una calificación para un estudiante en una asignatura.
 *
 * Corresponde a la tabla 'calificaciones', pero adaptado para el frontend.
 */
export interface CalificacionRegistro {
  id?: string; // Opcional, si el backend genera un ID
  periodo: 'parcial1' | 'parcial2' | 'parcial3'; 
  nota: number | null; 
  observaciones?: string;
  fechaRegistro?: string; // Opcional, si se quiere mostrar la fecha de registro
}
