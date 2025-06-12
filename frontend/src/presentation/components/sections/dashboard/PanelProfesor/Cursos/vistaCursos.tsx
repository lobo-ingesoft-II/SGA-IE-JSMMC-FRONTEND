import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Stack,
  Chip,
  IconButton,
  Collapse,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  School as SchoolIcon,
  Book as BookIcon,
  Place as PlaceIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { Curso } from '../../../../../../models/PanelProfesor/curso';
import { Sede } from '../../../../../../models/PanelProfesor/sede';
import { Materia } from '../../../../../../models/PanelProfesor/materia'; 
import { Estudiante } from '../../../../../../models/PanelProfesor/estudiante'; 
import { getAllCursos } from '../../../../../../services/PanelProfesor/cursoService';
import { getEstudiantesPorCurso } from '../../../../../../services/PanelProfesor/estudianteService'; 

interface CursoConSede extends Curso {
  sede: Sede;
}

const VistaCursos = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [cursos, setCursos] = useState<CursoConSede[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCurso, setExpandedCurso] = useState<string | null>(null);
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [loadingEstudiantes, setLoadingEstudiantes] = useState(false);

  useEffect(() => {
    async function fetchCursos() {
      setLoading(true);
      setError(null);

      try {
        const cursosData: CursoConSede[] = await getAllCursos();
        setCursos(cursosData);

        // Expandir el primer curso por defecto (simula selección previa)
        if (cursosData.length > 0) {
          const selectedCursoId = cursosData[0].id;
          setExpandedCurso(selectedCursoId);
          const estudiantesData = await getEstudiantesPorCurso(selectedCursoId);
          setEstudiantes(estudiantesData);
        }
      } catch (err: any) {
        console.warn('Falló getAllCursos(); usando datos de prueba →', err.message);

        const fakeSede1: Sede = {
          id: 's1',
          nombre: 'Sede Norte',
          direccion: 'Calle Falsa 123'
        };

        const fakeCursos: CursoConSede[] = [
          {
            id: 'c1',
            nombre: 'Curso Prueba A',
            grado: '10°',
            sede: fakeSede1,
            materias: [
              { id: 'm1', nombre: 'Matemáticas', docente: 'Prof. García' },
              { id: 'm2', nombre: 'Historia', docente: 'Prof. Díaz' }
            ]
          }
        ];

        setCursos(fakeCursos);
        setExpandedCurso(fakeCursos[0].id);
        setEstudiantes([
          { id: 'e1', nombre: 'Ana Torres', inasistencias: 3 },
          { id: 'e2', nombre: 'Luis Pérez', inasistencias: 1 }
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchCursos();
  }, []);

  const handleClickMateria = (materiaId: string) => {
    navigate(`/PanelProfesor/Asignatura/${materiaId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6">Cargando cursos...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6" color="error">{error}</Typography>
      </Box>
    );
  }

  if (cursos.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6" color="text.secondary">No hay cursos disponibles.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2 }}>
        <SchoolIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Información del curso
      </Typography>

      <Box sx={{ mb: 4 }}>
        {cursos
          .filter(curso => curso.id === expandedCurso)
          .map(curso => (
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
                  backgroundColor: theme.palette.action.selected
                }}
              >
                <Box>
                  <Typography variant="h6" component="h3">{curso.nombre}</Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    <Chip
                      label={curso.sede.nombre}
                      size="small"
                      icon={<PlaceIcon fontSize="small" />}
                    />
                    <Chip
                      label={curso.grado}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={`${curso.materias.length} materias`}
                      size="small"
                    />
                  </Stack>
                </Box>
              </Box>

              <Divider />
              <Box sx={{ p: 2 }}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <BookIcon sx={{ mr: 1, fontSize: '1rem' }} />
                  Materias del curso ({curso.materias.length})
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
                  {curso.materias.map(materia => (
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

              <Divider sx={{ mt: 3 }} />
              <Box sx={{ p: 2 }}>
                <Typography
                  variant="subtitle1"
                  gutterBottom
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  Estudiantes del curso
                </Typography>

                {loadingEstudiantes ? (
                  <Typography variant="body2">Cargando estudiantes...</Typography>
                ) : estudiantes.length === 0 ? (
                  <Typography variant="body2">No hay estudiantes asignados.</Typography>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Nombre</strong></TableCell>
                          <TableCell><strong>Inasistencias</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {estudiantes.map(est => (
                          <TableRow key={est.id}>
                            <TableCell>{est.nombre}</TableCell>
                            <TableCell>{est.inasistencias}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default VistaCursos;
