// =============================================================================
// ASIGNATURA SERVICE - OPTIMIZADO
// Servicio completo para gestión de asignaturas, estudiantes, calificaciones y asistencias
// =============================================================================

import { EstudianteAsignatura } from '../../models/PanelProfesor/estudianteAsignatura'; 
import { AsistenciaRegistro } from '../../models/PanelProfesor/asistencia'; 
import { CalificacionRegistro } from '../../models/PanelProfesor/calificacion'; 
import { Materia } from '../../models/PanelProfesor/materia';
import { Estudiante, EstudianteAPI } from '../../models/PanelProfesor/estudiante';

// Constantes para testing
export const TEST_IDS = {
  // Contenedores principales
  asignaturaContainer: 'asignatura-container',
  loadingIndicator: 'loading-indicator',
  errorMessage: 'error-message',
  emptyState: 'empty-state',
  asignaturaHeader: 'asignatura-header',
  asignaturaInfo: 'asignatura-info',
  
  // Tabla de estudiantes
  estudiantesTable: 'estudiantes-table',
  estudianteRow: (id: string) => `estudiante-row-${id}`,
  
  // Controles de asistencia
  asistenciaFechaInput: 'asistencia-fecha-input',
  asistenciaSelector: (estudianteId: string) => `asistencia-selector-${estudianteId}`,
  
  // Controles de calificaciones
  calificacionInput: (estudianteId: string, periodo: string) => `calificacion-${estudianteId}-${periodo}`,
  promedioCell: (estudianteId: string) => `promedio-${estudianteId}`,
  
  // Botones de acción
  guardarCambiosBtn: 'guardar-cambios-btn',
  observacionBtn: (estudianteId: string) => `observacion-btn-${estudianteId}`,
  
  // Modal de observaciones
  observacionModal: 'observacion-modal',
  observacionFechaInput: 'observacion-fecha-input',
  observacionTipoSelect: 'observacion-tipo-select',
  observacionArticuloInput: 'observacion-articulo-input',
  observacionDescripcionInput: 'observacion-descripcion-input',
  observacionGuardarBtn: 'observacion-guardar-btn',
  observacionCancelarBtn: 'observacion-cancelar-btn'
};

// Datos de prueba para testing
export const TEST_DATA = {
  materiaDetalle: {
    id: 'materia1',
    nombre: 'Matemáticas',
    docente: 'Test Profesor',
    idCurso: 'curso1',
    nombreCurso: 'Curso 101',
    idProfesorAsignado: 'profesor1',
    nombreProfesorAsignado: 'Test Profesor',
    gradoCurso: '10°',
    sede: { id: 'sede1', nombre: 'Sede Principal Test' },
    estudiantes: [
      {
        id: 'est1',
        nombre: 'Estudiante Test 1',
        inasistencias: 2,
        asistencias: [
          { id: 'as1', fecha: '2025-07-10', estado: 'Presente' as const, idProfesor: 'profesor1' }
        ],
        calificaciones: [
          { periodo: 'parcial1' as const, nota: 4.5 },
          { periodo: 'parcial2' as const, nota: 3.8 },
          { periodo: 'parcial3' as const, nota: null }
        ],
        edicionBloqueada: false
      },
      {
        id: 'est2',
        nombre: 'Estudiante Test 2',
        inasistencias: 0,
        asistencias: [],
        calificaciones: [
          { periodo: 'parcial1' as const, nota: 3.0 },
          { periodo: 'parcial2' as const, nota: 2.5 },
          { periodo: 'parcial3' as const, nota: 4.0 }
        ],
        edicionBloqueada: false
      },
      {
        id: 'est3',
        nombre: 'Estudiante Test 3',
        inasistencias: 5,
        asistencias: [
          { id: 'as2', fecha: '2025-07-10', estado: 'Ausente' as const, idProfesor: 'profesor1' }
        ],
        calificaciones: [
          { periodo: 'parcial1' as const, nota: 5.0 },
          { periodo: 'parcial2' as const, nota: null },
          { periodo: 'parcial3' as const, nota: null }
        ],
        edicionBloqueada: false
      }
    ]
  },
  estudiantesConAsistencias: [
    {
      id: 'est1',
      nombre: 'Estudiante Test 1',
      inasistencias: 2,
      asistencias: [],
      calificaciones: [],
      edicionBloqueada: false,
      estadoAsistencia: 'Presente' as const
    },
    {
      id: 'est2',
      nombre: 'Estudiante Test 2',
      inasistencias: 0,
      asistencias: [],
      calificaciones: [],
      edicionBloqueada: false,
      estadoAsistencia: 'No registrado' as const
    },
    {
      id: 'est3',
      nombre: 'Estudiante Test 3',
      inasistencias: 5,
      asistencias: [],
      calificaciones: [],
      edicionBloqueada: false,
      estadoAsistencia: 'Ausente' as const
    }
  ],
  profesor: {
    id: 'profesor1',
    nombre: 'Test Profesor'
  }
}; 

// =============================================================================
// CONFIGURACIÓN DE APIS
// =============================================================================

const API_BASE_URL = 'http://localhost:8001';
const API_URLS = {
  autenticacion: 'http://localhost:8000',
  asignaturas: 'http://localhost:8001',
  asistencia: 'http://localhost:8002',
  calificaciones: 'http://localhost:8003',
  cursos: 'http://localhost:8004',
  estudiantes: 'http://localhost:8005',
  observaciones: 'http://localhost:8011'
} as const;

// =============================================================================
// INTERFACES Y TIPOS
// =============================================================================

/** Respuesta de la API de nombres de asignaturas por profesor */
export interface AsignaturaNombreResponse {
  nombre: string;
}

/** Asignación completa con información de curso */
export interface AsignacionCompleta {
  id_asignacion: number;
  id_curso: number;
  id_asignatura: number;
  id_profesor: number;
  nombre?: string;
  nombre_asignatura?: string;
  nombre_curso?: string;
  grado_curso?: string;
}

/** Respuesta de la API de calificaciones por estudiante */
export interface EstudianteCalificacionesResponse {
  id: number;
  nombre: string;
  inasistencias: number;
  calificaciones: Array<{
    periodo: string;
    nota: number | null;
  }>;
  promedio: number | null;
  edicionBloqueada: boolean;
}

/** Detalle completo de una materia */
export interface MateriaDetalle extends Materia {
  idCurso: string; 
  nombreCurso: string; 
  idProfesorAsignado: string; 
  nombreProfesorAsignado: string; 
  estudiantes: EstudianteAsignatura[];
  gradoCurso?: string;
  fechaAsignacion?: string;
  estado?: 'activa' | 'inactiva' | 'finalizada';
  sede?: { id: string; nombre: string };
}

// =============================================================================
// CONFIGURACIÓN Y CONSTANTES
// =============================================================================

/** Control de edición global */
const IS_EDITION_ENABLED = true;

/** Mapeo de estados de asistencia */
const ESTADOS_ASISTENCIA = {
  PRESENTE: { api: 1, ui: 'Presente' as const },
  AUSENTE: { api: 2, ui: 'Ausente' as const },
  JUSTIFICADO: { api: 3, ui: 'Justificado' as const }
} as const;

/** Mapeo de períodos de calificación */
const PERIODOS_CALIFICACION = {
  parcial1: 'nota1',
  parcial2: 'nota2',
  parcial3: 'nota3'
} as const;

// =============================================================================
// FUNCIONES UTILITARIAS DE AUTENTICACIÓN
// =============================================================================

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

/** Obtiene el token de autenticación */
function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

/** Crea headers para peticiones HTTP con autenticación opcional */
function createApiHeaders(includeAuth: boolean = false): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
}

/**
 * Obtener estudiantes reales del curso usando el endpoint de estudiantes
 * y combinar con datos de calificaciones de la API
 */
async function getEstudiantesConCalificaciones(cursoId: string, materiaId?: string): Promise<EstudianteAsignatura[]> {
  try {
    // 1. Obtener estudiantes reales del curso usando el endpoint correcto
    const estudiantesResponse = await fetch(`${API_URLS.estudiantes}/estudiantes/por_curso/${cursoId}`);
    
    if (!estudiantesResponse.ok) {
      // Fallback: intentar con el endpoint por_asignatura como segunda opción
      try {
        const fallbackResponse = await fetch(`${API_URLS.estudiantes}/estudiantes/por_asignatura/${cursoId}`);
        if (fallbackResponse.ok) {
          const fallbackData = await fallbackResponse.json();
          const estudiantesAPI: EstudianteAPI[] = fallbackData;
          return await procesarEstudiantesAPI(estudiantesAPI, cursoId, materiaId);
        }
      } catch (fallbackError) {
        // Error silenciado intencionalmente
      }
      
      return fakeEstudiantesGeneral.slice(0, 3);
    }
    
    const estudiantesAPI: EstudianteAPI[] = await estudiantesResponse.json();
    
    if (!Array.isArray(estudiantesAPI) || estudiantesAPI.length === 0) {
      return fakeEstudiantesGeneral.slice(0, 3);
    }
    
    // 2. Procesar estudiantes usando la función auxiliar con materiaId específico
    return await procesarEstudiantesAPI(estudiantesAPI, cursoId, materiaId);
    
  } catch (error) {
    // Fallback a datos de prueba en caso de error
    return fakeEstudiantesGeneral.slice(0, 3);
  }
}

/**
 * Función auxiliar para procesar estudiantes de la API y convertirlos al formato requerido
 */
