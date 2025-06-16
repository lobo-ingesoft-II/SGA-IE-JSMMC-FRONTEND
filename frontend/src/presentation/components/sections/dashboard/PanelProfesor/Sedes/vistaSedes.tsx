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
  Book as BookIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { getSedeAndCursos, CursoConSede } from '../../../../../../services/PanelProfesor/sedeService';
import { Sede } from '../../../../../../models/PanelProfesor/sede';

const VistaSedes = () => {
  const { sedeId } = useParams<{ sedeId: string }>();
  const theme = useTheme();
  const navigate = useNavigate();

  const [sede, setSede] = useState<Sede | null>(null);
  const [cursos, setCursos] = useState<CursoConSede[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCurso, setExpandedCurso] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const { sede: sedeData, cursos: cursosData } = await getSedeAndCursos(sedeId || '');
        setSede(sedeData);
        setCursos(cursosData);
      } catch (err: any) {
        console.warn('Error al cargar los datos de la sede:', err.message);
        setError('No se pudo cargar la información de la sede');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [sedeId]);

  const handleExpandCurso = (cursoId: string) => {
    setExpandedCurso((prev) => (prev === cursoId ? null : cursoId));
  };

  const handleClickMateria = (materiaId: string) => {
    navigate(`/Asignatura/${materiaId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6">Cargando información de la sede...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (!sede) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6" color="error">
          Sede no encontrada
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Stack direction="row" spacing={3} alignItems="center">
          <Avatar
            sx={{ width: 100, height: 100, bgcolor: theme.palette.primary.main, fontSize: 40 }}
          >
            {sede.nombre.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {sede.nombre}
            </Typography>
          </Box>
        </Stack>
      </Paper>

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
                  backgroundColor:
                    expandedCurso === curso.id ? theme.palette.action.selected : 'inherit',
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
                    <Chip label={curso.grado} size="small" color="primary" variant="outlined" />
                    <Chip label={`Año lectivo: ${curso.anioLectivo || 'N/D'}`} size="small" color="secondary" />
                    <Chip label={`${curso.materias.length} materias`} size="small" />
                  </Stack>
                </Box>
                <IconButton>
                  {expandedCurso === curso.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>

              <Collapse in={expandedCurso === curso.id}>
                <Divider />
                <Box sx={{ p: 2 }}>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ display: 'flex', alignItems: 'center' }}
                  >
                    <BookIcon sx={{ mr: 1, fontSize: '1rem' }} />
                    Materias del curso
                  </Typography>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)'
                      },
                      gap: 2
                    }}
                  >
                    {curso.materias.map((materia) => (
                      <Paper
                        key={materia.id}
                        elevation={1}
                        onClick={() => handleClickMateria(materia.id)}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          cursor: 'pointer',
                          borderLeft: `3px solid ${theme.palette.secondary.main}`,
                          '&:hover': {
                            boxShadow: theme.shadows[3]
                          }
                        }}
                      >
                        <Typography variant="subtitle2" gutterBottom>
                          {materia.nombre}
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

export default VistaSedes;
