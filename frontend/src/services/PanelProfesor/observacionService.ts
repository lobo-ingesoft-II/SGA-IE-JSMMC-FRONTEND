import { Observacion } from '../../models/PanelProfesor/observacion';

// =============================================================================
// CONFIGURACIÓN DE API
// =============================================================================

const API_OBSERVACIONES_URL = 'http://localhost:8011';

// Constantes para testing
export const TEST_IDS = {
  observacionItem: (id: string) => `observacion-${id}`,
  observacionFecha: (id: string) => `observacion-fecha-${id}`,
  observacionTipo: (id: string) => `observacion-tipo-${id}`,
  observacionArticulo: (id: string) => `observacion-articulo-${id}`,
  observacionDescripcion: (id: string) => `observacion-descripcion-${id}`
};

// Datos de prueba para testing
export const TEST_DATA = {
  observaciones: [
    {
      id: 'obs1',
      idEstudiante: 'est1',
      idMateria: 'materia1',
      idProfesor: 'profesor1',
      fechaIncidente: '2025-07-10',
      tipoFalta: 'Leve' as const,
      articuloManualConvivencia: 'Art. 25, Num. 3',
      descripcion: 'Llegada tarde sin justificación en 2 ocasiones.',
      fechaRegistro: '2025-07-11'
    },
    {
      id: 'obs2',
      idEstudiante: 'est1',
      idMateria: 'materia1',
      idProfesor: 'profesor1',
      fechaIncidente: '2025-07-01',
      tipoFalta: 'Grave' as const,
      articuloManualConvivencia: 'Art. 30, Num. 5',
      descripcion: 'Interrumpió la clase con uso inadecuado del celular.',
      fechaRegistro: '2025-07-02'
    }
  ]
};

// =============================================================================
// INTERFACES PARA LA API
// =============================================================================

/** Respuesta de la API al crear una observación */
export interface ObservacionAPIResponse {
  id_estudiante: number;
  id_asignatura: number;
  id_profesor: number;
  fecha_incidente: string;
  tipo_falta: string;
  articulo_manual_convivencia: string;
  observacion: string;
  id_observacion: number;
  fecha_registro: string;
  estudiante_info: {
    id_usuario: number;
    id_acudiente: number;
    fecha_nacimiento: string;
    id_curso: number;
    estado_matricula: string;
    sede: string;
    id_estudiante: number;
  };
}

/** Datos para crear una nueva observación */
export interface CrearObservacionRequest {
  id_estudiante: number;
  id_asignatura: number;
  id_profesor: number;
  fecha_incidente: string;
  tipo_falta: string;
  articulo_manual_convivencia: string;
  observacion: string;
}

// =============================================================================
// FUNCIONES UTILITARIAS
// =============================================================================

/** Obtiene el token de autenticación */
function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

/** Obtiene el ID del profesor logueado desde localStorage */
function getProfesorLogueadoId(): number | null {
  const userData = localStorage.getItem('user');
  if (!userData) return null;
  
  try {
    const user = JSON.parse(userData);
    return user.id_profesor || null;
  } catch (error) {
    return null;
  }
}

/** Crea headers para peticiones HTTP */
function createApiHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/** Convierte datos del frontend al formato de la API */
function convertirObservacionParaAPI(
  observacionData: Omit<Observacion, 'id' | 'fechaRegistro'>,
  idAsignaturaReal: number
): CrearObservacionRequest {
  const profesorId = getProfesorLogueadoId();
  if (!profesorId) {
    throw new Error('No se encontró el ID del profesor logueado');
  }

  return {
    id_estudiante: parseInt(observacionData.idEstudiante),
    id_asignatura: idAsignaturaReal,
    id_profesor: profesorId,
    fecha_incidente: observacionData.fechaIncidente,
    tipo_falta: observacionData.tipoFalta,
    articulo_manual_convivencia: observacionData.articuloManualConvivencia,
    observacion: observacionData.descripcion
  };
}

/** Convierte respuesta de la API al formato del frontend */
function convertirObservacionDeAPI(apiResponse: ObservacionAPIResponse): Observacion {
  return {
    id: apiResponse.id_observacion.toString(),
    idEstudiante: apiResponse.id_estudiante.toString(),
    idMateria: apiResponse.id_asignatura.toString(),
    idProfesor: apiResponse.id_profesor.toString(),
    fechaIncidente: apiResponse.fecha_incidente,
    tipoFalta: apiResponse.tipo_falta as 'Leve' | 'Grave' | 'Gravísima',
    articuloManualConvivencia: apiResponse.articulo_manual_convivencia,
    descripcion: apiResponse.observacion,
    fechaRegistro: apiResponse.fecha_registro.split('T')[0] // Convertir ISO a YYYY-MM-DD
  };
}

