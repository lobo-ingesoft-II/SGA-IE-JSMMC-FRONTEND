import { ReactElement } from 'react';
import VistaUsuarios from '../../components/sections/dashboard/PanelAdministrador/Usuarios/vistaUsuarios';

const Usuarios = (): ReactElement | null => {
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
      <VistaUsuarios />
    </div>
  );
};

export default Usuarios;