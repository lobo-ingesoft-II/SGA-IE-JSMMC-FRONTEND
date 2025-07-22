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

export interface Sede {
  id_sede: number;
  nombre: string;
  direccion: string;
  telefono: string;
}

export interface Curso {
  id_curso: number;
  nombre: string;
  grado: string;
  anio_lectivo: number;
  id_sede: number;
  director_profesor: number;
}

export interface AdminInicioData {
  id: string;
  nombre: string;
  apellidos: string;
  correo: string;
  rol: string;
  sedes: Sede[];
}

export async function getAdminInicioData(): Promise<ProfesorInicioData> {
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

export async function getAllSedes(): Promise<Sede[]> {
  const response = await fetch('http://localhost:8000/sedes/', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('No se pudieron obtener las sedes');
  }

  return await response.json();
}

export async function getCursosBySede(idSede: number): Promise<Curso[]> {
  const response = await fetch(`http://localhost:8004/cursos/sede/${idSede}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`No se pudieron obtener los cursos de la sede ${idSede}`);
  }

  return await response.json();
}

export async function getAdminDashboardData(): Promise<AdminInicioData> {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!token || !user.id) {
    throw new Error('No hay sesión activa');
  }

  const sedes = await getAllSedes();

  return {
    id: user.id.toString(),
    nombre: user.nombres || 'Administrador',
    apellidos: user.apellidos || '',
    correo: user.email || '',
    rol: user.role || 'administrador',
    sedes
  };
}
