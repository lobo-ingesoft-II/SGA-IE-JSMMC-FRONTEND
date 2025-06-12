// Importamos el tipo Estudiante desde el modelo local
import { Estudiante } from '../../models/PanelProfesor/estudiante';

/**
 * Esta función obtiene la lista de estudiantes asignados a un curso específico.
 *
 * El frontend espera que el backend exponga un endpoint con la siguiente forma:
 * 
 *   GET /cursos/{cursoId}/estudiantes
 * 
 * Donde `{cursoId}` es el ID único del curso seleccionado.
 * 
 * El backend debe devolver un arreglo de objetos `Estudiante`, con la siguiente forma mínima esperada:
 * 
 * [
 *   {
 *     id: "e1",
 *     nombre: "Juan Pérez",
 *     inasistencias: 3
 *   },
 *   ...
 * ]
 * 
 * Esta información se utiliza en el frontend para mostrar una tabla con los nombres de los estudiantes
 * y su número de inasistencias.
 *
 * Si la respuesta del backend no es exitosa (por ejemplo, error 404 o 500),
 * se lanza una excepción para que la interfaz pueda mostrar un mensaje de error al usuario.
 *
 * @param cursoId ID del curso del cual se quieren obtener los estudiantes.
 * @returns Una promesa que resuelve a un arreglo de estudiantes.
 * @throws Error si el servidor responde con un estado distinto de 200 OK.
 */
export const getEstudiantesPorCurso = async (cursoId: string): Promise<Estudiante[]> => {
  const response = await fetch(`/cursos/${cursoId}/estudiantes`);

  // Si hay algún problema con la respuesta del servidor, se lanza un error
  if (!response.ok) {
    throw new Error('Error al obtener estudiantes');
  }

  // Si la respuesta fue exitosa, convertimos el JSON a un arreglo de estudiantes
  return await response.json();
};
