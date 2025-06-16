export interface ProfesorInicioData {
  id: string;
  nombre: string;
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

  // 1. Consultar sedes asignadas
  const sedesResponse = await fetch('http://localhost:8007/sedes/', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });

  if (!sedesResponse.ok) {
    throw new Error('No se pudieron obtener las sedes');
  }

  const sedesData: { id_sede: number; nombre: string }[] = await sedesResponse.json();

  const sedesAsignadas = sedesData.map((sede) => ({
    id: sede.id_sede.toString(),
    nombre: sede.nombre
  }));

  // 2. Datos fake para cursos y materias
  const cursosAsignados = [
    { id: 'c1', nombre: 'Curso Prueba A', grado: '10°' },
    { id: 'c2', nombre: 'Curso Prueba B', grado: '11°' }
  ];

  const materiasAsignadas = [
    { id: 'm1', nombre: 'Matemáticas', cursoNombre: 'Curso Prueba A' },
    { id: 'm2', nombre: 'Historia', cursoNombre: 'Curso Prueba A' },
    { id: 'm4', nombre: 'Química', cursoNombre: 'Curso Prueba B' }
  ];

  // 3. Retornar respuesta final
  const profesorData: ProfesorInicioData = {
    id: user.id.toString(),
    nombre: user.name || 'Profesor',
    correo: user.email || '',
    rol: user.rol || 'profesor',
    sedesAsignadas,
    cursosAsignados,
    materiasAsignadas
  };

  return profesorData;
}
