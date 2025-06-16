import { Sede } from '../../models/PanelProfesor/sede';
import { Curso } from '../../models/PanelProfesor/curso';

export interface CursoConSede extends Curso {
  sede: Sede;
}

export async function getSedeAndCursos(
  sedeId: string
): Promise<{ sede: Sede; cursos: CursoConSede[] }> {
  let sede: Sede;

  // Intentar cargar la sede
  try {
    const sedeRes = await fetch(`http://localhost:8007/sedes/${sedeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!sedeRes.ok) {
      throw new Error(`No se pudo obtener la sede. Status ${sedeRes.status}`);
    }

    const sedeRaw = await sedeRes.json();

    sede = {
      id: sedeRaw.id_sede,
      nombre: sedeRaw.nombre,
    };

    console.log(`✅ URL llamada: http://localhost:8007/sedes/${sedeId}`);
    console.log('✅ Sede recibida:', sede);
  } catch (error: any) {
    console.error('❌ Error al obtener la sede →', error.message);
    return {
      sede: {
        id: sedeId,
        nombre: 'Nombre no disponible',
      },
      cursos: []
    };
  }

  // Intentar cargar los cursos
  try {
    const cursosRes = await fetch(`http://localhost:8007/sedes/${sedeId}/cursos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!cursosRes.ok) {
      throw new Error(`No se pudo obtener los cursos. Status ${cursosRes.status}`);
    }

    const cursosRaw = await cursosRes.json();

    const cursos: CursoConSede[] = cursosRaw.map((c: any) => ({
      id: c.id_curso,
      nombre: c.nombre,
      grado: c.grado,
      sede,
      materias: (c.materias || []).map((m: any) => ({
        id: m.id,
        nombre: m.nombre,
        docente: m.docente
      }))
    }));

    console.log('✅ Cursos recibidos:', cursos);
    return { sede, cursos };

  } catch (error: any) {
    console.warn('⚠️ No se pudieron cargar los cursos, usando datos de ejemplo →', error.message);

    const fakeCursos: CursoConSede[] = [
      {
        id: 'c1',
        nombre: 'Curso Demo A',
        grado: '10°',
        sede,
        materias: [
          { id: 'm1', nombre: 'Matemáticas', docente: 'Prof. Demo' },
          { id: 'm2', nombre: 'Historia', docente: 'Prof. Demo' }
        ]
      }
    ];

    return { sede, cursos: fakeCursos };
  }
}
