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
    
    // Asegurarse de que los datos tengan el formato correcto
    if (response.data && response.data.coleccion) {
      // Mapear los datos si es necesario para asegurar compatibilidad
      const solicitudesMapeadas = response.data.coleccion.map((solicitud: any) => ({
        id: solicitud.id || solicitud._id,
        numeroDocumento: solicitud.numeroDocumento,
        nombres: solicitud.nombres,
        apellidos: solicitud.apellidos,
        fechaNacimiento: solicitud.fechaNacimiento,
        edad: solicitud.edad || calcularEdad(solicitud.fechaNacimiento),
        acudiente1CC: solicitud.acudiente1CC,
        nombreAcudiente1: solicitud.nombreAcudiente1,
        telefonoAcudiente1: solicitud.telefonoAcudiente1,
        correoAcudiente1: solicitud.correoAcudiente1,
        sede: solicitud.sede,
        gradoSolicitado: solicitud.gradoSolicitado,
        fechaSolicitud: solicitud.fechaSolicitud || new Date().toISOString(),
        observaciones: solicitud.observaciones,
        estado: solicitud.estado || 'pendiente'
      }));
      
      return { coleccion: solicitudesMapeadas };
    }
    
    return response.data;
  } catch (error) {
    console.error('Error al obtener solicitudes de prematrícula:', error);
    throw new Error('No se pudieron cargar las solicitudes de prematrícula');
  }
};

// Función auxiliar para calcular la edad a partir de la fecha de nacimiento
const calcularEdad = (fechaNacimiento: string): number => {
  const hoy = new Date();
  const fechaNac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - fechaNac.getFullYear();
  const mes = hoy.getMonth() - fechaNac.getMonth();
  
  if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
    edad--;
  }
  
  return edad;
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
    console.log(`Enviando solicitud de aprobación: /adm_pre_registro/prematricula/aceptar/${solicitudId}/${cursoId}`);
    const response = await apiClient.post(`/adm_pre_registro/prematricula/aceptar/${solicitudId}/${cursoId}`);
    console.log('Respuesta del servidor:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error al aprobar solicitud:', error);
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
      throw new Error(`No se pudo aprobar la solicitud: ${error.response.data.detail || error.message}`);
    }
    throw new Error('No se pudo aprobar la solicitud');
  }
};

/**
 * Rechaza una solicitud de prematrícula
 */
export const rechazarSolicitud = async (solicitudId: string): Promise<any> => {
  try {
    console.log(`Enviando solicitud de rechazo: /adm_pre_registro/prematricula/rechazar/${solicitudId}`);
    const response = await apiClient.post(`/adm_pre_registro/prematricula/rechazar/${solicitudId}`);
    console.log('Respuesta del servidor:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error al rechazar solicitud:', error);
    if (error.response) {
      console.error('Detalles del error:', error.response.data);
      throw new Error(`No se pudo rechazar la solicitud: ${error.response.data.detail || error.message}`);
    }
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



/**
 * Función para obtener solicitudes
 */
export const getSolicitudesConFallback = async (): Promise<SolicitudPrematricula[]> => {
  try {
    const response = await getSolicitudesPrematricula();
    return response.coleccion;
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    throw new Error('No se pudieron cargar las solicitudes de prematrícula');
  }
};
