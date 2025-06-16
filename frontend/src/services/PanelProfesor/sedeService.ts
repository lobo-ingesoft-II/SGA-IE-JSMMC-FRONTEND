import { Sede } from '../../models/PanelProfesor/sede';
import { Curso } from '../../models/PanelProfesor/curso';

export interface CursoConSede extends Curso {
  sede: Sede;
  anioLectivo: number;
}

export async function getSedeAndCursos(
  sedeId: string
): Promise<{ sede: Sede; cursos: CursoConSede[] }> {
  let sede: Sede;

  // 1. Obtener la sede
  try {
    const sedeRes = await fetch(`http://localhost:8007/sedes/${sedeId}`, {
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

  // 2. Obtener cursos del profesor (ID fijo: 2)
  try {
    const profesorId = 2;

    const cursosRes = await fetch(`http://127.0.0.1:8004/cursos/profesores/${profesorId}/cursos`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!cursosRes.ok) throw new Error(`Cursos status ${cursosRes.status}`);
    const cursosRaw = await cursosRes.json();

    // Logs de diagnóstico
    console.log('📦 Cursos desde la API:', cursosRaw);
    console.log('🏫 ID de sede actual:', sedeId);
    console.log('🏫 IDs de sedes en los cursos:', cursosRaw.map((c: any) => c.id_sede));

    // 3. Filtrar los cursos que pertenecen a esta sede
    const cursos: CursoConSede[] = cursosRaw
      .filter((c: any) => String(c.id_sede) === String(sedeId))
      .map((c: any) => ({
        id: c.id_curso.toString(),
        nombre: c.nombre,
        grado: c.grado,
        anioLectivo: c.anio_lectivo,
        sede,
        materias: [] // ← Se integrará desde otra API más adelante
      }));

    console.log('✅ Cursos filtrados por sede:', cursos);

    return { sede, cursos };
  } catch (error: any) {
    console.error('❌ Error al obtener cursos:', error.message);

    return {
      sede,
      cursos: []
    };
  }
}
