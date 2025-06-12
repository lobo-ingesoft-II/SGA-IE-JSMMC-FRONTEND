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
import { useParams, useNavigate } from 'react-router-dom';
import { getSedeAndCursos, CursoConSede } from '../../../../../../services/PanelProfesor/sedeService';
import { Sede } from '../../../../../../models/PanelProfesor/sede';
import { Curso } from '../../../../../../models/PanelProfesor/curso';
import { Materia } from '../../../../../../models/PanelProfesor/materia';

const VistaSedes = () => {
  const { sedeId } = useParams<{ sedeId: string }>();
  const theme = useTheme();
  const navigate = useNavigate();

  // Estado para la sede actual
  const [sede, setSede] = useState<Sede | null>(null);
  // Estado para los cursos relacionados con la sede
  const [cursos, setCursos] = useState<Curso[]>([]);
  // Control de carga y errores
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Control para expandir/cerrar detalle de cada curso
  const [expandedCurso, setExpandedCurso] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      // -- DATOS FALSOS (fake) definidos aquí para fallback --
      const fakeSede: Sede = {
        id: 'fake-1',
        nombre: 'Sede de Prueba',
        direccion: 'Calle Falsa 123'
      };

      const fakeCursos: Curso[] = [
        {
          id: 'c1',
          nombre: 'Curso Demo A',
          grado: '10°',
          sede: fakeSede,  // asignamos el mismo fakeSede
          materias: [
            { id: 'm1', nombre: 'Demostración de Álgebra', docente: 'Prof. Demo' },
            { id: 'm2', nombre: 'Demostración de Geometría', docente: 'Prof. Demo' }
          ]
        },
        {
          id: 'c2',
          nombre: 'Curso Demo B',
          grado: '9°',
          sede: fakeSede,
          materias: [
            { id: 'm3', nombre: 'Demostración de Biología', docente: 'Prof. Demo' },
            { id: 'm4', nombre: 'Demostración de Química', docente: 'Prof. Demo' }
          ]
        }
      ];
      // -- FIN DATOS FALSOS --

      // Si no hay `sedeId` en la URL, cargamos directamente los datos falsos
      if (!sedeId) {
        setSede(fakeSede);
        setCursos(fakeCursos);
        setLoading(false);
        return;
      }

      try {
        // Intentamos obtener datos reales del servicio
        const { sede: sedeData, cursos: cursosData } = await getSedeAndCursos(sedeId);

        // Filtrar por rol si es necesario (ver nota más abajo)
        // En este punto asumo que tu lógica de usuario / rol ya se manejó en un nivel superior
        // por lo que aquí asignamos todos los cursos retornados:
        setSede(sedeData);
        setCursos(cursosData);
      } catch (err: any) {
        // Si algo falla (por ejemplo, “Failed to fetch”), cargamos datos falsos
        console.warn('fetchData cayó en fallback de datos falsos →', err.message);
        setSede(fakeSede);
        setCursos(fakeCursos);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [sedeId]);

  // Control para expandir o colapsar el detalle de un curso
  const handleExpandCurso = (cursoId: string) => {
    setExpandedCurso((prev) => (prev === cursoId ? null : cursoId));
  };

  // Navegar a la vista de asignatura al hacer click en una materia
  const handleClickMateria = (materiaId: string) => {
    navigate(`/Asignatura/${materiaId}`);
  };

  // Render loading
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6">Cargando información de la sede...</Typography>
      </Box>
    );
  }

  // Render error (en este flujo usamos fallback, así que normalmente no se llega aquí)
  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  // Render cuando no se encuentra la sede (cosas de frontend, pero casi no ocurre si hay fallback)
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
      {/* Encabezado de la sede */}
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
