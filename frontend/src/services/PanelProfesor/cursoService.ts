// Importamos los tipos de datos base usados en el frontend
import { Curso } from '../../models/PanelProfesor/curso';
import { Sede } from '../../models/PanelProfesor/sede';

/**
 * Esta interfaz extiende la interfaz base Curso para incluir el objeto completo de la sede.
 * El frontend espera que al consultar los cursos, cada uno venga con su sede ya incluida
 * como objeto anidado (no solo el ID de la sede).
 *
 * Ejemplo de objeto esperado por el frontend:
 * {
 *   id: "c1",
 *   nombre: "Curso A",
 *   grado: "10°",
 *   sede: {
 *     id: "s1",
 *     nombre: "Sede Norte",
 *     direccion: "Calle Falsa 123"
 *   },
 *   materias: [ ... ]
 * }
 */
export interface CursoConSede extends Curso {
  sede: Sede;
}

/**
 * Esta función hace una solicitud HTTP al backend para obtener todos los cursos disponibles.
 * El backend debe exponer un endpoint GET en la ruta `/cursos`, que devuelva un JSON con la forma descrita arriba.
 *
 * La respuesta debe tener el siguiente tipo:
 * Array<CursoConSede>
 * 
 * La estructura de cada curso incluye:
 * - id
 * - nombre
 * - grado
 * - sede: objeto con { id, nombre, direccion }
 * - materias: arreglo de materias opcional o incluido, dependiendo del diseño
 *
 * Si el servidor responde con un código distinto de 200 OK,
 * la función lanza una excepción para que el componente React pueda mostrar un error.
 * 
 * @returns Promesa que resuelve a un arreglo de cursos con sede.
 * @throws Error si la respuesta HTTP no fue exitosa.
 */
export async function getAllCursos(): Promise<CursoConSede[]> {
  // Realiza la petición HTTP al backend
  const response = await fetch('http://localhost:8000/cursos', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    // Si el backend utiliza sesiones con cookies, descomentar esta línea:
    // credentials: 'include'
  });

  // Si la respuesta no fue exitosa (por ejemplo, 500 o 404), lanza error
  if (!response.ok) {
    throw new Error(`Error al obtener cursos (status ${response.status})`);
  }

  // Si fue exitosa, convierte la respuesta a JSON y la devuelve tipada
  const data: CursoConSede[] = await response.json();
  return data;
}
