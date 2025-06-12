import { Observacion } from '../../models/PanelProfesor/observacion';

/**
 * Simula el guardado de una nueva observación en el backend.
 * En un entorno real, esta función haría una llamada POST a tu API.
 *
 * @param observacionData Los datos de la observación a guardar.
 * @returns {Promise<Observacion>} Una promesa que resuelve con la observación guardada (con un ID asignado).
 */
export async function saveObservacion(observacionData: Omit<Observacion, 'id' | 'fechaRegistro'>): Promise<Observacion> {
  console.log('[ObservacionService] Intentando guardar observación:', observacionData);

  // Simular un retraso de red
  await new Promise(resolve => setTimeout(resolve, 700));

  // Generar un ID de prueba y la fecha de registro
  const newObservacion: Observacion = {
    ...observacionData,
    id: `obs_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, // ID único simple
    fechaRegistro: new Date().toISOString().split('T')[0], // Fecha actual de registro
  };

  // En un escenario real, aquí se realizaría la llamada `fetch` o `axios` a tu backend:
  /*
  const response = await fetch('http://localhost:8000/observaciones', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(observacionData),
  });

  if (!response.ok) {
    const errorBody = await response.json();
    throw new Error(`Error al guardar observación: ${errorBody.message || response.statusText}`);
  }

  const savedObservacion = await response.json();
  return savedObservacion;
  */

  console.log('[ObservacionService] Observación simulada guardada:', newObservacion);
  return newObservacion; // Devolver la observación simulada
}

/**
 * Simula la obtención del historial de observaciones para un estudiante y materia.
 * En un entorno real, esto haría una llamada GET a tu API.
 * (Esta función se puede desarrollar más adelante para la vista de historial).
 *
 * @param idEstudiante ID del estudiante.
 * @param idMateria ID de la materia.
 * @returns {Promise<Observacion[]>} Una promesa que resuelve con un array de observaciones.
 */
export async function getObservacionesPorEstudianteYMateria(idEstudiante: string, idMateria: string): Promise<Observacion[]> {
  console.log(`[ObservacionService] Solicitando historial de observaciones para Estudiante ${idEstudiante} en Materia ${idMateria}`);
  await new Promise(resolve => setTimeout(resolve, 500)); // Simular retraso

  // Datos de prueba de historial (puedes expandirlos)
  const fakeHistorial: Observacion[] = [
    {
      id: 'obs_hist_1',
      idEstudiante: idEstudiante,
      idMateria: idMateria,
      idProfesor: 'profesor123',
      fechaIncidente: '2024-05-10',
      tipoFalta: 'Leve',
      articuloManualConvivencia: 'Art. 25, Num. 3',
      descripcion: 'Llegada tarde sin justificación en 2 ocasiones.',
      fechaRegistro: '2024-05-11',
    },
    {
      id: 'obs_hist_2',
      idEstudiante: idEstudiante,
      idMateria: idMateria,
      idProfesor: 'profesor123',
      fechaIncidente: '2024-06-01',
      tipoFalta: 'Grave',
      articuloManualConvivencia: 'Art. 30, Num. 5',
      descripcion: 'Interrumpió la clase con uso inadecuado del celular.',
      fechaRegistro: '2024-06-02',
    },
  ];

  // Filtra por el estudiante y materia para simular la respuesta del backend
  const filteredHistorial = fakeHistorial.filter(
    obs => obs.idEstudiante === idEstudiante && obs.idMateria === idMateria
  );

  return filteredHistorial;
}
