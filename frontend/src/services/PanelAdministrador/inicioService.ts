export interface AdminInicioData {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  sedesAsignadas: { id: string; nombre: string }[];
  cursosAsignados: { id: string; nombre: string; grado: string }[];
  materiasAsignadas: { id: string; nombre: string; cursoNombre: string }[];
}

/**
 * Simula la obtención de la información básica del admin para la página de inicio.
 * En una aplicación real, esto haría una llamada API al backend
 * para obtener los datos del admin logueado.
 *
 * @returns {Promise<AdminInicioData>} Una promesa que resuelve con los datos del admin.
 */
export async function getAdminInicioData(): Promise<AdminInicioData> {
  // Simular un retraso de red
  await new Promise(resolve => setTimeout(resolve, 800));

  // Datos de prueba para el admin
  const fakeAdminData: AdminInicioData = {
    id: 'Administrador123',
    nombre: 'Cristian Rodríguez',
    correo: 'cristian.rodriguez@iedjosuemanrique.edu.co',
    rol: 'Administrador',
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

  return fakeAdminData;
}
