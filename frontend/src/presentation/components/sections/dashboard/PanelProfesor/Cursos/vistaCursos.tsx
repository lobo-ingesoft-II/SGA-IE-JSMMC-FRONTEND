import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Stack,
  Chip,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  School as SchoolIcon,
  Book as BookIcon,
  Place as PlaceIcon,
  People as PeopleIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

import { getCursoById } from '../../../../../../services/PanelProfesor/cursoService';
import type { CursoConSede } from '../../../../../../services/PanelProfesor/cursoService';

const VistaCursos = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { cursoId } = useParams<{ cursoId: string }>();
  
  const [curso, setCurso] = useState<CursoConSede | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [materias, setMaterias] = useState<any[]>([]);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);
  const [loadingMaterias, setLoadingMaterias] = useState(false);

  // Datos fake para estudiantes
  const fakeEstudiantes = [
    { id: 'e1', nombre: 'Ana Torres', inasistencias: 3 },
    { id: 'e2', nombre: 'Luis Pérez', inasistencias: 1 },
    { id: 'e3', nombre: 'Carlos Sánchez', inasistencias: 0 },
    { id: 'e4', nombre: 'María Gómez', inasistencias: 2 },
    { id: 'e5', nombre: 'Juan Rodríguez', inasistencias: 5 },
    { id: 'e6', nombre: 'Sofía Vargas', inasistencias: 1 }
  ];

  // Datos fake para materias
  const fakeMaterias = [
    { id: 'm1', nombre: 'Matemáticas', docente: 'Prof. García' },
    { id: 'm2', nombre: 'Historia', docente: 'Prof. Díaz' },
    { id: 'm3', nombre: 'Ciencias', docente: 'Prof. López' },
    { id: 'm4', nombre: 'Literatura', docente: 'Prof. Martínez' },
    { id: 'm5', nombre: 'Educación Física', docente: 'Prof. Ramírez' }
  ];

  useEffect(() => {
    async function fetchCurso() {
      setLoading(true);
      setError(null);

      try {
        if (!cursoId) {
          throw new Error("ID de curso no definido");
        }
        
        // Obtener el curso por ID
        const cursoData = await getCursoById(cursoId);
        setCurso(cursoData);
        
        // Simular carga de estudiantes y materias
        setLoadingEstudiantes(true);
        setLoadingMaterias(true);
        
        setTimeout(() => {
          setEstudiantes(fakeEstudiantes);
          setLoadingEstudiantes(false);
        }, 800);
        
        setTimeout(() => {
          setMaterias(fakeMaterias);
          setLoadingMaterias(false);
        }, 1000);
        
      } catch (err: any) {
        setError(`Error al cargar el curso: ${err.message}`);
        console.error('Error fetching curso:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCurso();
  }, [cursoId]);

  const handleClickMateria = (materiaId: string) => {
    // Obtener datos del usuario del localStorage
    const userData = localStorage.getItem('user');
    const userId = userData ? JSON.parse(userData).id : null;
    
    if (userId) {
      navigate(`/PanelProfesor/${userId}/Asignatura/${materiaId}`);
    } else {
      console.error('Usuario no autenticado');
      // Puedes redirigir a login o mostrar un mensaje
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" flexDirection="column">
        <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
        <Typography variant="h6" color="textSecondary">Cargando curso...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Alert severity="error" sx={{ maxWidth: '80%' }}>
          <Typography variant="h6" gutterBottom>Error al cargar el curso</Typography>
          <Typography>{error}</Typography>
          <Typography variant="body2" mt={2}>
            Por favor, intenta recargar la página o contacta al soporte técnico.
          </Typography>
        </Alert>
      </Box>
    );
  }

  if (!curso) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh" flexDirection="column">
        <SchoolIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Curso no encontrado
        </Typography>
        <Typography variant="body1" color="text.secondary">
          El curso solicitado no existe o no está disponible.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ 
        mb: 3, 
        display: 'flex', 
        alignItems: 'center',
        fontWeight: 600,
        color: theme.palette.primary.dark
      }}>
        <SchoolIcon sx={{ fontSize: 36, mr: 2, color: theme.palette.primary.main }} />
        Grado {curso.grado}
      </Typography>

      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default,
          mb: 4
        }}
      >
        <Box
          sx={{
            p: 3,
            backgroundColor: theme.palette.primary.light,
            background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
            color: theme.palette.primary.contrastText
          }}
        >
          <Typography variant="h5" component="h2" sx={{ fontWeight: 700, mb: 1 }}>
            {curso.nombre}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            <Chip
              label={curso.sede.nombre}
              size="medium"
              icon={<PlaceIcon fontSize="small" />}
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                color: 'white',
                fontWeight: 500 
              }}
            />
            <Chip
              label={curso.grado}
              size="medium"
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                color: 'white',
                fontWeight: 500 
              }}
            />
            <Chip
              label={`Año lectivo: ${curso.anioLectivo}`}
              size="medium"
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                color: 'white',
                fontWeight: 500 
              }}
            />
          </Stack>
        </Box>

        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ 
            mb: 2, 
            display: 'flex', 
            alignItems: 'center',
            fontWeight: 600,
            color: theme.palette.primary.main
          }}>
            <BookIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
            Materias del curso
          </Typography>

          {loadingMaterias ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : materias.length === 0 ? (
            <Box sx={{ 
              p: 3, 
              backgroundColor: theme.palette.grey[100], 
              borderRadius: 2,
              textAlign: 'center'
            }}>
              <Typography variant="body1" color="text.secondary">
                No hay materias asignadas a este curso.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                  lg: 'repeat(4, 1fr)'
                },
                gap: 3
              }}
            >
              {materias.map((materia: any) => (
                <Paper
                  key={materia.id}
                  elevation={2}
                  onClick={() => handleClickMateria(materia.id)}
                  sx={{
                    p: 2.5,
                    borderRadius: 2,
                    cursor: 'pointer',
                    borderTop: `4px solid ${theme.palette.secondary.main}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: theme.shadows[6],
                      backgroundColor: theme.palette.primary.light,
                      borderColor: theme.palette.primary.dark,
                      '& .materia-title': {
                        color: theme.palette.primary.contrastText
                      },
                      '& .materia-docente': {
                        color: theme.palette.primary.contrastText
                      }
                    }
                  }}
                >
                  <Typography 
                    variant="subtitle1" 
                    className="materia-title"
                    gutterBottom 
                    sx={{ 
                      fontWeight: 600,
                      color: theme.palette.text.primary
                    }}
                  >
                    {materia.nombre}
                  </Typography>
                  {materia.docente && (
                    <Typography 
                      variant="body2" 
                      className="materia-docente"
                      sx={{ 
                        color: theme.palette.text.secondary,
                        fontStyle: 'italic'
                      }}
                    >
                      Docente: {materia.docente}
                    </Typography>
                  )}
                </Paper>
              ))}
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ 
            mb: 2, 
            display: 'flex', 
            alignItems: 'center',
            fontWeight: 600,
            color: theme.palette.primary.main
          }}>
            <PeopleIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
            Estudiantes del curso
          </Typography>

          {loadingEstudiantes ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : estudiantes.length === 0 ? (
            <Box sx={{ 
              p: 3, 
              backgroundColor: theme.palette.grey[100], 
              borderRadius: 2,
              textAlign: 'center'
            }}>
              <Typography variant="body1" color="text.secondary">
                No hay estudiantes asignados a este curso.
              </Typography>
            </Box>
          ) : (
            <TableContainer 
              component={Paper} 
              variant="outlined"
              sx={{ borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}
            >
              <Table>
                <TableHead sx={{ backgroundColor: theme.palette.grey[100] }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Nombre del estudiante</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>Inasistencias</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {estudiantes.map((estudiante: any, index: number) => (
                    <TableRow key={estudiante.id} hover>
                      <TableCell sx={{ color: theme.palette.text.secondary }}>{index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body1">{estudiante.nombre}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          ID: {estudiante.id}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={estudiante.inasistencias} 
                          size="small" 
                          variant="outlined"
                          color={estudiante.inasistencias > 5 ? 'error' : 'primary'}
                          sx={{ 
                            minWidth: 40,
                            fontWeight: estudiante.inasistencias > 5 ? 700 : 500 
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default VistaCursos;