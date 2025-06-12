// frontend/src/presentation/pages/PanelProfesor/Inicio.tsx

import React, { useState, useEffect } from 'react';
import {
  Box, // Asegúrate que Box esté importado
  Typography,
  Paper,
  Grid, // Grid se sigue usando para el contenedor principal si aplica
  CircularProgress,
  useTheme,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  Book as BookIcon,
  LocationOn as LocationOnIcon,
  Dashboard as DashboardIcon // Icono para el Dashboard o Inicio
} from '@mui/icons-material';

// Importa el nuevo servicio
import { getProfesorInicioData, ProfesorInicioData } from '../../../services/PanelProfesor/inicioService';

const Inicio: React.FC = () => {
  const theme = useTheme();
  const [profesorData, setProfesorData] = useState<ProfesorInicioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, []); // El array vacío asegura que se ejecuta solo una vez al montar

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

  if (!profesorData) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6" color="text.secondary">No hay datos de profesor disponibles.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
        <DashboardIcon sx={{ mr: 1 }} />
        Bienvenido al Panel de Profesor, {profesorData.nombre}
      </Typography>

      {/* Usamos Box para los ítems del grid, replicando el comportamiento de Grid item */}
      {/* El contenedor principal sigue siendo Grid container para mantener la estructura */}
      <Grid container spacing={3}>
        {/* Tarjeta de Información Personal */}
        {/* MODIFICADO: Reemplazado Grid item por Box. xs={12} md={6} se traduce a flexBasis y maxWidth en sx */}
        <Box sx={{ flexBasis: { xs: '100%', md: '50%' }, maxWidth: { xs: '100%', md: '50%' }, p: 1.5 }}> {/* p:1.5 para compensar el spacing del Grid container */}
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom sx={{ borderBottom: `2px solid ${theme.palette.divider}`, pb: 1, mb: 2 }}>
              <PersonIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Información Personal
            </Typography>
            <Stack spacing={1}>
              <Box display="flex" alignItems="center">
                <Avatar sx={{ bgcolor: theme.palette.secondary.main, mr: 2 }}>{profesorData.nombre.charAt(0)}</Avatar>
                <Typography variant="body1"><strong>ID:</strong> {profesorData.id}</Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1"><strong>Email:</strong> {profesorData.correo}</Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <WorkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body1"><strong>Rol:</strong> {profesorData.rol}</Typography>
              </Box>
            </Stack>
          </Paper>
        </Box>

        {/* Tarjeta de Asignaciones */}
        {/* MODIFICADO: Reemplazado Grid item por Box. xs={12} md={6} se traduce a flexBasis y maxWidth en sx */}
        <Box sx={{ flexBasis: { xs: '100%', md: '50%' }, maxWidth: { xs: '100%', md: '50%' }, p: 1.5 }}> {/* p:1.5 para compensar el spacing del Grid container */}
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom sx={{ borderBottom: `2px solid ${theme.palette.divider}`, pb: 1, mb: 2 }}>
              <SchoolIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
              Tus Asignaciones
            </Typography>
            <Box flexGrow={1}>
              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Sedes Asignadas:</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {profesorData.sedesAsignadas.length > 0 ? (
                  profesorData.sedesAsignadas.map(sede => (
                    <Chip key={sede.id} icon={<LocationOnIcon />} label={sede.nombre} color="info" variant="outlined" size="small" sx={{ mb: 1 }} />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">Ninguna sede asignada.</Typography>
                )}
              </Stack>

              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Cursos Asignados:</Typography>
              <List dense disablePadding>
                {profesorData.cursosAsignados.length > 0 ? (
                  profesorData.cursosAsignados.map(curso => (
                    <ListItem key={curso.id} disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}><SchoolIcon fontSize="small" color="primary" /></ListItemIcon>
                      <ListItemText primary={`${curso.nombre} (${curso.grado})`} />
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">Ningún curso asignado.</Typography>
                )}
              </List>

              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>Materias Asignadas:</Typography>
              <List dense disablePadding>
                {profesorData.materiasAsignadas.length > 0 ? (
                  profesorData.materiasAsignadas.map(materia => (
                    <ListItem key={materia.id} disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}><BookIcon fontSize="small" color="secondary" /></ListItemIcon>
                      <ListItemText primary={`${materia.nombre} (${materia.cursoNombre})`} />
                    </ListItem>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">Ninguna materia asignada.</Typography>
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
