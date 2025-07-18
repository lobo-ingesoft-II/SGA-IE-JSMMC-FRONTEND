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
  useTheme,
  CircularProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  School as SchoolIcon,
  Book as BookIcon,
  LocationOn as LocationOnIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { getSedeData, SedeData, CursoData } from '../../../../../../services/PanelAdministrador/sedeService';
import { getCursosBySede } from '../../../../../../services/PanelAdministrador/inicioService';

interface MateriaData {
  id: string;
  nombre: string;
  docente: string;
}

interface CursoConMaterias extends CursoData {
  materias: MateriaData[];
}

const VistaSedes = () => {
  const { sedeId } = useParams<{ sedeId: string }>();
  const theme = useTheme();

  const [sedeData, setSedeData] = useState<SedeData | null>(null);
  const [cursosConMaterias, setCursosConMaterias] = useState<CursoConMaterias[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCurso, setExpandedCurso] = useState<string | null>(null);
  const [loadingMaterias, setLoadingMaterias] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const data = await getSedeData(sedeId || '');
        setSedeData(data);
        
        // Inicializar cursos sin materias
        const cursosIniciales: CursoConMaterias[] = data.cursos.map(curso => ({
          ...curso,
          materias: []
        }));
        setCursosConMaterias(cursosIniciales);
      } catch (err: any) {
        console.warn('Error al cargar los datos de la sede:', err.message);
        setError('No se pudo cargar la información de la sede');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [sedeId]);

  const handleExpandCurso = async (cursoId: string) => {
    const isExpanded = expandedCurso === cursoId;
    setExpandedCurso(isExpanded ? null : cursoId);
    
    if (!isExpanded) {
      // Verificar si ya tenemos las materias cargadas
      const cursoActual = cursosConMaterias.find(c => c.id === cursoId);
      if (cursoActual && cursoActual.materias.length === 0) {
        setLoadingMaterias(prev => ({ ...prev, [cursoId]: true }));
        try {
          const response = await fetch(`http://localhost:8001/asignacion_asignaturas/asignatura/por_curso/${cursoId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          
          if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
          }
          
          const asignaturas = await response.json();
          const materiasReales: MateriaData[] = asignaturas.map((asignatura: { nombre: string }, index: number) => ({
            id: `${cursoId}_${index + 1}`,
            nombre: asignatura.nombre,
            docente: 'Sin asignar' // Por ahora sin docente específico
          }));
          
          setCursosConMaterias(prev => 
            prev.map(curso => 
              curso.id === cursoId 
                ? { ...curso, materias: materiasReales }
                : curso
            )
          );
        } catch (err) {
          console.error('Error al cargar materias:', err);
          // Fallback con materias vacías
          setCursosConMaterias(prev => 
            prev.map(curso => 
              curso.id === cursoId 
                ? { ...curso, materias: [] }
                : curso
            )
          );
        } finally {
          setLoadingMaterias(prev => ({ ...prev, [cursoId]: false }));
        }
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando información de la sede...</Typography>
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

  if (!sedeData) {
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
            {sedeData.nombre.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {sedeData.nombre}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="body1" color="text.secondary">
                {sedeData.direccion}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {sedeData.telefono}
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </Paper>

      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2 }}>
        <SchoolIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Cursos de la Sede
      </Typography>

      {cursosConMaterias.length === 0 ? (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="body1" color="text.secondary">
            No hay cursos registrados en esta sede.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ mb: 4 }}>
          {cursosConMaterias.map((curso) => (
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
                    <Chip label={`Año lectivo: ${curso.anioLectivo}`} size="small" color="secondary" />
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

                  {loadingMaterias[curso.id] ? (
                    <Box display="flex" justifyContent="center" p={2}>
                      <CircularProgress size={24} />
                      <Typography variant="body2" sx={{ ml: 1 }}>Cargando materias...</Typography>
                    </Box>
                  ) : (
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
                  )}
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