async function procesarEstudiantesAPI(estudiantesAPI: EstudianteAPI[], cursoId: string, materiaId?: string): Promise<EstudianteAsignatura[]> {
  const estudiantes: EstudianteAsignatura[] = [];
  
  // Obtener ID de asignatura real usando el materiaId específico si está disponible
  let idAsignaturaReal: number | null = null;
  try {
    if (materiaId) {
      // Usar el materiaId específico para obtener el ID de asignatura real
      idAsignaturaReal = await obtenerIdAsignaturaReal(materiaId);
    } else {
      // Fallback al método anterior si no tenemos materiaId
      const profesorId = getProfesorLogueadoId();
      if (profesorId) {
        const asignacionesResponse = await fetch(`${API_URLS.asignaturas}/asignacion_asignaturas/por_profesor/${profesorId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (asignacionesResponse.ok) {
          const asignaciones: AsignacionCompleta[] = await asignacionesResponse.json();
          const asignacionCurso = asignaciones.find(a => a.id_curso.toString() === cursoId);
          if (asignacionCurso) {
            idAsignaturaReal = asignacionCurso.id_asignatura;
          }
        }
      }
    }
  } catch (error) {
    // Error silenciado intencionalmente
  }
  
  for (const estudianteAPI of estudiantesAPI) {
    let calificaciones: CalificacionRegistro[] = [
      { periodo: 'parcial1' as const, nota: null },
      { periodo: 'parcial2' as const, nota: null },
      { periodo: 'parcial3' as const, nota: null }
    ];
    
    let inasistencias = 0;
    
    try {
      // Si tenemos el ID de asignatura real, usar la función específica
      if (idAsignaturaReal) {
        calificaciones = await getCalificacionesPorEstudianteYAsignatura(
          estudianteAPI.id_estudiante.toString(),
          idAsignaturaReal.toString()
        );
      } else {
        // Fallback: usar valores por defecto
        console.warn(`No se pudo obtener ID de asignatura real para materiaId: ${materiaId}, curso: ${cursoId}`);
      }
    } catch (error) {
      console.warn(`Error al obtener calificaciones para estudiante ${estudianteAPI.id_estudiante}:`, error);
    }
    
    // Crear el objeto EstudianteAsignatura con datos reales
    // Asegurarse de que asistencias esté correctamente tipado como AsistenciaRegistro[]
    const asistenciasVacias: AsistenciaRegistro[] = [];
    
    estudiantes.push({
      id: estudianteAPI.id_estudiante.toString(),
      nombre: `${estudianteAPI.nombres} ${estudianteAPI.apellidos}`,
      inasistencias: inasistencias,
      asistencias: asistenciasVacias, // Aseguramos que sea un array vacío del tipo correcto
      calificaciones: calificaciones,
      edicionBloqueada: !IS_EDITION_ENABLED
    });
  }
  
  return estudiantes;
}

// =============================================================================
// FUNCIONES PRINCIPALES - GESTIÓN DE ASIGNATURAS
// =============================================================================

/**
 * Obtiene las asignaturas del profesor logueado con información completa de curso
 * @returns Lista de materias asignadas al profesor con información de curso
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

    // Obtener información del profesor actual para usar su nombre real
    const profesorActual = await getProfesorActual();

    // Usar el endpoint que sabemos que funciona para obtener los nombres de las asignaturas
    const nombresResponse = await fetch(`${API_BASE_URL}/asignacion_asignaturas/nombres_asignaturas/por_profesor/${profesorId}`, {
      method: 'GET',
      headers
    });

    if (!nombresResponse.ok) {
      throw new Error(`Error al obtener nombres de asignaturas: ${nombresResponse.status}`);
    }

    const nombresData: AsignaturaNombreResponse[] = await nombresResponse.json();

    // Obtener información de asignaciones para obtener IDs y cursos
    let asignacionesData: AsignacionCompleta[] = [];
    try {
      const asignacionesResponse = await fetch(`${API_URLS.asignaturas}/asignacion_asignaturas/por_profesor/${profesorId}`, {
        method: 'GET',
        headers
      });

      if (asignacionesResponse.ok) {
        asignacionesData = await asignacionesResponse.json();
      }
    } catch (error) {
      // Error silenciado intencionalmente
    }

    // Crear las asignaturas con nombres reales
    const asignaturasConCurso: Materia[] = [];
    
    for (let i = 0; i < nombresData.length; i++) {
      const nombreAsignatura = nombresData[i].nombre; // Usar el nombre del endpoint que funciona
      const asignacion = asignacionesData[i]; // Intentar hacer matching por índice
      
      let idAsignacion = (i + 1).toString(); // Fallback ID
      let nombreCompleto = nombreAsignatura; // Usar el nombre real de la asignatura
      
      if (asignacion && asignacion.id_curso) {
        idAsignacion = `${asignacion.id_asignacion}`;
        
        try {
          // Obtener información del curso si tenemos el ID
          const cursoResponse = await fetch(`${API_URLS.cursos}/cursos/${asignacion.id_curso}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
          });
          
          if (cursoResponse.ok) {
            const cursoData = await cursoResponse.json();
            const nombreCurso = cursoData.nombre || `Curso ${asignacion.id_curso}`;
            const gradoCurso = cursoData.grado || '';
            nombreCompleto = gradoCurso 
              ? `${nombreAsignatura} - ${gradoCurso} (${nombreCurso})`
              : `${nombreAsignatura} (${nombreCurso})`;
          } else {
            nombreCompleto = `${nombreAsignatura} (Curso ${asignacion.id_curso})`;
          }
        } catch (error) {
          nombreCompleto = `${nombreAsignatura} (Curso ${asignacion.id_curso})`;
        }
      }
      
      asignaturasConCurso.push({
        id: idAsignacion,
        nombre: nombreCompleto,
        docente: profesorActual.nombre
      });
    }

    return asignaturasConCurso;
    
  } catch (error) {
    // Fallback usando solo el endpoint de nombres (sabemos que funciona)
    return await getFallbackAsignaturas(profesorId);
  }
}

/**
 * Función auxiliar para obtener asignaturas como fallback
 */
async function getFallbackAsignaturas(profesorId: number): Promise<Materia[]> {
  try {
    const fallbackToken = getAuthToken();
    const fallbackHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (fallbackToken) {
      fallbackHeaders['Authorization'] = `Bearer ${fallbackToken}`;
    }
    
    const asignaturasResponse = await fetch(`${API_URLS.autenticacion}/asignacion_asignaturas/nombres_asignaturas/por_profesor/${profesorId}`, {
      method: 'GET',
      headers: fallbackHeaders
    });

    if (asignaturasResponse.ok) {
      const asignaturasData: AsignaturaNombreResponse[] = await asignaturasResponse.json();
      const profesorActual = await getProfesorActual();
      
      return asignaturasData.map((asignatura, index) => ({
        id: (index + 1).toString(),
        nombre: asignatura.nombre,
        docente: profesorActual.nombre
      }));
    }
  } catch (fallbackError) {
    // Error silenciado intencionalmente
  }
  
  // Último fallback
  return [{
    id: 'error',
    nombre: 'Error de carga',
    docente: 'Sistema'
  }];
}



// =============================================================================
// DATOS DE PRUEBA Y FALLBACKS
// =============================================================================

/** Asistencias de prueba para estudiante 1 */
const fakeAsistenciasEstudiante1: AsistenciaRegistro[] = [
  { id: 'ar1', fecha: '2024-05-20', estado: 'Presente' as const, idProfesor: 'profesor123' },
  { id: 'ar2', fecha: '2024-05-21', estado: 'Ausente' as const, idProfesor: 'profesor123', observaciones: 'Enfermo' },
  { id: 'ar3', fecha: '2024-05-22', estado: 'Justificado' as const, idProfesor: 'profesor123', observaciones: 'Cita médica' },
];

/** Asistencias de prueba para estudiante 2 */
const fakeAsistenciasEstudiante2: AsistenciaRegistro[] = [
  { id: 'ar4', fecha: '2024-05-20', estado: 'Presente' as const, idProfesor: 'profesor123' },
  { id: 'ar5', fecha: '2024-05-21', estado: 'Presente' as const, idProfesor: 'profesor123' },
  { id: 'ar6', fecha: '2024-05-22', estado: 'Presente' as const, idProfesor: 'profesor123' },
];

/** Calificaciones de prueba para estudiante 1 */
const fakeCalificacionesEstudiante1: CalificacionRegistro[] = [
  { periodo: 'parcial1' as const, nota: 4.5 },
  { periodo: 'parcial2' as const, nota: 3.8 },
  { periodo: 'parcial3' as const, nota: null },
];

/** Calificaciones de prueba para estudiante 2 */
const fakeCalificacionesEstudiante2: CalificacionRegistro[] = [
  { periodo: 'parcial1' as const, nota: 3.0 },
  { periodo: 'parcial2' as const, nota: 2.5 },
  { periodo: 'parcial3' as const, nota: 4.0 },
];

/** Lista de estudiantes de prueba para fallbacks */
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
      { periodo: 'parcial1' as const, nota: 5.0 },
      { periodo: 'parcial2' as const, nota: null },
      { periodo: 'parcial3' as const, nota: null },
    ],
    edicionBloqueada: !IS_EDITION_ENABLED,
  },
  {
    id: 'est4',
    nombre: 'Diego Sánchez',
    inasistencias: 0,
    asistencias: [{ id: 'ar7', fecha: '2024-05-20', estado: 'Presente' as const, idProfesor: 'profesor123' }],
    calificaciones: [{ periodo: 'parcial1' as const, nota: 3.5 }],
    edicionBloqueada: !IS_EDITION_ENABLED,
  }
];

