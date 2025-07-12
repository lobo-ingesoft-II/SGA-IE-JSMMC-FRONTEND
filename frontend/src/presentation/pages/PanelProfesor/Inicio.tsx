import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  useTheme,
  Stack,
  Chip,
  List,
  ListItem,
  Avatar
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Book as BookIcon,
  LocationOn as LocationOnIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';

import { useNavigate, useParams } from 'react-router-dom';
import { getProfesorInicioData, ProfesorInicioData } from '../../../services/PanelProfesor/inicioService';
import { useAuth } from '../../../context/AuthContext';

const Inicio: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { inicioId } = useParams();
  const { user } = useAuth();

  const [profesorData, setProfesorData] = useState<ProfesorInicioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && String(inicioId) !== String(user.id)) {
      navigate(`/PanelProfesor/${user.id}/Inicio`, { replace: true });
    }
  }, [inicioId, user, navigate]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const data = await getProfesorInicioData();
        setProfesorData(data);
      } catch (err: any) {
        // Error al cargar los datos del profesor
        setError('No se pudo cargar la información del profesor.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Cargando información principal...
        </Typography>
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

  if (!profesorData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6" color="text.secondary">
          No hay datos de profesor disponibles.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <DashboardIcon sx={{ mr: 1 }} />
        Bienvenido al Panel de Docentes, {profesorData.nombre} {profesorData.apellidos}
      </Typography>

      <Grid container spacing={1} sx={{ width: '100%', m: 0 }}>
        {/* Información Personal */}
        <Box sx={{ width: '100%', p: 1.5 }}>
          <Paper
            elevation={2}
            sx={{
              mb: 2,
              borderRadius: 3,
              overflow: 'hidden',
              borderLeft: `4px solid ${theme.palette.primary.main}`
            }}
          >
            <Box sx={{ p: 2, backgroundColor: theme.palette.action.selected }}>
              <Typography variant="h5" component="h3" sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Información Personal
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: theme.palette.secondary.main, mr: 2 }}>
                    {profesorData.nombre.charAt(0)}
                  </Avatar>
                  <Typography variant="subtitle1">
                    <strong>ID:</strong> {profesorData.id}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="subtitle1">
                    <strong>Email:</strong> {profesorData.correo}
                  </Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="subtitle1">
                    <strong>Rol:</strong> {profesorData.rol}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Paper>
        </Box>

        {/* Asignaciones */}
        <Box sx={{ width: '100%', p: 1.5 }}>
          <Paper
            elevation={2}
            sx={{
              mb: 2,
              borderRadius: 3,
              overflow: 'hidden',
              borderLeft: `4px solid ${theme.palette.secondary.main}`
            }}
          >
            <Box sx={{ p: 2, backgroundColor: theme.palette.action.selected }}>
              <Typography variant="h5" component="h3" sx={{ display: 'flex', alignItems: 'center' }}>
                <SchoolIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Tus Asignaciones
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mt: 2, mb: 1, color: theme.palette.primary.main, fontWeight: 600 }}>
                Sedes Asignadas:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {profesorData.sedesAsignadas.length > 0 ? (
                  profesorData.sedesAsignadas.map((sede) => (
                    <Chip
                      key={sede.id}
                      icon={<LocationOnIcon />}
                      label={sede.nombre}
                      color="info"
                      variant="outlined"
                      size="medium"
                      clickable
                      onClick={() => navigate(`/PanelProfesor/${user?.id}/Sedes/${sede.id}`)}
                      sx={{ 
                        mb: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: theme.palette.info.light,
                          color: theme.palette.info.contrastText
                        }
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No hay sedes asignadas.
                  </Typography>
                )}
              </Stack>

              <Typography variant="h6" sx={{ mt: 3, mb: 1, color: theme.palette.primary.main, fontWeight: 600 }}>
                Cursos Asignados:
              </Typography>
              <List dense disablePadding sx={{ backgroundColor: theme.palette.grey[50], borderRadius: 1, p: 1 }}>
                {profesorData.cursosAsignados.length > 0 ? (
                  profesorData.cursosAsignados.map((curso) => (
                    <ListItem 
                      key={curso.id} 
                      disableGutters 
                      sx={{ 
                        px: 1, 
                        py: 0.5,
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: theme.palette.primary.light,
                          color: theme.palette.primary.contrastText
                        }
                      }}
                      onClick={() => navigate(`/PanelProfesor/${user?.id}/Cursos/${curso.id}`)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <SchoolIcon fontSize="small" color="primary" style={{ marginRight: 8 }} />
                        <Typography variant="body2" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <strong>{curso.nombre}</strong> - {curso.grado}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', p: 1 }}>
                    No hay cursos asignados.
                  </Typography>
                )}
              </List>

              <Typography variant="h6" sx={{ mt: 3, mb: 1, color: theme.palette.primary.main, fontWeight: 600 }}>
                Asignaturas Asignadas:
              </Typography>
              <List dense disablePadding sx={{ backgroundColor: theme.palette.grey[50], borderRadius: 1, p: 1 }}>
                {profesorData.materiasAsignadas.length > 0 ? (
                  profesorData.materiasAsignadas.map((materia) => (
                    <ListItem 
                      key={materia.id} 
                      disableGutters 
                      sx={{ 
                        px: 1, 
                        py: 0.5,
                        borderRadius: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: theme.palette.secondary.light,
                          color: theme.palette.secondary.contrastText
                        }
                      }}
                      onClick={() => navigate(`/PanelProfesor/${user?.id}/Asignatura/${materia.id}`)}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <BookIcon fontSize="small" color="secondary" style={{ marginRight: 8 }} />
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {materia.nombre}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Docente: {materia.docente}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', p: 1 }}>
                    No hay materias asignadas.
                  </Typography>
                )}
              </List>
            </Box>
          </Paper>
        </Box>
      </Grid>
    </Box>
  );
};

export default Inicio;
