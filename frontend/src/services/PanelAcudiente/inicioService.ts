// Definimos una interfaz para los datos del acudiente que se mostrarán en la página de inicio
export interface AcudienteInicioData {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  sedesAsignadas: { id: string; nombre: string }[];
  cursosAsignados: { id: string; nombre: string; grado: string }[];
  materiasAsignadas: { id: string; nombre: string; cursoNombre: string }[];
}

/**
 * Simula la obtención de la información básica del acudiente para la página de inicio.
 * En una aplicación real, esto haría una llamada API al backend
 * para obtener los datos del acudiente logueado.
 *
 * @returns {Promise<AcudienteInicioData>} Una promesa que resuelve con los datos del acudiente.
 */
export async function getAcudienteInicioData(): Promise<AcudienteInicioData> {
  // Simular un retraso de red
  await new Promise(resolve => setTimeout(resolve, 800));

  // Datos de prueba para el acudiente
  const fakeAcudienteData: AcudienteInicioData = {
    id: 'acudiente123',
    nombre: 'Juan Pérez García',
    correo: 'juan.perez@iedjosuemanrique.edu.co',
    rol: 'Acudiente',
    sedesAsignadas: [
      { id: 'sede1', nombre: 'Sede Norte' },
      { id: 'sede2', nombre: 'Sede Sur' }
    ],
    cursosAsignados: [
      { id: 'c1', nombre: 'Curso Prueba A', grado: '10°' },
      { id: 'c2', nombre: 'Curso Prueba B', grado: '11°' }
    ],
    materiasAsignadas: [
      { id: 'm1', nombre: 'Matemáticas', cursoNombre: 'Curso Prueba A' },
      { id: 'm2', nombre: 'Historia', cursoNombre: 'Curso Prueba A' },
      { id: 'm4', nombre: 'Química', cursoNombre: 'Curso Prueba B' }
    ]
  };

  return fakeAcudienteData;
}
