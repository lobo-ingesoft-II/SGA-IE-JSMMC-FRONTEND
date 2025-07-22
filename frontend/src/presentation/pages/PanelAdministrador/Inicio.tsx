import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  useTheme,
  Stack,
  List,
  ListItem,
  Avatar,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  LocationOn as LocationOnIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { getAdminDashboardData, AdminInicioData } from '../../../services/PanelAdministrador/inicioService';
import { useAuth } from '../../../context/AuthContext';

const Inicio: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { inicioId } = useParams();
  const [adminData, setAdminData] = useState<AdminInicioData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && inicioId && String(inicioId) !== String(user.id)) {
      navigate(`/PanelAdministrador/${user.id}/Inicio`, { replace: true });
    }
  }, [inicioId, user, navigate]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const data = await getAdminDashboardData();
        setAdminData(data);
      } catch (err: any) {
        setError('No se pudo cargar la información del administrador.');
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
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando información principal...</Typography>
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

  if (!adminData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6" color="text.secondary">No hay datos de administrador disponibles.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, width: '100%' }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <DashboardIcon sx={{ mr: 1 }} />
Bienvenido al Panel Administrativo, {adminData.nombre}
      </Typography>

      <Grid container spacing={1} sx={{ width: '100%', m: 0 }}>
        <Box sx={{ width: '100%', p: 1.5 }}>
          <Paper
            elevation={2}
            sx={{
              mb: 2,
              borderRadius: 3,
              overflow: 'hidden',
              borderLeft: `4px solid ${theme.palette.primary.main}`,
            }}
          >
            <Box sx={{ p: 2, backgroundColor: theme.palette.action.selected, width: '100%' }}>
              <Typography variant="h5" component="h3" sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Información Personal
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Box display="flex" alignItems="center">
                  <Avatar sx={{ bgcolor: theme.palette.secondary.main, mr: 2 }}>{adminData.nombre.charAt(0)}</Avatar>
                  <Typography variant="subtitle1"><strong>ID:</strong> {adminData.id}</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="subtitle1"><strong>Email:</strong> {adminData.correo}</Typography>
                </Box>
                <Box display="flex" alignItems="center">
                  <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="subtitle1"><strong>Rol:</strong> {adminData.rol}</Typography>
                </Box>
              </Stack>
            </Box>
          </Paper>
        </Box>

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
                Sedes de la Institución
              </Typography>
            </Box>
            <Box sx={{ p: 3 }}>

              <List dense disablePadding sx={{ backgroundColor: theme.palette.grey[50], borderRadius: 1, p: 1 }}>
                {adminData.sedes.length > 0 ? (
                  adminData.sedes.map((sede, index) => (
                    <Box key={sede.id_sede}>
                      <ListItem
                        disableGutters
                        sx={{
                          px: 1,
                          py: 1.5,
                          borderRadius: 1,
                          cursor: 'pointer',
                          backgroundColor: theme.palette.grey[100],
                          mb: 0.5,
                          borderBottom: index < adminData.sedes.length - 1 ? `1px solid ${theme.palette.grey[300]}` : 'none',
                          '&:hover': {
                            backgroundColor: theme.palette.primary.light,
                            color: theme.palette.primary.contrastText
                          }
                        }}
                        onClick={() => navigate(`/PanelAdministrador/${user?.id}/Sedes/${sede.id_sede}`)}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocationOnIcon fontSize="small" color="primary" style={{ marginRight: 8 }} />
                            <Box>
                              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                {sede.nombre}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {sede.direccion} {sede.telefono}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </ListItem>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', p: 1 }}>
                    No hay sedes disponibles.
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
