import { ReactElement } from 'react';
import VistaSedes from '../../components/sections/dashboard/PanelAdministrador/Sedes/vistaSedes';

const Sedes = (): ReactElement | null => {
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
      <VistaSedes />
    </div>
  );
};

export default Sedes;