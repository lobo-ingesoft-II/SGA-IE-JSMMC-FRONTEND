import { ReactElement, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VistaSedes from '../../components/sections/dashboard/PanelProfesor/Sedes/vistaSedes';
import { useAuth } from '../../../context/authContext';

const Sedes = (): ReactElement | null => {
  const { user } = useAuth();
  const navigate = useNavigate();

  /*
  useEffect(() => {
    if (!user) {
      // Redirigir al login si no está autenticado
      navigate('/autenticacion/Login'); 
    }
  }, [user, navigate]);

  // Evita renderizar mientras verifica
  if (!user) return null;
  */

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
