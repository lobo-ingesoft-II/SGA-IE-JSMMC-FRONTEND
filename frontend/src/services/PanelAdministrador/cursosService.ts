import axios from 'axios';

// Configuración base de la API
const API_BASE_URL = 'http://localhost:8004'; // URL del microservicio de cursos

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Curso {
  id_curso: number;
  nombre: string;
  grado: string;
  anio_lectivo: number;
  id_sede: number;
  director_profesor: number;
  cupos_disponibles?: number; // Puede que no venga en la respuesta
}

/**
 * Obtiene los cursos disponibles por sede
 */
export const getCursosPorSede = async (idSede: number): Promise<Curso[]> => {
  try {
    const response = await apiClient.get(`/cursos/sede/${idSede}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener cursos por sede:', error);
    throw new Error('No se pudieron cargar los cursos');
  }
};

/**
 * Obtiene los cursos disponibles por sede y grado
 */
export const getCursosPorSedeYGrado = async (nombreSede: string, grado: string): Promise<Curso[]> => {
  try {
    // Primero obtenemos el ID de la sede
    const responseSedes = await axios.get('http://localhost:8000/sedes/');
    const sedes = responseSedes.data;
    const sede = sedes.find((s: any) => s.nombre === nombreSede);
    
    if (!sede) {
      throw new Error(`No se encontró la sede: ${nombreSede}`);
    }
    
    // Luego obtenemos los cursos de esa sede
    const cursos = await getCursosPorSede(sede.id_sede);
    
    // Filtramos por grado
    return cursos.filter(curso => curso.grado === grado);
  } catch (error) {
    console.error('Error al obtener cursos por sede y grado:', error);
    throw new Error('No se pudieron cargar los cursos');
  }
};



/**
 * Función para obtener cursos
 */
export const getCursosConFallback = async (nombreSede: string, grado: string): Promise<any[]> => {
  try {
    const cursos = await getCursosPorSedeYGrado(nombreSede, grado);
    // Añadir cupos disponibles (esto debería venir del backend en un caso real)
    return cursos.map(curso => ({
      id: curso.id_curso,
      nombre: curso.nombre,
      grado: curso.grado,
      sede: nombreSede,
      cupos_disponibles: curso.cupos_disponibles || 10 // Valor por defecto
    }));
  } catch (error) {
    console.error('Error al obtener cursos:', error);
    throw new Error(`No se pudieron cargar los cursos para ${nombreSede} - ${grado}`);
  }
};