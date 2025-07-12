export interface Estudiante {
  id: string;
  nombre: string;
  inasistencias: number;
}

// Interfaz completa basada en la respuesta de la API
export interface EstudianteAPI {
  nombres: string;
  apellidos: string;
  tipo_documento: string;
  documento_identidad: string;
  telefono: string;
  email: string;
  fecha_nacimiento: string;
  id_acudiente: number;
  id_curso: number;
  id_sede: number;
  estado_matricula: string;
  id_estudiante: number;
  fecha_creacion: string;
  fecha_modificacion: string;
}
