// Interfaz principal para una solicitud de prematrícula
export interface SolicitudPrematricula {
  id: string;
  numeroDocumento: string; // Documento del estudiante
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  edad?: number;
  
  // Información del acudiente
  acudiente1CC: string;
  nombreAcudiente1: string;
  telefonoAcudiente1?: string;
  correoAcudiente1?: string;
  
  // Información de la sede y curso
  sede: string; // Nombre de la sede
  gradoSolicitado: string;
  
  // Campos adicionales que pueden estar en el documento
  fechaSolicitud: string;
  observaciones?: string;
  
  // Estado implícito - todas están "pendientes" hasta ser procesadas
  estado?: 'pendiente' | 'procesando';
}

// Interfaz para la respuesta de la API
export interface SolicitudesResponse {
  coleccion: SolicitudPrematricula[];
}

// Interfaz para filtros de búsqueda
export interface FiltrosSolicitudes {
  busqueda?: string; // Búsqueda general
  sede?: string;
  grado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

// Interfaz para acciones sobre solicitudes
export interface AccionSolicitud {
  tipo: 'aprobar' | 'rechazar';
  solicitudId: string;
  cursoId?: number; // Requerido para aprobar
  observaciones?: string;
}

// Interfaz para logs
export interface LogPrematricula {
  _id: string;
  opcion: 'aceptado' | 'rechazado';
  id_preRegistro: string;
  numeroDocumento_estudiante: string;
  dic_preRegistro: SolicitudPrematricula;
  fecha?: string;
}