/** Mapeo de IDs de materias a sus datos de prueba */
const fakeMateriaDetails: { [key: string]: MateriaDetalle } = {
  'm1': { 
    id: 'm1',
    nombre: 'Matemáticas',
    docente: 'Prof. Sistema',
    idCurso: 'c1',
    nombreCurso: 'Curso 101',
    idProfesorAsignado: 'profesor123',
    nombreProfesorAsignado: 'Prof. Sistema',
    estudiantes: fakeEstudiantesGeneral.slice(0, 3),
  },
  'm2': { 
    id: 'm2',
    nombre: 'Historia',
    docente: 'Prof. Sistema',
    idCurso: 'c1',
    nombreCurso: 'Curso 301',
    idProfesorAsignado: 'profesor123',
    nombreProfesorAsignado: 'Prof. Sistema',
    estudiantes: fakeEstudiantesGeneral.slice(1, 4)
  },
  '1': {
    id: '1',
    nombre: 'Matemáticas Avanzadas',
    docente: 'Prof. Sistema',
    idCurso: 'c1',
    nombreCurso: 'Curso 101',
    idProfesorAsignado: 'profesor123',
    nombreProfesorAsignado: 'Prof. Sistema',
    estudiantes: fakeEstudiantesGeneral.slice(0, 2),
  },
  '2': {
    id: '2',
    nombre: 'Historia Universal',
    docente: 'Prof. Sistema',
    idCurso: 'c2',
    nombreCurso: 'Curso 201',
    idProfesorAsignado: 'profesor123',
    nombreProfesorAsignado: 'Prof. Sistema',
    estudiantes: fakeEstudiantesGeneral.slice(2, 4)
  },
  '3': {
    id: '3',
    nombre: 'Ciencias Naturales',
    docente: 'Prof. Sistema',
    idCurso: 'c3',
    nombreCurso: 'Curso 301',
    idProfesorAsignado: 'profesor123',
    nombreProfesorAsignado: 'Prof. Sistema',
    estudiantes: fakeEstudiantesGeneral.slice(0, 4)
  }
};

// =============================================================================
// FUNCIONES UTILITARIAS DE VALIDACIÓN Y CONVERSIÓN
// =============================================================================

/** Extrae solo el nombre de la asignatura del formato completo */
function extraerNombreAsignatura(nombreCompleto: string): string {
  if (nombreCompleto.includes(' - ')) {
    return nombreCompleto.split(' - ')[0].trim();
  }
  
  if (nombreCompleto.includes(' (')) {
    return nombreCompleto.split(' (')[0].trim();
  }
  
  return nombreCompleto.trim();
}

/** Convierte estado de asistencia del UI al formato API */
function convertirEstadoAsistencia(estado: 'Presente' | 'Ausente' | 'Justificado'): { presente: number; observaciones: string } {
  switch (estado) {
    case 'Presente':
      return { presente: ESTADOS_ASISTENCIA.PRESENTE.api, observaciones: "" };
    case 'Ausente':
      return { presente: ESTADOS_ASISTENCIA.AUSENTE.api, observaciones: "" };
    case 'Justificado':
      return { presente: ESTADOS_ASISTENCIA.JUSTIFICADO.api, observaciones: "Justificado" };
    default:
      throw new Error(`Estado de asistencia no válido: ${estado}`);
  }
}

/** Convierte estado de asistencia de API al formato UI */
function convertirEstadoAsistenciaAPI(presente: number): 'Presente' | 'Ausente' | 'Justificado' {
  switch (presente) {
    case ESTADOS_ASISTENCIA.PRESENTE.api:
      return ESTADOS_ASISTENCIA.PRESENTE.ui;
    case ESTADOS_ASISTENCIA.AUSENTE.api:
      return ESTADOS_ASISTENCIA.AUSENTE.ui;
    case ESTADOS_ASISTENCIA.JUSTIFICADO.api:
      return ESTADOS_ASISTENCIA.JUSTIFICADO.ui;
    default:
      return ESTADOS_ASISTENCIA.AUSENTE.ui;
  }
}

/** Valida formato de fecha YYYY-MM-DD */
function validarFecha(fecha: string): boolean {
  const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
  return fechaRegex.test(fecha);
}

/** Valida ID de estudiante y lo convierte a número */
function validarIdEstudiante(idEstudiante: string): number {
  const estudianteIdNumerico = parseInt(idEstudiante);
  if (isNaN(estudianteIdNumerico)) {
    throw new Error(`ID de estudiante inválido: ${idEstudiante}`);
  }
  return estudianteIdNumerico;
}

/** Valida que la nota esté en rango válido */
function validarRangoNota(nota: number): void {
  if (nota < 0 || nota > 5) {
    throw new Error(`Nota fuera de rango válido (0-5): ${nota}`);
  }
}

/** Mapea período de calificación a campo de API */
function mapearPeriodoACampo(periodo: CalificacionRegistro['periodo']): string {
  const campo = PERIODOS_CALIFICACION[periodo];
  if (!campo) {
    throw new Error(`Período no válido: ${periodo}`);
  }
  return campo;
}

/**
 * Función para obtener información de curso donde se enseña una materia específica por un profesor
 */
