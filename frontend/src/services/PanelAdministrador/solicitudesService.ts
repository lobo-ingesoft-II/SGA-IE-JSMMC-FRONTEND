import axios from 'axios';
import { SolicitudesResponse,
    SolicitudPrematricula,
    LogPrematricula
 } from '../../models/autenticacion/solicitudes';

// Configuración base de la API
const API_BASE_URL = 'http://localhost:8013'; // URL del microservicio administrativo de pre-registro

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Obtiene todas las solicitudes de prematrícula pendientes
 */
export const getSolicitudesPrematricula = async (): Promise<SolicitudesResponse> => {
  try {
    const response = await apiClient.get('/adm_pre_registro/pre_registros');
    return response.data;
  } catch (error) {
    console.error('Error al obtener solicitudes de prematrícula:', error);
    throw new Error('No se pudieron cargar las solicitudes de prematrícula');
  }
};

/**
 * Busca una solicitud por número de documento del estudiante
 */
export const buscarSolicitudPorDocumento = async (numeroDocumento: string): Promise<SolicitudPrematricula> => {
  try {
    const response = await apiClient.get(`/adm_pre_registro/prematricula/buscar/${numeroDocumento}`);
    return response.data;
  } catch (error) {
    console.error('Error al buscar solicitud:', error);
    throw new Error('No se encontró la solicitud con ese documento');
  }
};

/**
 * Aprueba una solicitud de prematrícula
 */
export const aprobarSolicitud = async (solicitudId: string, cursoId: number): Promise<any> => {
  try {
    const response = await apiClient.post(`/adm_pre_registro/prematricula/aceptar/${solicitudId}/${cursoId}`);
    return response.data;
  } catch (error) {
    console.error('Error al aprobar solicitud:', error);
    throw new Error('No se pudo aprobar la solicitud');
  }
};

/**
 * Rechaza una solicitud de prematrícula
 */
export const rechazarSolicitud = async (solicitudId: string): Promise<any> => {
  try {
    const response = await apiClient.post(`/adm_pre_registro/prematricula/rechazar/${solicitudId}`);
    return response.data;
  } catch (error) {
    console.error('Error al rechazar solicitud:', error);
    throw new Error('No se pudo rechazar la solicitud');
  }
};

/**
 * Obtiene los logs de acciones sobre prematrículas
 */
export const getLogsPrematricula = async (): Promise<LogPrematricula[]> => {
  try {
    const response = await apiClient.get('/adm_pre_registro/log_pre_registros');
    return response.data.coleccion;
  } catch (error) {
    console.error('Error al obtener logs:', error);
    throw new Error('No se pudieron cargar los logs');
  }
};

// Datos mock para desarrollo (cuando no hay acceso al backend)
export const MOCK_SOLICITUDES: SolicitudPrematricula[] = [
  {
    id: "64f1234567890abcdef12345",
    numeroDocumento: "1234567890",
    nombres: "Juan Carlos",
    apellidos: "Pérez Gómez", 
    fechaNacimiento: "2010-03-15",
    edad: 13,
    acudiente1CC: "98765432101",
    nombreAcudiente1: "María Gómez",
    telefonoAcudiente1: "3001234567",
    correoAcudiente1: "maria.gomez@email.com",
    sede: "Sede Principal",
    gradoSolicitado: "Séptimo",
    fechaSolicitud: "2024-01-15T10:30:00Z",
    observaciones: "Estudiante con buen rendimiento académico",
    estado: "pendiente"
  },
  {
    id: "64f1234567890abcdef12346", 
    numeroDocumento: "0987654321",
    nombres: "Ana Sofia",
    apellidos: "Rodríguez López",
    fechaNacimiento: "2009-07-22",
    edad: 14,
    acudiente1CC: "12345678901",
    nombreAcudiente1: "Carlos Rodríguez",
    telefonoAcudiente1: "3109876543",
    correoAcudiente1: "carlos.rodriguez@email.com",
    sede: "Sede Norte",
    gradoSolicitado: "Octavo",
    fechaSolicitud: "2024-01-14T14:20:00Z",
    estado: "pendiente"
  },
  {
    id: "64f1234567890abcdef12347",
    numeroDocumento: "1122334455",
    nombres: "Luis Fernando",
    apellidos: "Martínez Silva",
    fechaNacimiento: "2011-11-08",
    edad: 12,
    acudiente1CC: "55443322101",
    nombreAcudiente1: "Patricia Silva",
    telefonoAcudiente1: "3201122334",
    correoAcudiente1: "patricia.silva@email.com",
    sede: "Sede Sur",
    gradoSolicitado: "Sexto",
    fechaSolicitud: "2024-01-16T09:15:00Z",
    observaciones: "Requiere atención especial por dificultades de aprendizaje",
    estado: "pendiente"
  }
];

/**
 * Función para obtener solicitudes (con fallback a mock)
 */
export const getSolicitudesConFallback = async (): Promise<SolicitudPrematricula[]> => {
  try {
    const response = await getSolicitudesPrematricula();
    return response.coleccion;
  } catch (error) {
    console.warn('Usando datos mock debido a error en la API:', error);
    return MOCK_SOLICITUDES;
  }
};
