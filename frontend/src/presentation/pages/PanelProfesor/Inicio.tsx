import { ReactElement } from 'react';
import TopSellingProduct from '../../components/sections/dashboard/PanelProfesores/Sedes/vistaSedes/vistaSedes';

const Inicio = (): ReactElement => {
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
      <TopSellingProduct />
    </div>
  );
};

export default Inicio;