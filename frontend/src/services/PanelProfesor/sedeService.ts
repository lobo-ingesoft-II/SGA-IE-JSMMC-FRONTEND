import { Sede } from '../../models/PanelProfesor/sede';
import { Curso } from '../../models/PanelProfesor/curso';

export interface CursoConSede extends Curso {
  sede: Sede;
  anioLectivo: number;
}

export async function getSedeAndCursos(
  sedeId: string
): Promise<{ sede: Sede; cursos: CursoConSede[] }> {
  // Obtener datos del usuario
  const userDataString = localStorage.getItem('user');
  if (!userDataString) {
    console.error('❌ No se encontraron datos de usuario en localStorage');
    return {
      sede: { id: sedeId, nombre: 'Sede desconocida' },
      cursos: []
    };
  }

  const userData = JSON.parse(userDataString);
  const profesorId = userData.id_profesor;

  if (!profesorId) {
    console.error('❌ No se encontró ID de profesor en userData');
    return {
      sede: { id: sedeId, nombre: 'Sede desconocida' },
      cursos: []
    };
  }

  let sede: Sede;

  // 1. Obtener datos de la sede
  try {
    const sedeRes = await fetch(`http://localhost:8000/sedes/${sedeId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!sedeRes.ok) throw new Error(`Sede status ${sedeRes.status}`);
    const sedeRaw = await sedeRes.json();

    sede = {
      id: sedeRaw.id_sede.toString(),
      nombre: sedeRaw.nombre
    };
  } catch (error: any) {
    console.error('❌ Error al obtener la sede:', error.message);
    return {
      sede: {
        id: sedeId,
        nombre: 'Sede desconocida'
      },
      cursos: []
    };
  }

  // 2. Obtener cursos del profesor autenticado
  try {
    const cursosRes = await fetch(`http://127.0.0.1:8004/cursos/profesores/${profesorId}/cursos`, {
      method: 'GET',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!cursosRes.ok) throw new Error(`Cursos status ${cursosRes.status}`);
    const cursosRaw = await cursosRes.json();

    // Filtrar cursos por sede
    const cursos: CursoConSede[] = cursosRaw
      .filter((c: any) => String(c.id_sede) === String(sedeId))
      .map((c: any) => ({
        id: c.id_curso.toString(),
        nombre: c.nombre,
        grado: c.grado,
        anioLectivo: c.anio_lectivo,
        sede,
        materias: []
      }));

    return { sede, cursos };
  } catch (error: any) {
    console.error('❌ Error al obtener cursos:', error.message);
    return {
      sede,
      cursos: []
    };
  }
}