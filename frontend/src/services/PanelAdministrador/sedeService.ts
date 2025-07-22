import { Sede, Curso } from './inicioService';
import { getAllSedes, getCursosBySede } from './inicioService';

export interface SedeData {
  id: string;
  nombre: string;
  direccion: string;
  telefono: string;
  cursos: CursoData[];
}

export interface CursoData {
  id: string;
  nombre: string;
  grado: string;
  anioLectivo: number;
  directorProfesor: number;
}

export async function getSedeData(sedeId: string): Promise<SedeData> {
  try {
    // Obtener todas las sedes para encontrar la específica
    const sedes = await getAllSedes();
    const sede = sedes.find(s => s.id_sede.toString() === sedeId);
    
    if (!sede) {
      throw new Error('Sede no encontrada');
    }

    // Obtener cursos de la sede
    const cursos = await getCursosBySede(sede.id_sede);
    
    const cursosData: CursoData[] = cursos.map(curso => ({
      id: curso.id_curso.toString(),
      nombre: curso.nombre,
      grado: curso.grado,
      anioLectivo: curso.anio_lectivo,
      directorProfesor: curso.director_profesor
    }));

    return {
      id: sede.id_sede.toString(),
      nombre: sede.nombre,
      direccion: sede.direccion,
      telefono: sede.telefono,
      cursos: cursosData
    };
  } catch (error) {
    throw new Error(`Error al obtener datos de la sede: ${error}`);
  }
}