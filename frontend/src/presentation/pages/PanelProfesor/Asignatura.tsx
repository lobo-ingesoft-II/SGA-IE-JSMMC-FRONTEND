import { ReactElement } from 'react';
import { useParams } from 'react-router-dom';
import VistaAsignatura from '../../components/sections/dashboard/PanelProfesor/Asignatura/vistaAsignatura';

/**
 * Componente de la página Asignatura.
 * Esta página es un contenedor que recibe el ID de la materia desde la URL
 * y renderiza el componente VistaAsignatura, pasándole ese ID.
 */
const Asignatura = (): ReactElement => {
  // `useParams` hook de react-router-dom para obtener parámetros de la URL.
  // Esperamos que la ruta sea algo como '/PanelProfesor/Asignatura/:materiaId'
  const { materiaId } = useParams<{ materiaId: string }>();

  // Si no hay materiaId en la URL, se podría mostrar un mensaje de error o redirigir.
  if (!materiaId) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>Error: ID de asignatura no proporcionado.</h2>
        <p>Por favor, navegue a una asignatura válida.</p>
      </div>
    );
  }

  return (
    <div style={{
      position: 'absolute',
      top: 100, // Ajustar según la altura header
      left: 0,
      right: 0,
      bottom: 0,
      margin: 0,
      padding: 0,
      overflow: 'auto', // Permite scroll 
    }}>
      {/* Se pasa el materiaId obtenido de la URL a VistaAsignatura */}
      <VistaAsignatura materiaId={materiaId} />
    </div>
  );
};

export default Asignatura;