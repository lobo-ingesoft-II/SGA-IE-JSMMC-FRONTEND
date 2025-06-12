import { ReactElement, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VistaSedes from '../../components/sections/dashboard/PanelProfesor/Sedes/vistaSedes';
import { useAuth } from '../../../context/authContext';

<<<<<<< Updated upstream
const Sedes = (): ReactElement | null => {
  const { user } = useAuth();
  const navigate = useNavigate();
=======
import { getProfesorInicioData, ProfesorInicioData } from '../../../services//PanelProfesor/inicioService';

const Inicio: React.FC = () => {
  const theme = useTheme();
  const [profesorData, setProfesorData] = useState<ProfesorInicioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
>>>>>>> Stashed changes

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

<<<<<<< Updated upstream
export default Sedes;
=======
export default Inicio;
>>>>>>> Stashed changes
