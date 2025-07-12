import { ReactElement } from 'react';
import VistaCursos from '../../components/sections/dashboard/PanelProfesor/Cursos/vistaCursos';

const Cursos = (): ReactElement => {
  return (
    <div style={{
      position: 'absolute',
      top: 100,
      left: 0,
      right: 0,
      bottom: 0,
      margin: 0,
      padding: 0,
      overflow: 'auto'
    }}>
      <VistaCursos />
    </div>
  );
};

export default Cursos;