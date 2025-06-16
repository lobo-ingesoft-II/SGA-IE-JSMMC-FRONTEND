export interface ProfesorInicioData {
  id: string;
  nombre: string;
  apellidos: string;
  correo: string;
  rol: string;
  sedesAsignadas: { id: string; nombre: string }[];
  cursosAsignados: { id: string; nombre: string; grado: string }[];
  materiasAsignadas: { id: string; nombre: string; cursoNombre: string }[];
}

export async function getProfesorInicioData(): Promise<ProfesorInicioData> {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token || !user.id) {
    throw new Error('No hay sesión activa');
  }

  const userId = parseInt(user.id, 10);

  // 1. Obtener todos los usuarios
  const allUsersRes = await fetch('http://localhost:8009/getUsers', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!allUsersRes.ok) {
    throw new Error('No se pudieron obtener los usuarios');
  }

  const allUsers = await allUsersRes.json();

  // 2. Buscar usuario actual por ID
  const currentUser = allUsers.find((u: any) => u.id_usuario === userId);

  if (!currentUser) {
    throw new Error('Usuario no encontrado por ID');
  }

  // 3. Obtener sedes asignadas
  const sedesRes = await fetch('http://localhost:8007/sedes/', {
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
  const profesorId = user.id_profesor || 2;

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

  // 5. Materias simuladas (puedes conectar tu API cuando esté lista)
  const materiasAsignadas = [
    { id: 'm1', nombre: 'Matemáticas', cursoNombre: 'Curso Prueba A' },
    { id: 'm2', nombre: 'Historia', cursoNombre: 'Curso Prueba A' },
    { id: 'm4', nombre: 'Química', cursoNombre: 'Curso Prueba B' }
  ];

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
