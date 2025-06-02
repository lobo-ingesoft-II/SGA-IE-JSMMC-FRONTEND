import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Divider, 
  Stack, 
  Chip,
  IconButton,
  Collapse,
  useTheme
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  School as SchoolIcon,
  Book as BookIcon,
  Place as PlaceIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../../../../../../context/authContext';

interface Sede {
  id: string;
  nombre: string;
  direccion: string;
  imagen?: string;
}

interface Curso {
  id: string;
  nombre: string;
  grado: string;
  jornada: string;
  materias: Materia[];
}

interface Materia {
  id: string;
  nombre: string;
  horario: string;
  docente?: string;
}

const PanelSede = () => {
  const { sedeId } = useParams();
  const { user } = useAuth();
  const theme = useTheme();
  
  const [sede, setSede] = useState<Sede | null>(null);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCurso, setExpandedCurso] = useState<string | null>(null);

  // Simulación de datos desde el backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Datos de ejemplo (simulando respuesta del backend)
        const sedeData: Sede = {
          id: sedeId || '1',
          nombre: 'Sede Principal',
          direccion: 'Calle 123 #45-67, Bogotá',
          imagen: '/sede-principal.jpg'
        };

        const cursosData: Curso[] = [
          {
            id: '1',
            nombre: 'Matemáticas Avanzadas',
            grado: '10°',
            jornada: 'Mañana',
            materias: [
              { id: '1', nombre: 'Álgebra', horario: 'Lunes 8:00-10:00', docente: 'Prof. García' },
              { id: '2', nombre: 'Geometría', horario: 'Miércoles 8:00-10:00', docente: 'Prof. Rodríguez' }
            ]
          },
          {
            id: '2',
            nombre: 'Ciencias Naturales',
            grado: '9°',
            jornada: 'Tarde',
            materias: [
              { id: '3', nombre: 'Biología', horario: 'Martes 14:00-16:00', docente: 'Prof. Martínez' },
              { id: '4', nombre: 'Química', horario: 'Jueves 14:00-16:00', docente: 'Prof. López' }
            ]
          }
        ];

        setSede(sedeData);
        setCursos(cursosData.filter(curso => 
          // Filtro simulado según el usuario
          user?.role === 'admin' || 
          curso.materias.some(m => m.docente === user?.name)
        ));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sedeId, user]);

  const handleExpandCurso = (cursoId: string) => {
    setExpandedCurso(expandedCurso === cursoId ? null : cursoId);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6">Cargando información de la sede...</Typography>
      </Box>
    );
  }

  if (!sede) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6" color="error">Sede no encontrada</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Encabezado de la sede */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Stack direction="row" spacing={3} alignItems="center">
          <Avatar
            src={sede.imagen}
            sx={{ 
              width: 100, 
              height: 100,
              bgcolor: theme.palette.primary.main,
              fontSize: 40
            }}
          >
            {sede.nombre.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {sede.nombre}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <PlaceIcon color="action" />
              <Typography variant="body1" color="text.secondary">
                {sede.direccion}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Sección de Cursos */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2 }}>
        <SchoolIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Cursos Asignados
      </Typography>

      {cursos.length === 0 ? (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="body1" color="text.secondary">
            No tienes cursos asignados en esta sede.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ mb: 4 }}>
          {cursos.map((curso) => (
            <Paper 
              key={curso.id} 
              elevation={2} 
              sx={{ 
                mb: 2, 
                borderRadius: 3,
                overflow: 'hidden',
                borderLeft: `4px solid ${theme.palette.primary.main}`
              }}
            >
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  backgroundColor: expandedCurso === curso.id ? 
                    theme.palette.action.selected : 'inherit',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover
                  }
                }}
                onClick={() => handleExpandCurso(curso.id)}
              >
                <Box>
                  <Typography variant="h6" component="h3">
                    {curso.nombre}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip 
                      label={curso.grado} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                    <Chip 
                      label={curso.jornada} 
                      size="small" 
                      color="secondary" 
                      variant="outlined" 
                    />
                    <Chip 
                      label={`${curso.materias.length} materias`} 
                      size="small" 
                    />
                  </Stack>
                </Box>
                <IconButton>
                  {expandedCurso === curso.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              <Collapse in={expandedCurso === curso.id}>
                <Divider />
                <Box sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    <BookIcon sx={{ mr: 1, fontSize: '1rem' }} />
                    Materias del curso
                  </Typography>

                  <Box sx={{ 
                    display: 'grid', 
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                    gap: 2 
                  }}>
                    {curso.materias.map((materia) => (
                      <Paper 
                        key={materia.id} 
                        elevation={1} 
                        sx={{ 
                          p: 2,
                          borderRadius: 2,
                          borderLeft: `3px solid ${theme.palette.secondary.main}`,
                          '&:hover': {
                            boxShadow: theme.shadows[3]
                          }
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          {materia.nombre}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {materia.horario}
                        </Typography>
                        {materia.docente && (
                          <Typography variant="caption" display="block">
                            Docente: {materia.docente}
                          </Typography>
                        )}
                      </Paper>
                    ))}
                  </Box>
                </Box>
              </Collapse>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PanelSede;