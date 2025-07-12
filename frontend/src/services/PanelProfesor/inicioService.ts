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

export async function getProfesorInicioData(): Promise<ProfesorInicioData> {
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
    throw new Error('Error al obtener materias asignadas: ' + (error as Error).message);
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
