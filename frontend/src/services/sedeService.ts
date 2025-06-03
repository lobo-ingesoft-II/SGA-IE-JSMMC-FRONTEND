import { Sede } from '../models/sede';
import { Curso } from '../models/curso';

/**
 * Extiende la interfaz Curso para incluir la sede asociada.
 * El backend debe devolver cada curso con su objeto 'sede' correspondiente.
 */
export interface CursoConSede extends Curso {
  sede: Sede;
}

/**
 * Llama al backend para obtener:
 *   1) La información de la Sede (GET /sedes/{sedeId})
 *   2) Los cursos de esa Sede (GET /sedes/{sedeId}/cursos)
 *
 * Si alguna de las dos peticiones falla (por ejemplo,
 * el servidor no está corriendo → “Failed to fetch”),
 * este método arrojará un Error y corresponderá al componente
 * capturar ese error para usar datos de prueba.
 *
 * @param sedeId   ID de la sede a consultar.
 * @returns        Un objeto con { sede, cursos }.
 * @throws         Error si alguna petición no devuelve status 200.
 */
export async function getSedeAndCursos(
  sedeId: string
): Promise<{ sede: Sede; cursos: CursoConSede[] }> {
  // 1) Obtener la Sede
  const respSede = await fetch(`http://localhost:8000/sedes/${sedeId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    // credentials: 'include'  // Descomenta si usas cookies de sesión
  });
  if (!respSede.ok) {
    throw new Error(`No se pudo cargar la sede (status ${respSede.status})`);
  }
  const sede: Sede = await respSede.json();

  // 2) Obtener los cursos de esa Sede
  const respCursos = await fetch(`http://localhost:8000/sedes/${sedeId}/cursos`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    // credentials: 'include'
  });
  if (!respCursos.ok) {
    throw new Error(`No se pudo cargar los cursos (status ${respCursos.status})`);
  }
  const cursos: CursoConSede[] = await respCursos.json();

  return { sede, cursos };
}