// =============================================================================
// FUNCIONES PRINCIPALES
// =============================================================================

/**
 * Guarda una nueva observación usando la API real
 * @param observacionData Los datos de la observación a guardar
 * @param idMateriaAsignacion ID de la asignación (se convertirá al ID de asignatura real)
 * @param testMode Si es true, devuelve datos de prueba para testing
 * @returns Una promesa que resuelve con la observación guardada
 */
export async function saveObservacion(
  observacionData: Omit<Observacion, 'id' | 'fechaRegistro'>,
  idMateriaAsignacion?: string,
  testMode: boolean = false
): Promise<Observacion> {
  // Si estamos en modo test, devolver datos de prueba
  if (testMode) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simular latencia
    return {
      ...observacionData,
      id: `obs_test_${Date.now()}`,
      fechaRegistro: new Date().toISOString().split('T')[0]
    };
  }
  try {
    console.log('[ObservacionService] Intentando guardar observación:', observacionData);

    // Obtener el ID de asignatura real si se proporciona el ID de asignación
    let idAsignaturaReal: number;
    
    if (idMateriaAsignacion) {
      idAsignaturaReal = await obtenerIdAsignaturaReal(idMateriaAsignacion);
    } else {
      // Si no se proporciona, usar el idMateria como fallback
      idAsignaturaReal = parseInt(observacionData.idMateria);
      if (isNaN(idAsignaturaReal)) {
        throw new Error('ID de asignatura inválido');
      }
    }

    const requestData = convertirObservacionParaAPI(observacionData, idAsignaturaReal);
    
    console.log('[ObservacionService] Enviando datos a la API:', requestData);

    const response = await fetch(`${API_OBSERVACIONES_URL}/observaciones/`, {
      method: 'POST',
      headers: createApiHeaders(),
      body: JSON.stringify(requestData)
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const errorMessage = errorBody?.detail || `Error ${response.status}: ${response.statusText}`;
      throw new Error(`Error al guardar observación: ${errorMessage}`);
    }

    const apiResponse: ObservacionAPIResponse = await response.json();
    console.log('[ObservacionService] Respuesta de la API:', apiResponse);

    const observacionGuardada = convertirObservacionDeAPI(apiResponse);
    console.log('[ObservacionService] Observación guardada exitosamente:', observacionGuardada);
    
    return observacionGuardada;

  } catch (error) {
    console.error('[ObservacionService] Error al guardar observación:', error);
    
    // Fallback a simulación en caso de error
    console.log('[ObservacionService] Usando fallback - simulando guardado');
    await new Promise(resolve => setTimeout(resolve, 700));

    const newObservacion: Observacion = {
      ...observacionData,
      id: `obs_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      fechaRegistro: new Date().toISOString().split('T')[0],
    };

    console.log('[ObservacionService] Observación simulada guardada:', newObservacion);
    return newObservacion;
  }
}

/**
 * Función auxiliar para obtener el ID de asignatura real desde el ID de asignación
 */
async function obtenerIdAsignaturaReal(idMateriaAsignacion: string): Promise<number> {
  try {
    const asignacionResponse = await fetch(`http://localhost:8001/asignacion_asignaturas/${idMateriaAsignacion}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (asignacionResponse.ok) {
      const asignacionData = await asignacionResponse.json();
      return asignacionData.id_asignatura;
    } else {
      throw new Error(`No se pudo obtener información de la asignación: ${asignacionResponse.status}`);
    }
  } catch (error) {
    console.error('Error al obtener ID de asignatura real:', error);
    throw new Error('No se pudo obtener el ID de asignatura real');
  }
}

/**
 * Obtiene el historial de observaciones para un estudiante y asignatura específica
 * @param idEstudiante ID del estudiante
 * @param idMateria ID de la materia/asignación
 * @param testMode Si es true, devuelve datos de prueba para testing
 * @returns Una promesa que resuelve con un array de observaciones
 */
