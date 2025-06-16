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
import { useAuth } from '../../../context/authContext';

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
        console.error('Error al cargar los datos del profesor:', err);
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
        Bienvenido al Panel de Profesor, {profesorData.nombre} {profesorData.apellidos}
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
              <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
                Sedes Asignadas:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {profesorData.sedesAsignadas.length > 0 ? (
                  profesorData.sedesAsignadas.map((sede) => (
                    <Chip
                      key={sede.id}
                      icon={<LocationOnIcon />}
                      label={sede.nombre}
                      color="info"
                      variant="outlined"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Ninguna sede asignada.
                  </Typography>
                )}
              </Stack>

              <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
                Cursos Asignados:
              </Typography>
              <List dense disablePadding sx={{ alignItems: 'center' }}>
                {profesorData.cursosAsignados.length > 0 ? (
                  profesorData.cursosAsignados.map((curso) => (
                    <ListItem key={curso.id} disableGutters sx={{ px: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <SchoolIcon fontSize="small" color="primary" style={{ marginRight: 8 }} />
                        <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {`${curso.nombre} (${curso.grado})`}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Ningún curso asignado.
                  </Typography>
                )}
              </List>

              <Typography variant="h5" sx={{ mt: 2, mb: 1 }}>
                Materias Asignadas:
              </Typography>
              <List dense disablePadding>
                {profesorData.materiasAsignadas.length > 0 ? (
                  profesorData.materiasAsignadas.map((materia) => (
                    <ListItem key={materia.id} disableGutters sx={{ px: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                        <BookIcon fontSize="small" color="secondary" style={{ marginRight: 8 }} />
                        <Typography variant="subtitle2" sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {`${materia.nombre} (${materia.cursoNombre})`}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Ninguna materia asignada.
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
