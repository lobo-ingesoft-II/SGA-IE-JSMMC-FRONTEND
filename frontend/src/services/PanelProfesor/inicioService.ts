import { getAsignaturasDelProfesor } from './asignaturaService';

export interface ProfesorInicioData {
  id: string;
  nombre: string;
  apellidos: string;
  correo: string;
  rol: string;
  sedesAsignadas: { id: string; nombre: string }[];
  cursosAsignados: { id: string; nombre: string; grado: string }[];
  materiasAsignadas: { id: string; nombre: string; docente: string }[];
}

// Datos de prueba para testing
export const TEST_DATA = {
  profesor: {
    id: '1',
    nombre: 'Test',
    apellidos: 'Profesor',
    correo: 'test@profesor.com',
    rol: 'profesor',
    sedesAsignadas: [
      { id: 'sede1', nombre: 'Sede Principal' },
      { id: 'sede2', nombre: 'Sede Secundaria' }
    ],
    cursosAsignados: [
      { id: 'curso1', nombre: 'Curso 101', grado: '10°' },
      { id: 'curso2', nombre: 'Curso 201', grado: '11°' }
    ],
    materiasAsignadas: [
      { id: 'materia1', nombre: 'Matemáticas', docente: 'Test Profesor' },
      { id: 'materia2', nombre: 'Física', docente: 'Test Profesor' }
    ]
  }
};

/**
 * Obtiene los datos del profesor para la página de inicio
 * @param testMode Si es true, devuelve datos de prueba para testing
 * @returns Datos del profesor
 */
export async function getProfesorInicioData(testMode: boolean = false): Promise<ProfesorInicioData> {
  // Si estamos en modo test, devolver datos de prueba
  if (testMode) {
    return TEST_DATA.profesor;
  }
  
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token || !user.id) {
    throw new Error('No hay sesión activa');
  }

  const userId = parseInt(user.id, 10);

  // Usar la información del usuario desde el contexto/localStorage
  const currentUser = {
    id_usuario: userId,
    nombres: user.nombres || 'Nombre',
    apellidos: user.apellidos || 'No disponible',
    correo: user.email || '',
    email: user.email || '',
    rol: user.role || 'profesor',
  };

  // Obtener sedes asignadas
  const profesorId = user.id_profesor || 2;

  const sedesRes = await fetch(`http://localhost:8000/sedes/por_profesor/${profesorId}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!sedesRes.ok) {
    throw new Error('No se pudieron obtener las sedes');
  }

  const sedesRaw = await sedesRes.json();

  const sedesAsignadas = sedesRaw.map((sede: any) => ({
    id: sede.id_sede.toString(),
    nombre: sede.nombre
  }));

  // 4. Obtener cursos asignados

  const cursosRes = await fetch(`http://localhost:8004/cursos/profesores/${profesorId}/cursos`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!cursosRes.ok) {
    throw new Error('No se pudieron obtener los cursos');
  }

  const cursosRaw = await cursosRes.json();

  const cursosAsignados = cursosRaw.map((c: any) => ({
    id: c.id_curso.toString(),
    nombre: c.nombre,
    grado: c.grado
  }));

  // 5. Obtener materias asignadas usando el mismo servicio que navService
  let materiasAsignadas: { id: string; nombre: string; docente: string }[] = [];
  
  try {
    // Usar la misma función que usa navService.ts
    const asignaturas = await getAsignaturasDelProfesor();
    // Construir el nombre completo del profesor
    const nombreCompletoProfesor = `${currentUser.nombres} ${currentUser.apellidos}`;
    
    materiasAsignadas = asignaturas.map((asignatura) => ({
      id: asignatura.id,
      nombre: asignatura.nombre,
      docente: nombreCompletoProfesor
    }));
  } catch (error) {
    console.error('Error al obtener materias asignadas:', error);
    // Fallback a datos simulados solo en caso de error
    materiasAsignadas = [
      { id: 'm1', nombre: 'Error de carga', docente: 'Sistema' }
    ];
  }

  // 6. Devolver datos finales
  return {
    id: userId.toString(),
    nombre: currentUser.nombres,
    apellidos: currentUser.apellidos,
    correo: currentUser.email,
    rol: currentUser.rol,
    sedesAsignadas,
    cursosAsignados,
    materiasAsignadas
  };
}