export async function getObservacionesPorEstudianteYMateria(
  idEstudiante: string, 
  idMateria: string,
  testMode: boolean = false
): Promise<Observacion[]> {
  // Si estamos en modo test, devolver datos de prueba
  if (testMode) {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simular latencia
    return TEST_DATA.observaciones.filter(obs => 
      obs.idEstudiante === idEstudiante && obs.idMateria === idMateria
    );
  }
  try {
    console.log(`[ObservacionService] Solicitando historial de observaciones para Estudiante ${idEstudiante} en Materia ${idMateria}`);
    
    // Obtener el ID de asignatura real
    let idAsignaturaReal: number;
    try {
      idAsignaturaReal = await obtenerIdAsignaturaReal(idMateria);
    } catch (error) {
      // Si falla obtener el ID real, usar el idMateria como fallback
      idAsignaturaReal = parseInt(idMateria);
      if (isNaN(idAsignaturaReal)) {
        console.warn('No se pudo obtener ID de asignatura válido, usando datos de prueba');
        return getFallbackObservaciones(idEstudiante, idMateria);
      }
    }

    // Intentar obtener observaciones de la API
    const response = await fetch(
      `${API_OBSERVACIONES_URL}/observaciones/estudiante/${idEstudiante}/asignatura/${idAsignaturaReal}`,
      {
        method: 'GET',
        headers: createApiHeaders()
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.log('No se encontraron observaciones para este estudiante y asignatura');
        return [];
      }
      throw new Error(`Error al obtener observaciones: ${response.status}`);
    }

    const observacionesAPI: ObservacionAPIResponse[] = await response.json();
    const observaciones = observacionesAPI.map(convertirObservacionDeAPI);
    
    console.log(`[ObservacionService] ${observaciones.length} observaciones obtenidas de la API`);
    return observaciones;

  } catch (error) {
    console.error('[ObservacionService] Error al obtener observaciones:', error);
    console.log('[ObservacionService] Usando datos de prueba como fallback');
    return getFallbackObservaciones(idEstudiante, idMateria);
  }
}

/**
 * Función auxiliar para obtener observaciones de prueba como fallback
 */
function getFallbackObservaciones(idEstudiante: string, idMateria: string): Observacion[] {
  const fakeHistorial: Observacion[] = [
    {
      id: 'obs_hist_1',
      idEstudiante: idEstudiante,
      idMateria: idMateria,
      idProfesor: 'profesor123',
      fechaIncidente: '2024-05-10',
      tipoFalta: 'Leve',
      articuloManualConvivencia: 'Art. 25, Num. 3',
      descripcion: 'Llegada tarde sin justificación en 2 ocasiones.',
      fechaRegistro: '2024-05-11',
    },
    {
      id: 'obs_hist_2',
      idEstudiante: idEstudiante,
      idMateria: idMateria,
      idProfesor: 'profesor123',
      fechaIncidente: '2024-06-01',
      tipoFalta: 'Grave',
      articuloManualConvivencia: 'Art. 30, Num. 5',
      descripcion: 'Interrumpió la clase con uso inadecuado del celular.',
      fechaRegistro: '2024-06-02',
    },
  ];

  return fakeHistorial;
}

/**
 * Obtiene todas las observaciones de un estudiante (sin filtro por asignatura)
 * @param idEstudiante ID del estudiante
 * @returns Una promesa que resuelve con un array de todas las observaciones del estudiante
 */
export async function getObservacionesPorEstudiante(idEstudiante: string): Promise<Observacion[]> {
  try {
    console.log(`[ObservacionService] Obteniendo todas las observaciones del estudiante ${idEstudiante}`);
    
    const response = await fetch(
      `${API_OBSERVACIONES_URL}/observaciones/estudiante/${idEstudiante}`,
      {
        method: 'GET',
        headers: createApiHeaders()
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.log('No se encontraron observaciones para este estudiante');
        return [];
      }
      throw new Error(`Error al obtener observaciones: ${response.status}`);
    }

    const observacionesAPI: ObservacionAPIResponse[] = await response.json();
    const observaciones = observacionesAPI.map(convertirObservacionDeAPI);
    
    console.log(`[ObservacionService] ${observaciones.length} observaciones totales obtenidas`);
    return observaciones;

  } catch (error) {
    console.error('[ObservacionService] Error al obtener observaciones del estudiante:', error);
    return [];
  }
}

/**
 * Obtiene el resumen de observaciones por tipo de falta
 * @param idEstudiante ID del estudiante
 * @returns Resumen de observaciones agrupadas por tipo
 */
export async function getResumenObservacionesEstudiante(idEstudiante: string): Promise<{
  total: number;
  leves: number;
  graves: number;
  gravisimas: number;
  ultimaObservacion?: Observacion;
}> {
  try {
    const observaciones = await getObservacionesPorEstudiante(idEstudiante);
    
    const resumen = {
      total: observaciones.length,
      leves: observaciones.filter(obs => obs.tipoFalta === 'Leve').length,
      graves: observaciones.filter(obs => obs.tipoFalta === 'Grave').length,
      gravisimas: observaciones.filter(obs => obs.tipoFalta === 'Gravísima').length,
      ultimaObservacion: observaciones.length > 0 ? observaciones[0] : undefined
    };

    return resumen;
  } catch (error) {
    console.error('[ObservacionService] Error al obtener resumen de observaciones:', error);
    return {
      total: 0,
      leves: 0,
      graves: 0,
      gravisimas: 0
    };
  }
}