async function getCursoByMateriaAndProfesor(materiaNombre: string, profesorId: number): Promise<{ id: string; nombre: string; grado: string } | null> {
  try {
    // Obtener todos los cursos del profesor
    const cursosResponse = await fetch(`${API_URLS.cursos}/cursos/profesores/${profesorId}/cursos`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!cursosResponse.ok) {
      return null;
    }

    const cursosData = await cursosResponse.json();
    
    // Para cada curso, verificar si tiene la materia asignada
    for (const curso of cursosData) {
      try {
        const materiaResponse = await fetch(
          `${API_URLS.asignaturas}/asignacion_asignaturas/asignatura/por_profesor_y_curso?id_profesor=${profesorId}&id_curso=${curso.id_curso}`
        );
        
        if (materiaResponse.ok) {
          const materiaData = await materiaResponse.json();
          
          // Verificar si esta respuesta coincide con la materia buscada
          if (Array.isArray(materiaData)) {
            const materiaEncontrada = materiaData.find((m: any) => m.nombre === materiaNombre);
            if (materiaEncontrada) {
              return {
                id: curso.id_curso.toString(),
                nombre: curso.nombre,
                grado: curso.grado
              };
            }
          } else if (materiaData.nombre === materiaNombre) {
            return {
              id: curso.id_curso.toString(),
              nombre: curso.nombre,
              grado: curso.grado
            };
          }
        }
      } catch (error) {
        continue;
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Obtener los detalles de una materia específica usando APIs reales
 * Integra con la API de calificaciones para obtener estudiantes reales
 *
 * @param materiaId El ID de la asignación (no de la materia, sino de la asignación específica)
 * @param testMode Si es true, devuelve datos de prueba para testing
 * @returns Una Promesa que resuelve a los detalles de la materia.
 * @throws Error si la materia no se encuentra o hay un problema de comunicación con el backend.
 */
export async function getMateriaDetalle(materiaId: string, testMode: boolean = false): Promise<MateriaDetalle> {
  // Si estamos en modo test, devolver datos de prueba
  if (testMode) {
    return TEST_DATA.materiaDetalle;
  }
  const profesorActual = await getProfesorActual();

  // ESTRATEGIA 1: Intentar con el método de asignaturas que sabemos que funciona
  try {
    const asignaturas = await getAsignaturasDelProfesor();
    const asignaturaEncontrada = asignaturas.find(a => a.id === materiaId);
    
    if (asignaturaEncontrada) {
      const nombreLimpio = extraerNombreAsignatura(asignaturaEncontrada.nombre);
      
      // Intentar obtener información adicional del curso si es posible
      const materiaDetalle = await obtenerDetalleCompleto(materiaId, nombreLimpio, profesorActual);
      if (materiaDetalle) return materiaDetalle;
      
      // Usar información básica de la asignatura encontrada con datos de prueba
      return crearMateriaDetalleBasica(materiaId, nombreLimpio, profesorActual);
    }
  } catch (error) {
    // Error silenciado intencionalmente
  }

  // ESTRATEGIA 2: Método original (directo por API)
  try {
    return await obtenerMateriaDirecta(materiaId, profesorActual);
  } catch (error) {
    // Error silenciado intencionalmente
  }

  // ESTRATEGIA 3: Último fallback con datos de prueba
  return obtenerMateriaFallback(materiaId, profesorActual);
}

/**
 * Función auxiliar para obtener detalle completo de materia
 */
async function obtenerDetalleCompleto(
  materiaId: string, 
  nombreLimpio: string, 
  profesorActual: { id: string; nombre: string }
): Promise<MateriaDetalle | null> {
  try {
    const profesorId = getProfesorLogueadoId();
    if (!profesorId) return null;
    
    const asignacionResponse = await fetch(`${API_URLS.asignaturas}/asignacion_asignaturas/${materiaId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!asignacionResponse.ok) return null;
    
    const asignacionData: AsignacionCompleta = await asignacionResponse.json();
    
    const cursoResponse = await fetch(`${API_URLS.cursos}/cursos/${asignacionData.id_curso}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!cursoResponse.ok) return null;
    
    const cursoData = await cursoResponse.json();
    const nombreCurso = `${cursoData.nombre} (${cursoData.grado})`;
    
    // Pasar materiaId específico para obtener estudiantes con calificaciones correctas
    const estudiantes = await getEstudiantesDeLaMateria(materiaId);
    
    // Asegurar que las asistencias y calificaciones tengan el tipo correcto
    const estudiantesCorregidos = estudiantes.map(estudiante => ({
      ...estudiante,
      asistencias: estudiante.asistencias.map(asistencia => ({
        ...asistencia,
        estado: asistencia.estado as 'Presente' | 'Ausente' | 'Justificado'
      })),
      calificaciones: estudiante.calificaciones.map(calificacion => ({
        ...calificacion,
        periodo: calificacion.periodo as 'parcial1' | 'parcial2' | 'parcial3'
      }))
    }));
    
    return {
      id: materiaId,
      nombre: nombreLimpio,
      docente: profesorActual.nombre,
      idCurso: cursoData.id_curso.toString(),
      nombreCurso: nombreCurso,
      idProfesorAsignado: profesorActual.id,
      nombreProfesorAsignado: profesorActual.nombre,
      estudiantes: estudiantesCorregidos,
      gradoCurso: cursoData.grado,
      estado: 'activa'
    };
  } catch (error) {
    return null;
  }
}

/**
 * Función auxiliar para crear materia detalle básica
 */
function crearMateriaDetalleBasica(
  materiaId: string, 
  nombreLimpio: string, 
  profesorActual: { id: string; nombre: string }
): MateriaDetalle {
  return {
    id: materiaId,
    nombre: nombreLimpio,
    docente: profesorActual.nombre,
    idCurso: 'desconocido',
    nombreCurso: 'Curso información no disponible',
    idProfesorAsignado: profesorActual.id,
    nombreProfesorAsignado: profesorActual.nombre,
    estudiantes: fakeEstudiantesGeneral.slice(0, 3)
  };
}

/**
 * Función auxiliar para obtener materia directa por API
 */
async function obtenerMateriaDirecta(
  materiaId: string, 
  profesorActual: { id: string; nombre: string }
): Promise<MateriaDetalle> {
  const profesorId = getProfesorLogueadoId();
  if (!profesorId) {
    throw new Error('No se encontró el ID del profesor logueado');
  }
  
  const asignacionResponse = await fetch(`${API_URLS.asignaturas}/asignacion_asignaturas/${materiaId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!asignacionResponse.ok) {
    throw new Error(`Error al obtener información de la asignación: ${asignacionResponse.status}`);
  }

  const asignacionData: AsignacionCompleta = await asignacionResponse.json();
  
  const cursoResponse = await fetch(`${API_URLS.cursos}/cursos/${asignacionData.id_curso}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  let cursoInfo = {
    id: asignacionData.id_curso.toString(),
    nombre: `Curso ${asignacionData.id_curso}`,
    grado: ''
  };

  if (cursoResponse.ok) {
    const cursoData = await cursoResponse.json();
    cursoInfo = {
      id: cursoData.id_curso.toString(),
      nombre: cursoData.nombre,
      grado: cursoData.grado
    };
  }
  
  // Pasar materiaId específico para obtener estudiantes con calificaciones correctas
  const estudiantes = await getEstudiantesDeLaMateria(materiaId);
  
  // Asegurar que las asistencias y calificaciones tengan el tipo correcto
  const estudiantesCorregidos = estudiantes.map(estudiante => ({
    ...estudiante,
    asistencias: estudiante.asistencias.map(asistencia => ({
      ...asistencia,
      estado: asistencia.estado as 'Presente' | 'Ausente' | 'Justificado'
    })),
    calificaciones: estudiante.calificaciones.map(calificacion => ({
      ...calificacion,
      periodo: calificacion.periodo as 'parcial1' | 'parcial2' | 'parcial3'
    }))
  }));
  
  const nombreAsignatura = asignacionData.nombre || asignacionData.nombre_asignatura || 'Asignatura sin nombre';
  
  return {
    id: materiaId,
    nombre: nombreAsignatura,
    docente: profesorActual.nombre,
    idCurso: cursoInfo.id,
    nombreCurso: `${cursoInfo.nombre} (${cursoInfo.grado})`,
    idProfesorAsignado: profesorActual.id,
    nombreProfesorAsignado: profesorActual.nombre,
    estudiantes: estudiantesCorregidos,
    gradoCurso: cursoInfo.grado,
    estado: 'activa'
  };
}

/**
 * Función auxiliar para obtener materia como fallback
 */
function obtenerMateriaFallback(
  materiaId: string, 
  profesorActual: { id: string; nombre: string }
): MateriaDetalle {
  let materia = fakeMateriaDetails[materiaId];
  
  if (!materia && !isNaN(Number(materiaId))) {
    const fallbackIds = Object.keys(fakeMateriaDetails);
    const fallbackIndex = parseInt(materiaId) % fallbackIds.length;
    const fallbackId = fallbackIds[fallbackIndex];
    materia = fakeMateriaDetails[fallbackId];
    
    if (materia) {
      materia = { 
        ...materia, 
        id: materiaId,
        docente: profesorActual.nombre,
        nombreProfesorAsignado: profesorActual.nombre,
        idProfesorAsignado: profesorActual.id
      };
    }
  } else if (materia) {
    materia = {
      ...materia,
      docente: profesorActual.nombre,
      nombreProfesorAsignado: profesorActual.nombre,
      idProfesorAsignado: profesorActual.id
    };
  }
  
  if (materia) {
    return materia;
  } else {
    throw new Error(`Materia no encontrada con el ID proporcionado: ${materiaId}`);
  }
}

/**
 * � FUNCIÓN AUXILIAR: Verificar si ya existe una asistencia para un estudiante en una fecha y asignatura
 * 
 * @param idEstudiante ID del estudiante
 * @param fecha Fecha de la asistencia (YYYY-MM-DD)
 * @param idAsignatura ID de la asignatura
 * @returns true si ya existe un registro, false si no existe
 */

// =============================================================================
// FUNCIONES PRINCIPALES - GESTIÓN DE ASISTENCIAS
// =============================================================================

/**
 * Actualiza o crea un registro de asistencia
 * @param idMateria ID de la asignación
 * @param idEstudiante ID del estudiante
 * @param fecha Fecha de la asistencia (YYYY-MM-DD)
 * @param nuevoEstado Nuevo estado de asistencia
 * @returns Promesa que resuelve a 'true' si la actualización fue exitosa
 */
export async function updateAsistencia(
  idMateria: string,
  idEstudiante: string,
  fecha: string,
  nuevoEstado: 'Presente' | 'Ausente' | 'Justificado'
): Promise<boolean> {
  try {
    const profesorId = getProfesorLogueadoId();
    if (!profesorId) {
      throw new Error('No se encontró el ID del profesor logueado');
    }

    const { cursoId, asignaturaId } = await obtenerInformacionAsignacion(idMateria);
    
    if (!cursoId || !asignaturaId) {
      throw new Error(`Datos de asignación inválidos: curso=${cursoId}, asignatura=${asignaturaId}`);
    }

    const { presente, observaciones } = convertirEstadoAsistencia(nuevoEstado);
    
    if (!validarFecha(fecha)) {
      throw new Error(`Formato de fecha inválido: ${fecha}. Debe ser YYYY-MM-DD`);
    }

    const estudianteIdNumerico = validarIdEstudiante(idEstudiante);
    
    const idAsistenciaExistente = await verificarAsistenciaExistente(estudianteIdNumerico, fecha, asignaturaId);
    
    const requestConfig = prepararRequestAsistencia(
      idAsistenciaExistente, 
      estudianteIdNumerico, 
      profesorId, 
      cursoId, 
      asignaturaId, 
      fecha, 
      presente, 
      observaciones
    );
    
    const response = await fetch(requestConfig.url, {
      method: requestConfig.method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestConfig.body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status} al ${idAsistenciaExistente ? 'actualizar' : 'crear'} asistencia: ${errorText}`);
    }
    
    return true;
    
  } catch (error) {
    return false;
  }
}







/** Prepara la configuración del request para asistencia */
function prepararRequestAsistencia(
  idAsistenciaExistente: number | null,
  estudianteIdNumerico: number,
  profesorId: number,
  cursoId: number,
  asignaturaId: number,
  fecha: string,
  presente: number,
  observaciones: string
): { method: string; url: string; body: any } {
  if (idAsistenciaExistente) {
    return {
      method: 'PUT',
      url: `${API_URLS.asistencia}/asistencia/${idAsistenciaExistente}`,
      body: {
        presente: presente,
        observaciones: observaciones
      }
    };
  } else {
    return {
      method: 'POST',
      url: `${API_URLS.asistencia}/asistencia/`,
      body: {
        id_estudiante: estudianteIdNumerico,
        id_profesor: profesorId,
        id_curso: cursoId,
        id_asignatura: asignaturaId,
        fecha: fecha,
        presente: presente,
        observaciones: observaciones
      }
    };
  }
}

// =============================================================================
// FUNCIONES PRINCIPALES - GESTIÓN DE CALIFICACIONES
// =============================================================================

/**
 * Obtiene calificaciones de un estudiante para una asignatura específica
 * @param idEstudiante ID del estudiante
 * @param idAsignatura ID de la asignatura REAL (no ID de asignación)
 * @returns Array de calificaciones del estudiante para esa asignatura
 */
export async function getCalificacionesPorEstudianteYAsignatura(
  idEstudiante: string,
  idAsignatura: string
): Promise<CalificacionRegistro[]> {
  try {
    console.log(`🔍 Consultando calificaciones para estudiante ${idEstudiante} en asignatura ${idAsignatura}`);
    
    const response = await fetch(
      `${API_URLS.calificaciones}/estudiante/${idEstudiante}/asignatura/${idAsignatura}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        console.log(`ℹ️ No hay calificaciones para estudiante ${idEstudiante} en asignatura ${idAsignatura}`);
        return crearCalificacionesVacias();
      }
      throw new Error(`Error al obtener calificaciones: ${response.status}`);
    }

    const calificacionesAPI = await response.json();
    console.log(`✅ Calificaciones obtenidas para estudiante ${idEstudiante}:`, calificacionesAPI);
    
    return mapearCalificacionesAPI(calificacionesAPI);
    
  } catch (error) {
    console.warn(`⚠️ Error al obtener calificaciones para estudiante ${idEstudiante} en asignatura ${idAsignatura}:`, error);
    return crearCalificacionesVacias();
  }
}

// =============================================================================
// FUNCIONES UTILITARIAS PARA CALIFICACIONES
// =============================================================================

/** Crea estructura de calificaciones vacías */
function crearCalificacionesVacias(): CalificacionRegistro[] {
  return [
    { periodo: 'parcial1' as const, nota: null },
    { periodo: 'parcial2' as const, nota: null },
    { periodo: 'parcial3' as const, nota: null }
  ];
}

/** Mapea calificaciones de la API al formato del frontend */
function mapearCalificacionesAPI(calificacionesAPI: any[]): CalificacionRegistro[] {
  const calificacionesMapeadas = crearCalificacionesVacias();

  if (Array.isArray(calificacionesAPI) && calificacionesAPI.length > 0) {
    // Ordenar por fecha para obtener el más reciente
    const calificacionesOrdenadas = calificacionesAPI.sort((a, b) => {
      const fechaA = new Date(a.fecha_registro || a.fecha_calificacion || '2000-01-01');
      const fechaB = new Date(b.fecha_registro || b.fecha_calificacion || '2000-01-01');
      
      if (fechaA.getTime() !== fechaB.getTime()) {
        return fechaB.getTime() - fechaA.getTime();
      }
      
      const periodoA = a.periodo || '2025-1';
      const periodoB = b.periodo || '2025-1';
      return periodoB.localeCompare(periodoA);
    });
    
    const calificacion = calificacionesOrdenadas[0];
    console.log(`📊 Mapeando calificación más reciente:`, calificacion);
    
    // Mapear nota1, nota2, nota3 de la API a parcial1, parcial2, parcial3 del frontend
    const mapeos = [
      { apiField: 'nota1', index: 0, periodo: 'parcial1' as const },
      { apiField: 'nota2', index: 1, periodo: 'parcial2' as const },
      { apiField: 'nota3', index: 2, periodo: 'parcial3' as const }
    ];

    mapeos.forEach(({ apiField, index, periodo }) => {
      if (calificacion[apiField] !== null && calificacion[apiField] !== undefined) {
        calificacionesMapeadas[index] = {
          id: calificacion.id_calificacion?.toString() || calificacion.id?.toString(),
          periodo: periodo,
          nota: calificacion[apiField],
          observaciones: calificacion.observaciones,
          fechaRegistro: calificacion.fecha_registro || calificacion.fecha_calificacion
        };
        console.log(`✅ Mapeado ${periodo}: ${calificacion[apiField]}`);
      }
    });
  }

  return calificacionesMapeadas;
}

/** Verifica conectividad con el servidor de calificaciones */
async function verificarConectividadCalificaciones(): Promise<void> {
  try {
    const healthCheck = await fetch(`${API_URLS.calificaciones}/`, { method: 'HEAD' });
    if (!healthCheck.ok && healthCheck.status !== 405) {
      throw new Error(`Servidor de calificaciones no disponible en puerto 8003`);
    }
  } catch (healthError) {
    throw new Error(`Servidor de calificaciones no disponible en puerto 8003`);
  }
}

/**
 * Crea o actualiza una calificación
 * @param idMateria ID de la asignación (se obtendrá el id_asignatura real)
 * @param idEstudiante ID del estudiante
 * @param periodo El período de la calificación ('parcial1', 'parcial2', 'parcial3')
 * @param nota La nueva nota
 * @returns Promesa que resuelve a 'true' si la actualización fue exitosa
 */
export async function updateCalificacion(
  idMateria: string,
  idEstudiante: string,
  periodo: CalificacionRegistro['periodo'],
  nota: number | null
): Promise<boolean> {
  
  try {
    if (nota === null || isNaN(nota)) {
      return true;
    }

    const idAsignaturaReal = await obtenerIdAsignaturaReal(idMateria);
    
    if (!idAsignaturaReal) {
      throw new Error('No se pudo obtener el ID de la asignatura');
    }

    const estudianteIdNumerico = validarIdEstudiante(idEstudiante);
    validarRangoNota(nota);
    
    const campoNota = mapearPeriodoACampo(periodo);

    await verificarConectividadCalificaciones();

    // Obtener calificaciones existentes para preservar las demás notas
    let notasExistentes = {
      nota1: 0.0,
      nota2: 0.0,
      nota3: 0.0
    };
    
    let periodoActual = '2025-1'; // Período por defecto

    try {
      const response = await fetch(
        `${API_URLS.calificaciones}/estudiante/${estudianteIdNumerico}/asignatura/${idAsignaturaReal}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      if (response.ok) {
        const calificacionesExistentes = await response.json();
        if (Array.isArray(calificacionesExistentes) && calificacionesExistentes.length > 0) {
          // Ordenar por fecha para obtener el más reciente
          const calificacionesOrdenadas = calificacionesExistentes.sort((a, b) => {
            const fechaA = new Date(a.fecha_registro || a.fecha_calificacion || '2000-01-01');
            const fechaB = new Date(b.fecha_registro || b.fecha_calificacion || '2000-01-01');
            return fechaB.getTime() - fechaA.getTime();
          });
          
          const calificacion = calificacionesOrdenadas[0];
          notasExistentes.nota1 = calificacion.nota1 ?? 0.0;
          notasExistentes.nota2 = calificacion.nota2 ?? 0.0;
          notasExistentes.nota3 = calificacion.nota3 ?? 0.0;
          periodoActual = calificacion.periodo || '2025-1';
        }
      }
    } catch (error) {
      // Si falla obtener las existentes, usar valores 0.0
    }
    
    // Actualizar solo la nota del período específico
    const calificacionData = {
      periodo: periodoActual,
      nota1: campoNota === 'nota1' ? parseFloat(nota.toFixed(1)) : notasExistentes.nota1,
      nota2: campoNota === 'nota2' ? parseFloat(nota.toFixed(1)) : notasExistentes.nota2,
      nota3: campoNota === 'nota3' ? parseFloat(nota.toFixed(1)) : notasExistentes.nota3
    };

    const url = `${API_URLS.calificaciones}/estudiante/${estudianteIdNumerico}/asignatura/${idAsignaturaReal}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(calificacionData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status} al procesar calificación: ${errorText}`);
    }
    
    return true;
    
  } catch (error) {
    return false;
  }
}

// =============================================================================
// FUNCIONES DE OBTENCIÓN DE DATOS DE LA API
// =============================================================================

/** Obtiene el ID de asignatura real a partir del ID de materia */
async function obtenerIdAsignaturaReal(idMateria: string): Promise<number | null> {
  try {
    const asignacionUrl = `${API_URLS.asignaturas}/asignacion_asignaturas/${idMateria}`;
    
    const asignacionResponse = await fetch(asignacionUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (asignacionResponse.ok) {
      const asignacionData: AsignacionCompleta = await asignacionResponse.json();
      return asignacionData.id_asignatura;
    } else {
      const errorText = await asignacionResponse.text();
      throw new Error(`No se pudo obtener información de la asignación: ${asignacionResponse.status} - ${errorText}`);
    }
  } catch (fetchError) {
    throw new Error(`Error al obtener asignación: ${fetchError instanceof Error ? fetchError.message : 'Error desconocido'}`);
  }
}

/** Obtiene información de asignación (curso y asignatura) */
async function obtenerInformacionAsignacion(idMateria: string): Promise<{ cursoId: number | null; asignaturaId: number | null }> {
  try {
    const asignacionResponse = await fetch(`${API_URLS.asignaturas}/asignacion_asignaturas/${idMateria}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (asignacionResponse.ok) {
      const asignacionData: AsignacionCompleta = await asignacionResponse.json();
      return {
        cursoId: asignacionData.id_curso,
        asignaturaId: asignacionData.id_asignatura
      };
    } else {
      const errorText = await asignacionResponse.text();
      throw new Error(`No se pudo obtener información de la asignación: ${asignacionResponse.status} - ${errorText}`);
    }
  } catch (fetchError) {
    throw new Error(`Error de conexión al obtener asignación: ${fetchError instanceof Error ? fetchError.message : 'Error desconocido'}`);
  }
}

/** Obtiene curso ID de una materia específica */
async function obtenerCursoIdDeLaMateria(materiaId: string, profesorId: number): Promise<string | null> {
  try {
    const asignacionResponse = await fetch(`${API_URLS.asignaturas}/asignacion_asignaturas/${materiaId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (asignacionResponse.ok) {
      const asignacionData: AsignacionCompleta = await asignacionResponse.json();
      return asignacionData.id_curso.toString();
    }
  } catch (error) {
    // Error silenciado intencionalmente
  }
  
  // Fallback: buscar en todas las asignaciones del profesor
  try {
    const asignacionesResponse = await fetch(`${API_URLS.asignaturas}/asignacion_asignaturas/por_profesor/${profesorId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (asignacionesResponse.ok) {
      const asignaciones: AsignacionCompleta[] = await asignacionesResponse.json();
      const asignacionEncontrada = asignaciones.find(a => a.id_asignacion.toString() === materiaId);
      
      if (asignacionEncontrada) {
        return asignacionEncontrada.id_curso.toString();
      }
    }
  } catch (error) {
    // Error silenciado intencionalmente
  }
  
  return null;
}

// =============================================================================
// FUNCIONES DE UTILIDAD - PROFESOR Y CONFIGURACIÓN
// =============================================================================

/**
 * Obtiene la información del profesor actual
 * @param testMode Si es true, devuelve datos de prueba para testing
 * @returns Información del profesor con ID y nombre
 */
export async function getProfesorActual(testMode: boolean = false): Promise<{ id: string; nombre: string }> {
  // Si estamos en modo test, devolver datos de prueba
  if (testMode) {
    return TEST_DATA.profesor;
  }
  await new Promise(resolve => setTimeout(resolve, 100)); // Simula latencia
  
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      const nombres = user.nombres || '';
      const apellidos = user.apellidos || '';
      
      let nombreCompleto = '';
      if (nombres || apellidos) {
        nombreCompleto = `${nombres} ${apellidos}`.trim();
      } else if (user.name) {
        nombreCompleto = user.name;
      } else {
        nombreCompleto = 'Prof. Usuario Actual';
      }
      
      return { 
        id: user.id_profesor?.toString() || 'profesor123', 
        nombre: nombreCompleto
      };
    } catch (error) {
      // Error silenciado intencionalmente
    }
  }
  
  return { id: 'profesor123', nombre: 'Prof. Carlos' };
}

/**
 * Verifica si la edición está bloqueada para una materia y fecha específica
 * @param idMateria ID de la materia
 * @param fecha Fecha para verificar el bloqueo
 * @param testMode Si es true, devuelve datos de prueba para testing
 * @returns Promesa que resuelve a 'true' si la edición está bloqueada
 */
export async function checkIfEditionIsLocked(idMateria: string, fecha: string, testMode: boolean = false): Promise<boolean> {
    // En modo test, siempre permitir edición
    if (testMode) {
      return false;
    }
    
    await new Promise(resolve => setTimeout(resolve, 200)); // Simula latencia
    return !IS_EDITION_ENABLED;
}

// =============================================================================
// FUNCIONES PRINCIPALES - GESTIÓN DE ESTUDIANTES
// =============================================================================

/**
 * Obtiene estudiantes del curso asociado a una materia específica
 * @param materiaId ID de la materia
 * @returns Lista de estudiantes con calificaciones e información
 */
export async function getEstudiantesDeLaMateria(materiaId: string): Promise<EstudianteAsignatura[]> {
  try {
    console.log(`🎯 Obteniendo estudiantes para materia ID: ${materiaId}`);
    
    const profesorId = getProfesorLogueadoId();
    if (!profesorId) {
      throw new Error('No se encontró el ID del profesor logueado');
    }
    
    const cursoId = await obtenerCursoIdDeLaMateria(materiaId, profesorId);
    
    if (!cursoId) {
      console.warn(`⚠️ No se pudo obtener curso ID para materia ${materiaId}`);
      return fakeEstudiantesGeneral.slice(0, 3);
    }
    
    console.log(`📚 Curso ID obtenido: ${cursoId} para materia ${materiaId}`);
    
    const estudiantesResponse = await fetch(`${API_URLS.estudiantes}/estudiantes/por_curso/${cursoId}`);
    
    if (!estudiantesResponse.ok) {
      console.warn(`⚠️ Error al obtener estudiantes del curso ${cursoId}: ${estudiantesResponse.status}`);
      return await intentarFallbackEstudiantes(cursoId, materiaId);
    }
    
    const estudiantesAPI: EstudianteAPI[] = await estudiantesResponse.json();
    
    if (!Array.isArray(estudiantesAPI) || estudiantesAPI.length === 0) {
      console.warn(`⚠️ No se encontraron estudiantes en el curso ${cursoId}`);
      return fakeEstudiantesGeneral.slice(0, 3);
    }
    
    console.log(`👥 Encontrados ${estudiantesAPI.length} estudiantes en curso ${cursoId}`);
    
    // Procesar estudiantes con el materiaId específico para obtener calificaciones correctas
    return await procesarEstudiantesAPI(estudiantesAPI, cursoId, materiaId);
    
  } catch (error) {
    console.error(`❌ Error al obtener estudiantes de la materia ${materiaId}:`, error);
    return fakeEstudiantesGeneral.slice(0, 3);
  }
}



/**
 * Función auxiliar para intentar fallback de estudiantes
 */
async function intentarFallbackEstudiantes(cursoId: string, materiaId?: string): Promise<EstudianteAsignatura[]> {
  try {
    const fallbackResponse = await fetch(`${API_URLS.estudiantes}/estudiantes/por_asignatura/${cursoId}`);
    if (fallbackResponse.ok) {
      const fallbackData = await fallbackResponse.json();
      return await procesarEstudiantesAPI(fallbackData, cursoId, materiaId);
    }
  } catch (fallbackError) {
    // Error silenciado intencionalmente
  }
  
  return fakeEstudiantesGeneral.slice(0, 3);
}

/**
 * Obtener asistencia de un estudiante para una fecha
 * 
 * @param idEstudiante ID del estudiante
 * @param fecha Fecha de la asistencia (YYYY-MM-DD)
 * @param idMateria (Opcional) ID de la materia
 * @returns Estado de asistencia del estudiante para la fecha
 */
export async function getAsistenciaEstudiante(
  idEstudiante: string,
  fecha: string,
  idMateria?: string // Se mantiene por compatibilidad pero SE IGNORA
): Promise<{ estado: 'Presente' | 'Ausente' | 'Justificado' } | null> {
  try {
    // Usar el endpoint específico por estudiante y fecha
    const url = `${API_URLS.asistencia}/asistencia/por_estudiante/${idEstudiante}/fecha/${fecha}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // No hay asistencia registrada para esta fecha
      }
      return null;
    }

    const asistenciasData = await response.json();
    
    // Si no hay registros para esta fecha, retornar null
    if (!Array.isArray(asistenciasData) || asistenciasData.length === 0) {
      return null;
    }
    
    // Tomar cualquier registro porque todos deben tener el mismo estado
    const asistencia = asistenciasData[0];

    // Convertir el formato de la API (1,2,3) al formato del frontend
    let estado: 'Presente' | 'Ausente' | 'Justificado';
    
    switch (asistencia.presente) {
      case 1:
        estado = 'Presente' as const;
        break;
      case 2:
        estado = 'Ausente' as const;
        break;
      case 3:
        estado = 'Justificado' as const;
        break;
      default:
        estado = 'Ausente' as const; // fallback
        break;
    }
    
    return { estado };
  } catch (error) {
    return null;
  }
}

/**
 * Obtener todas las asistencias de un curso para una fecha específica
 * 
 * @param idCurso ID del curso
 * @param fecha Fecha de las asistencias (YYYY-MM-DD)
 * @param idMateria (Opcional) ID de la materia
 * @returns Array de asistencias de los estudiantes del curso
 */
export async function getAsistenciasCurso(
  idCurso: string,
  fecha: string,
  idMateria?: string // Se mantiene por compatibilidad pero SE IGNORA
): Promise<Array<{
  id_estudiante: number;
  estado: 'Presente' | 'Ausente' | 'Justificado';
}>> {
  try {
    // Usar el endpoint que obtiene todas las asistencias de una fecha
    const url = `${API_URLS.asistencia}/asistencia/por_fecha/${fecha}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      return [];
    }

    const asistenciasData = await response.json();
    
    // Solo filtrar por curso
    const asistenciasFiltradas = asistenciasData.filter((asistencia: any) => {
      return asistencia.id_curso.toString() === idCurso;
    });
    
    // Agrupar por estudiante para evitar duplicados
    const asistencias = new Map<number, any>();
    
    asistenciasFiltradas.forEach((asistencia: any) => {
      const idEstudiante = asistencia.id_estudiante;
      
      // Solo tomar el primer registro de cada estudiante
      if (!asistencias.has(idEstudiante)) {
        asistencias.set(idEstudiante, asistencia);
      }
    });
    
    // Convertir el formato de la API (1,2,3) al formato del frontend
    const asistenciasConvertidas = Array.from(asistencias.values()).map((asistencia: any) => {
      let estado: 'Presente' | 'Ausente' | 'Justificado';
      
      switch (asistencia.presente) {
        case 1:
          estado = 'Presente' as const;
          break;
        case 2:
          estado = 'Ausente' as const;
          break;
        case 3:
          estado = 'Justificado' as const;
          break;
        default:
          estado = 'Ausente' as const; // fallback
          break;
      }
      
      return {
        id_estudiante: asistencia.id_estudiante,
        estado
      };
    });
    
    return asistenciasConvertidas;
  } catch (error) {
    return [];
  }
}

/**
 * Combinar estudiantes con sus asistencias para una fecha específica
 * Esta función toma la lista de estudiantes del curso y les agrega su estado de asistencia
 * 
 * @param idMateria ID de la materia/asignación (usado para obtener estudiantes del curso)
 * @param fecha Fecha para consultar asistencias (YYYY-MM-DD)
 * @param testMode Si es true, devuelve datos de prueba para testing
 * @returns Lista de estudiantes con su estado de asistencia incluido
 */
export async function getEstudiantesConAsistencias(
  idMateria: string,
  fecha: string,
  testMode: boolean = false
): Promise<Array<EstudianteAsignatura & { 
  estadoAsistencia: 'Presente' | 'Ausente' | 'Justificado' | 'No registrado'
}>> {
  // Si estamos en modo test, devolver datos de prueba
  if (testMode) {
    return TEST_DATA.estudiantesConAsistencias;
  }
  
  try {
    // Usar la función optimizada para obtener asistencias por fecha
    const result = await getAsistenciasPorFecha(idMateria, fecha);
    return result;
    
  } catch (error) {
    
    // Fallback: retornar estudiantes sin asistencia
    const estudiantes = await getEstudiantesDeLaMateria(idMateria);
    return estudiantes.map(estudiante => ({
      ...estudiante,
      estadoAsistencia: 'No registrado' as const
    }));
  }
}

/**
 * Obtener asistencias de una materia para una fecha específica
 * 
 * Esta función permite al profesor consultar asistencias de cualquier fecha.
 * 
 * @param idMateria ID de la materia/asignación (usado para obtener estudiantes del curso)
 * @param fecha Fecha para consultar asistencias (YYYY-MM-DD)
 * @returns Lista de estudiantes con su estado de asistencia para la fecha específica
 */
export async function getAsistenciasPorFecha(
  idMateria: string,
  fecha: string
): Promise<Array<EstudianteAsignatura & { 
  estadoAsistencia: 'Presente' | 'Ausente' | 'Justificado' | 'No registrado'
}>> {
  
  try {
    // 1. Obtener lista de estudiantes del curso
    const estudiantes = await getEstudiantesDeLaMateria(idMateria);
    
    // 2. Obtener información del curso para consultas de asistencia masiva (opcional)
    let cursoId: string | null = null;
    
    try {
      const profesorId = getProfesorLogueadoId();
      if (profesorId) {
        const asignacionResponse = await fetch(`${API_URLS.asignaturas}/asignacion_asignaturas/${idMateria}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (asignacionResponse.ok) {
          const asignacionData: AsignacionCompleta = await asignacionResponse.json();
          cursoId = asignacionData.id_curso.toString();
        }
      }
    } catch (error) {
      // Continuar sin curso ID si hay error
    }
    
    // 3. Intentar obtener asistencias masivas del curso (todas globales)
    let asistenciasCurso: Array<{
      id_estudiante: number;
      estado: 'Presente' | 'Ausente' | 'Justificado';
    }> = [];
    
    if (cursoId) {
      try {
        // Obtener asistencias globales del curso (sin filtrar por materia)
        asistenciasCurso = await getAsistenciasCurso(cursoId, fecha);
      } catch (error) {
        // Continuar sin asistencias masivas si hay error
      }
    }
    
    // 4. Combinar estudiantes con sus asistencias GLOBALES para la fecha específica
    const estudiantesConAsistencias = await Promise.all(
      estudiantes.map(async (estudiante) => {
        let estadoAsistencia: 'Presente' | 'Ausente' | 'Justificado' | 'No registrado' = 'No registrado';
        
        // Buscar primero en las asistencias globales del curso (método masivo)
        const asistenciaCurso = asistenciasCurso.find(
          a => a.id_estudiante.toString() === estudiante.id
        );
        
        if (asistenciaCurso) {
          estadoAsistencia = asistenciaCurso.estado;
        } else {
          // Si no se encontró en la consulta masiva, usar el endpoint específico global
          try {
            const asistenciaGlobal = await getAsistenciaEstudiante(estudiante.id, fecha);
            if (asistenciaGlobal) {
              estadoAsistencia = asistenciaGlobal.estado;
            }
          } catch (error) {
            // Mantener como 'No registrado' si hay error
          }
        }
        
        return {
          ...estudiante,
          estadoAsistencia
        };
      })
    );
    
    // Resumen de asistencias para debugging
    const resumen = estudiantesConAsistencias.reduce((acc, est) => {
      acc[est.estadoAsistencia] = (acc[est.estadoAsistencia] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return estudiantesConAsistencias;
    
  } catch (error) {
    
    // Fallback: retornar estudiantes sin asistencia
    const estudiantes = await getEstudiantesDeLaMateria(idMateria);
    return estudiantes.map(estudiante => ({
      ...estudiante,
      estadoAsistencia: 'No registrado' as const
    }));
  }
}

/** Verifica si ya existe una asistencia para un estudiante en una fecha específica */
async function verificarAsistenciaExistente(
  idEstudiante: number,
  fecha: string,
  idAsignatura: number // Se mantiene por compatibilidad pero SE IGNORA
): Promise<number | null> {
  try {
    
    // Usar el endpoint específico por estudiante y fecha
    const response = await fetch(`${API_URLS.asistencia}/asistencia/por_estudiante/${idEstudiante}/fecha/${fecha}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      return null;
    }
    
    const asistenciasData = await response.json();
    
    // Si no hay registros para esta fecha, retornar null
    if (!Array.isArray(asistenciasData) || asistenciasData.length === 0) {
      return null;
    }
    
    // Tomar cualquier registro para obtener el ID
    const asistencia = asistenciasData[0];
    
    return asistencia.id_asistencia || asistencia.id;
    
  } catch (error) {
    return null;
  }
}

/**
 * Obtener información detallada de una asistencia específica
 * 
 * @param idEstudiante ID del estudiante
 * @param fecha Fecha de la asistencia
 * @param idMateria ID de la materia (opcional)
 * @returns Información detallada de la asistencia o null si no existe
 */
export async function obtenerDetalleAsistencia(
  idEstudiante: string,
  fecha: string,
  idMateria?: string // Se mantiene por compatibilidad pero SE IGNORA
): Promise<{
  existe: boolean;
  detalles?: any;
  estado?: 'Presente' | 'Ausente' | 'Justificado';
  fechaCreacion?: string;
  observaciones?: string;
}> {
  
  try {
    // Usar el endpoint específico por estudiante y fecha
    const response = await fetch(`${API_URLS.asistencia}/asistencia/por_estudiante/${idEstudiante}/fecha/${fecha}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { existe: false };
      }
      throw new Error(`Error al obtener asistencias: ${response.status}`);
    }

    const asistencias = await response.json();
    
    // Si no hay registros para esta fecha, retornar que no existe
    if (!Array.isArray(asistencias) || asistencias.length === 0) {
      return { existe: false };
    }
    
    // Tomar cualquier registro porque todos deben tener el mismo estado
    const asistencia = asistencias[0];

    // Convertir estado al formato del frontend
    let estado: 'Presente' | 'Ausente' | 'Justificado';
    switch (asistencia.presente) {
      case 1:
        estado = 'Presente' as const;
        break;
      case 2:
        estado = 'Ausente' as const;
        break;
      case 3:
        estado = 'Justificado' as const;
        break;
      default:
        estado = 'Ausente' as const;
    }

    const resultado = {
      existe: true,
      detalles: asistencia,
      estado: estado,
      fechaCreacion: asistencia.fecha,
      observaciones: asistencia.observaciones || 'Sin observaciones'
    };

    return resultado;
    
  } catch (error) {
    return { existe: false };
  }
}

/**
 * Función específica para actualizar asistencia existente
 * 
 * Esta función utiliza directamente el endpoint PUT para actualizar una asistencia
 * cuando ya conoces el ID del registro que quieres modificar.
 * 
 * @param idAsistencia ID del registro de asistencia a actualizar
 * @param nuevoEstado Nuevo estado de asistencia
 * @param observaciones Observaciones adicionales (opcional)
 * @returns Promesa que resuelve a true si la actualización fue exitosa
 */
export async function actualizarAsistenciaExistente(
  idAsistencia: number,
  nuevoEstado: 'Presente' | 'Ausente' | 'Justificado',
  observaciones?: string
): Promise<boolean> {
  
  try {
    // Convertir el estado del frontend al formato de la API
    let presente: number;
    let obs: string = observaciones || "";
    
    switch (nuevoEstado) {
      case 'Presente':
        presente = 1;
        obs = obs || "";
        break;
      case 'Ausente':
        presente = 2;
        obs = obs || "";
        break;
      case 'Justificado':
        presente = 3;
        obs = obs || "Justificado";
        break;
      default:
        throw new Error(`Estado de asistencia no válido: ${nuevoEstado}`);
    }

    const updateData = {
      presente: presente,
      observaciones: obs
    };

    // Usar el endpoint PUT para actualizar
    const response = await fetch(`${API_URLS.asistencia}/asistencia/${idAsistencia}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
                     body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error ${response.status} al actualizar asistencia: ${errorText}`);
    }

    const result = await response.json();
    return true;

  } catch (error) {
    return false;
  }
}

/**
 * Función para obtener detalles de una asistencia por su ID
 * 
 * Utiliza el nuevo endpoint GET /asistencia/{id_asistencia} para obtener
 * información detallada de un registro específico.
 * 
 * @param idAsistencia ID del registro de asistencia
 * @returns Información detallada del registro o null si no existe
 */
export async function obtenerAsistenciaPorId(
  idAsistencia: number
): Promise<{
  id: number;
  estudiante: number;
  profesor: number;
  curso: number;
  asignatura: number;
  fecha: string;
  estado: 'Presente' | 'Ausente' | 'Justificado';
  observaciones: string;
} | null> {
  
  try {
    const response = await fetch(`${API_URLS.asistencia}/asistencia/${idAsistencia}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Error al obtener asistencia: ${response.status}`);
    }

    const asistencia = await response.json();
    
    // Convertir estado al formato del frontend
    let estado: 'Presente' | 'Ausente' | 'Justificado';
    switch (asistencia.presente) {
      case 1:
        estado = 'Presente' as const;
        break;
      case 2:
        estado = 'Ausente' as const;
        break;
      case 3:
        estado = 'Justificado' as const;
        break;
      default:
        estado = 'Ausente' as const;
    }

    const resultado = {
      id: asistencia.id_asistencia || asistencia.id,
      estudiante: asistencia.id_estudiante,
      profesor: asistencia.id_profesor,
      curso: asistencia.id_curso,
      asignatura: asistencia.id_asignatura,
      fecha: asistencia.fecha,
      estado: estado,
      observaciones: asistencia.observaciones || ''
    };

    return resultado;

  } catch (error) {
    return null;
  }
}

// =============================================================================
// RESUMEN DE API Y RECOMENDACIONES
// =============================================================================

/**
 * RESUMEN DE FUNCIONES DISPONIBLES EN ESTE SERVICIO:
 * 
 * ASIGNATURAS:
 * - getAsignaturasDelProfesor() - Lista de asignaturas del profesor
 * - getMateriaDetalle() - Detalles completos de una materia específica
 * 
 * ESTUDIANTES:
 * - getEstudiantesDeLaMateria() - Estudiantes de una materia específica
 * - getEstudiantesConCalificaciones() - Combina estudiantes con calificaciones
 * - getEstudiantesConAsistencias() - Combina estudiantes con asistencias
 * 
 * CALIFICACIONES:
 * - getCalificacionesPorEstudianteYAsignatura() - Calificaciones específicas
 * - updateCalificacion() - Crear/actualizar calificaciones
 * - autoGuardarCalificacion() - Auto-guardado de calificaciones
 * - getCalificacionesPorAsignatura() - Todas las calificaciones de una asignatura
 * - getResumenCalificacionesAsignatura() - Estadísticas de calificaciones
 * 
 * ASISTENCIAS:
 * - updateAsistencia() - Crear/actualizar asistencias
 * - getAsistenciaEstudiante() - Asistencia de un estudiante específico
 * - getAsistenciasCurso() - Asistencias de un curso completo
 * - getAsistenciasPorFecha() - Asistencias por fecha específica
 * - actualizarAsistenciaExistente() - Actualizar registro existente
 * - obtenerAsistenciaPorId() - Detalles de asistencia por ID
 * 
 * UTILIDADES:
 * - getProfesorActual() - Información del profesor logueado
 * - checkIfEditionIsLocked() - Verificar si la edición está bloqueada
 * 
 * ENDPOINTS DE API UTILIZADOS:
 * - Puerto 8000: Autenticación
 * - Puerto 8001: Asignaturas y asignaciones
 * - Puerto 8002: Asistencias
 * - Puerto 8003: Calificaciones
 * - Puerto 8004: Cursos
 * - Puerto 8005: Estudiantes
 * - Puerto 8011: Observaciones
 * 
 * PARA NOTIFICACIONES CENTRADAS:
 * Para centrar las notificaciones de éxito (ej: "datos actualizados correctamente"),
 * modifica el componente de notificaciones en tu frontend para usar:
 * 
 * CSS: 
 * .notification-center {
 *   position: fixed;
 *   top: 50%;
 *   left: 50%;
 *   transform: translate(-50%, -50%);
 *   z-index: 9999;
 * }
 * 
 * O en React/Vue, usar bibliotecas como react-hot-toast o vue-toastification
 * con configuración position: 'top-center' o 'center'.
 */

export default {
  getAsignaturasDelProfesor,
  getMateriaDetalle,
  getEstudiantesDeLaMateria,
  getCalificacionesPorEstudianteYAsignatura,
  updateCalificacion,
  updateAsistencia,
  getProfesorActual,
  checkIfEditionIsLocked,
  getAsistenciaEstudiante,
  getAsistenciasCurso,
  getEstudiantesConAsistencias,
  getAsistenciasPorFecha,
  // Funciones de observaciones
  crearObservacion,
  getObservacionesEstudiante,
  validarDatosObservacion,
  // Funciones auxiliares para fechas
  obtenerFechaSegura,
  validarFechaNoFutura,
  // ... otras funciones exportadas
};

/**
 * Guardar calificación automáticamente cuando el usuario modifica una nota
 * 
 * Esta función se puede usar para auto-guardar calificaciones en tiempo real
 * cuando el usuario pierde el foco del campo de nota.
 *
 * @param idMateria ID de la asignación
 * @param idEstudiante ID del estudiante
 * @param periodo El período de la calificación
 * @param nota La nueva nota
 * @returns Promesa que resuelve a resultado del guardado
 */
export async function autoGuardarCalificacion(
  idMateria: string,
  idEstudiante: string,
  periodo: CalificacionRegistro['periodo'],
  nota: number | null
): Promise<{ exito: boolean; mensaje: string }> {
  
  try {
    if (nota === null) {
      return { exito: true, mensaje: 'Nota vacía, no se guardó' };
    }

    const exito = await updateCalificacion(idMateria, idEstudiante, periodo, nota);
    
    if (exito) {
      return { exito: true, mensaje: `${periodo} guardado: ${nota}` };
    } else {
      return { exito: false, mensaje: `Error al guardar ${periodo}` };
    }
    
  } catch (error) {
    return { 
      exito: false, 
      mensaje: `Error: ${error instanceof Error ? error.message : 'Error desconocido'}` 
    };
  }
}

/**
 * Obtener todas las calificaciones de una asignatura específica
 * 
 * Esta función usa tu endpoint GET /calificaciones/por_asignatura/{id_asignatura}
 * para obtener todas las calificaciones de todos los estudiantes en una asignatura.
 *
 * @param idAsignatura ID de la asignatura
 * @returns Array de calificaciones de la asignatura
 */
export async function getCalificacionesPorAsignatura(
  idAsignatura: string
): Promise<Array<{
  id_calificacion: number;
  id_estudiante: number;
  periodo: string;
  nota: number;
  observaciones?: string;
  fecha_registro?: string;
}>> {
  try {
    const response = await fetch(
      `${API_URLS.calificaciones}/calificaciones/por_asignatura/${idAsignatura}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error(`Error al obtener calificaciones por asignatura: ${response.status}`);
    }

    const calificaciones = await response.json();
    return Array.isArray(calificaciones) ? calificaciones : [];
    
  } catch (error) {
    // Error silenciado intencionalmente
    return [];
  }
}

/**
 * Obtener un resumen de calificaciones por asignatura
 * 
 * Esta función complementa getCalificacionesPorAsignatura proporcionando
 * estadísticas útiles como promedio general, cantidad de estudiantes, etc.
 *
 * @param idAsignatura ID de la asignatura
 * @returns Resumen estadístico de las calificaciones
 */
export async function getResumenCalificacionesAsignatura(
  idAsignatura: string
): Promise<{
  totalEstudiantes: number;
  totalCalificaciones: number;
  promedioGeneral: number | null;
  distribucionPorPeriodo: Record<string, number>;
  notaMaxima: number | null;
  notaMinima: number | null;
}> {
  try {
    const calificaciones = await getCalificacionesPorAsignatura(idAsignatura);
    
    if (calificaciones.length === 0) {
      return {
        totalEstudiantes: 0,
        totalCalificaciones: 0,
        promedioGeneral: null,
        distribucionPorPeriodo: {},
        notaMaxima: null,
        notaMinima: null
      };
    }

    const estudiantesUnicos = new Set(calificaciones.map(c => c.id_estudiante));
    const notas = calificaciones.map(c => c.nota).filter(n => n !== null && n !== undefined);
    const distribucionPorPeriodo: Record<string, number> = {};

    // Contar calificaciones por período
    calificaciones.forEach(c => {
      distribucionPorPeriodo[c.periodo] = (distribucionPorPeriodo[c.periodo] || 0) + 1;
    });

    const promedioGeneral = notas.length > 0 
      ? parseFloat((notas.reduce((sum, nota) => sum + nota, 0) / notas.length).toFixed(2))
      : null;

    return {
      totalEstudiantes: estudiantesUnicos.size,
      totalCalificaciones: calificaciones.length,
      promedioGeneral,
      distribucionPorPeriodo,
      notaMaxima: notas.length > 0 ? Math.max(...notas) : null,
      notaMinima: notas.length > 0 ? Math.min(...notas) : null
    };

  } catch (error) {
    // Error silenciado intencionalmente
    return {
      totalEstudiantes: 0,
      totalCalificaciones: 0,
      promedioGeneral: null,
      distribucionPorPeriodo: {},
      notaMaxima: null,
      notaMinima: null
    };
  }
}

// =============================================================================
// INTEGRACIÓN CON OBSERVACIONES
// =============================================================================

import * as ObservacionService from './observacionService';

/**
 * Guarda una nueva observación para un estudiante en una materia específica
 * @param idMateria ID de la asignación de materia
 * @param observacionData Datos de la observación (sin ID ni fecha de registro)
 * @returns Promesa que resuelve con la observación guardada
 */
export async function crearObservacion(
  idMateria: string,
  observacionData: {
    idEstudiante: string;
    fechaIncidente: string;
    tipoFalta: 'Leve' | 'Grave' | 'Gravísima';
    articuloManualConvivencia: string;
    descripcion: string;
  }
): Promise<any> {
  try {
    const profesorActual = await getProfesorActual();
    
    const observacionCompleta = {
      ...observacionData,
      idMateria: idMateria,
      idProfesor: profesorActual.id
    };

    // Usar el servicio de observaciones pasando el ID de asignación
    const observacionGuardada = await ObservacionService.saveObservacion(
      observacionCompleta,
      idMateria // Pasar el ID de asignación para que se convierta al ID de asignatura real
    );

    console.log('[AsignaturaService] Observación creada exitosamente:', observacionGuardada);
    return observacionGuardada;

  } catch (error) {
    console.error('[AsignaturaService] Error al crear observación:', error);
    throw new Error(`Error al crear observación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

/**
 * Obtiene el historial de observaciones de un estudiante en una materia específica
 * @param idMateria ID de la asignación de materia
 * @param idEstudiante ID del estudiante
 * @returns Lista de observaciones del estudiante en esa materia
 */
export async function getObservacionesEstudiante(
  idMateria: string,
  idEstudiante: string
): Promise<any[]> {
  try {
    const observaciones = await ObservacionService.getObservacionesPorEstudianteYMateria(
      idEstudiante,
      idMateria
    );

    console.log(`[AsignaturaService] ${observaciones.length} observaciones obtenidas para estudiante ${idEstudiante}`);
    return observaciones;

  } catch (error) {
    console.error('[AsignaturaService] Error al obtener observaciones:', error);
    return [];
  }
}

/**
 * Obtiene una fecha segura para observaciones (evita fechas futuras)
 * @param diasAtras Número de días atrás (por defecto 0 para hoy como máximo)
 * @returns Fecha en formato YYYY-MM-DD
 */
export function obtenerFechaSegura(diasAtras: number = 0): string {
  // Fecha actual: julio 11, 2025
  const fechaActual = new Date('2025-07-11');
  fechaActual.setDate(fechaActual.getDate() - diasAtras);
  return fechaActual.toISOString().split('T')[0];
}

/**
 * Valida que una fecha no sea futura
 * @param fechaStr Fecha en formato YYYY-MM-DD
 * @returns true si la fecha es válida y no es futura
 */
export function validarFechaNoFutura(fechaStr: string): boolean {
  if (!validarFecha(fechaStr)) {
    return false;
  }
  
  const fecha = new Date(fechaStr);
  // Fecha máxima permitida: julio 11, 2025
  const fechaMaxima = new Date('2025-07-11');
  fechaMaxima.setHours(23, 59, 59, 999);
  
  return fecha <= fechaMaxima;
}

/**
 * Función auxiliar para validar datos de observación antes de crearla
 * @param observacionData Datos de la observación a validar
 * @returns true si los datos son válidos, lanza error si no
 */
export function validarDatosObservacion(observacionData: {
  idEstudiante: string;
  fechaIncidente: string;
  tipoFalta: string;
  articuloManualConvivencia: string;
  descripcion: string;
}): boolean {
  const errores: string[] = [];

  // Validar ID de estudiante
  if (!observacionData.idEstudiante || observacionData.idEstudiante.trim() === '') {
    errores.push('ID de estudiante es requerido');
  }

  // Validar fecha de incidente
  if (!observacionData.fechaIncidente) {
    errores.push('Fecha de incidente es requerida');
  } else if (!validarFecha(observacionData.fechaIncidente)) {
    errores.push('Formato de fecha inválido (debe ser YYYY-MM-DD)');
  } else if (!validarFechaNoFutura(observacionData.fechaIncidente)) {
    errores.push('La fecha del incidente no puede ser futura');
  }

  // Validar tipo de falta
  const tiposValidos = ['Leve', 'Grave', 'Gravísima'];
  if (!tiposValidos.includes(observacionData.tipoFalta)) {
    errores.push('Tipo de falta debe ser: Leve, Grave o Gravísima');
  }

  // Validar artículo del manual
  if (!observacionData.articuloManualConvivencia || observacionData.articuloManualConvivencia.trim() === '') {
    errores.push('Artículo del manual de convivencia es requerido');
  }

  // Validar descripción
  if (!observacionData.descripcion || observacionData.descripcion.trim().length < 10) {
    errores.push('Descripción debe tener al menos 10 caracteres');
  }

  if (errores.length > 0) {
    throw new Error(`Datos de observación inválidos: ${errores.join(', ')}`);
  }

  return true;
}


