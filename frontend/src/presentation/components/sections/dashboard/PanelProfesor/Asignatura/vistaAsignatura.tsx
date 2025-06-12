<<<<<<< Updated upstream
=======
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  useTheme,
  Alert,
  Snackbar,
  Grid,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack
} from '@mui/material';
import {
  School as SchoolIcon,
  Book as BookIcon,
  Place as PlaceIcon,
  Calculate as CalculateIcon,
  CalendarToday as CalendarTodayIcon,
  Save as SaveIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  AddComment as AddCommentIcon,
} from '@mui/icons-material';

import { EstudianteAsignatura } from '../../../../../../models/PanelProfesor/estudianteAsignatura';
import { AsistenciaRegistro } from '../../../../../../models/PanelProfesor/asistencia';
import { CalificacionRegistro } from '../../../../../../models/PanelProfesor/calificacion';
import { MateriaDetalle, getMateriaDetalle, updateAsistencia, updateCalificacion, getProfesorActual, checkIfEditionIsLocked } from '../../../../../../services/PanelProfesor/asignaturaService';
import { saveObservacion, getObservacionesPorEstudianteYMateria } from '../../../../../../services/PanelProfesor/observacionService';

interface VistaAsignaturaProps {
  materiaId: string;
}

const VistaAsignatura: React.FC<VistaAsignaturaProps> = ({ materiaId }) => {
  const theme = useTheme();

  const [materiaDetalle, setMateriaDetalle] = useState<MateriaDetalle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [asistenciaFecha, setAsistenciaFecha] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [profesorActual, setProfesorActual] = useState<{ id: string; nombre: string } | null>(null);
  const [edicionBloqueada, setEdicionBloqueada] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const [estudiantesConCambios, setEstudiantesConCambios] = useState<EstudianteAsignatura[]>([]);

  const [isObservacionModalOpen, setIsObservacionModalOpen] = useState(false);
  const [currentStudentIdForObservacion, setCurrentStudentIdForObservacion] = useState<string | null>(null);
  const [currentStudentNameForObservacion, setCurrentStudentNameForObservacion] = useState<string>('');
  const [observacionFechaIncidente, setObservacionFechaIncidente] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [observacionTipoFalta, setObservacionTipoFalta] = useState<'Leve' | 'Grave' | 'Gravísima'>('Leve');
  const [observacionArticulo, setObservacionArticulo] = useState<string>('');
  const [observacionDescripcion, setObservacionDescripcion] = useState<string>('');


  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const detalle = await getMateriaDetalle(materiaId);
        setMateriaDetalle(detalle);
        setEstudiantesConCambios([...detalle.estudiantes]);

        const profesor = await getProfesorActual();
        setProfesorActual(profesor);

        const locked = await checkIfEditionIsLocked(materiaId, asistenciaFecha);
        setEdicionBloqueada(locked);

      } catch (err: any) {
        console.error('Error al cargar detalles de la materia:', err);
        setError(err.message || 'Error al cargar la información de la asignatura.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [materiaId, asistenciaFecha]);

  const handleAsistenciaChange = useCallback((
    estudianteId: string,
    nuevoEstado: 'Presente' | 'Ausente' | 'Justificado'
  ) => {
    if (edicionBloqueada || !profesorActual) return;

    setEstudiantesConCambios(prevEstudiantes => {
      const updatedEstudiantes = prevEstudiantes.map(est => {
        if (est.id === estudianteId) {
          const existingRegistroIndex = est.asistencias.findIndex(reg => reg.fecha === asistenciaFecha);
          const newAsistencias = [...est.asistencias];

          if (existingRegistroIndex !== -1) {
            newAsistencias[existingRegistroIndex] = {
              ...newAsistencias[existingRegistroIndex],
              estado: nuevoEstado,
              idProfesor: profesorActual.id,
            };
          } else {
            newAsistencias.push({
              fecha: asistenciaFecha,
              estado: nuevoEstado,
              idProfesor: profesorActual.id,
            });
          }
          return { ...est, asistencias: newAsistencias };
        }
        return est;
      });
      return updatedEstudiantes;
    });
  }, [asistenciaFecha, profesorActual, edicionBloqueada]);

  const handleNotaChange = useCallback((
    estudianteId: string,
    periodo: CalificacionRegistro['periodo'],
    value: string
  ) => {
    if (edicionBloqueada) return;

    const nota = value === '' ? null : parseFloat(value);

    setEstudiantesConCambios(prevEstudiantes => {
      const updatedEstudiantes = prevEstudiantes.map(est => {
        if (est.id === estudianteId) {
          const newCalificaciones = [...est.calificaciones];
          let updated = false;

          for (let i = 0; i < newCalificaciones.length; i++) {
            if (newCalificaciones[i].periodo === periodo) {
              newCalificaciones[i] = { ...newCalificaciones[i], nota: nota };
              updated = true;
              break;
            }
          }

          if (!updated) {
            newCalificaciones.push({ periodo, nota });
          }

          return { ...est, calificaciones: newCalificaciones };
        }
        return est;
      });
      return updatedEstudiantes;
    });
  }, [edicionBloqueada]);

  const calcularPromedio = useCallback((calificaciones: CalificacionRegistro[]): number | null => {
    const notasValidas = calificaciones
      .filter(c => c.periodo.startsWith('parcial') && c.nota !== null && !isNaN(c.nota))
      .map(c => c.nota as number);

    if (notasValidas.length === 0) return null;
    const sum = notasValidas.reduce((acc, curr) => acc + curr, 0);
    return parseFloat((sum / notasValidas.length).toFixed(2));
  }, []);

  const handleGuardarCambios = async () => {
    if (!materiaDetalle) return;

    try {
      for (const estudiante of estudiantesConCambios) {
        const asistenciaActual = estudiante.asistencias.find(reg => reg.fecha === asistenciaFecha);
        if (asistenciaActual) {
          await updateAsistencia(materiaDetalle.id, estudiante.id, asistenciaFecha, asistenciaActual.estado);
        }

        for (const calificacion of estudiante.calificaciones) {
          if (calificacion.periodo.startsWith('parcial')) {
            await updateCalificacion(materiaDetalle.id, estudiante.id, calificacion.periodo, calificacion.nota);
          }
        }
      }
      setSnackbarMessage('Cambios guardados exitosamente.');
      setSnackbarSeverity('success');
    } catch (err: any) {
      console.error('Error al guardar cambios:', err);
      setSnackbarMessage(`Error al guardar cambios: ${err.message}`);
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };

  const handleOpenObservacionModal = (estudianteId: string, estudianteNombre: string) => {
    setCurrentStudentIdForObservacion(estudianteId);
    setCurrentStudentNameForObservacion(estudianteNombre);
    setObservacionFechaIncidente(new Date().toISOString().split('T')[0]);
    setObservacionTipoFalta('Leve');
    setObservacionArticulo('');
    setObservacionDescripcion('');
    setIsObservacionModalOpen(true);
  };

  const handleCloseObservacionModal = () => {
    setIsObservacionModalOpen(false);
    setCurrentStudentIdForObservacion(null);
    setCurrentStudentNameForObservacion('');
  };

  const handleSaveObservacion = async () => {
    if (!currentStudentIdForObservacion || !profesorActual || !materiaDetalle) {
      setSnackbarMessage('Error: Faltan datos para guardar la observación.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      await saveObservacion({
        idEstudiante: currentStudentIdForObservacion,
        idMateria: materiaDetalle.id,
        idProfesor: profesorActual.id,
        fechaIncidente: observacionFechaIncidente,
        tipoFalta: observacionTipoFalta,
        articuloManualConvivencia: observacionArticulo,
        descripcion: observacionDescripcion,
      });

      setSnackbarMessage('Observación guardada exitosamente.');
      setSnackbarSeverity('success');
      handleCloseObservacionModal();
    } catch (err: any) {
      console.error('Error al guardar observación:', err);
      setSnackbarMessage(`Error al guardar observación: ${err.message}`);
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };


  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando detalles de la asignatura...</Typography>
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

  if (!materiaDetalle) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6" color="text.secondary">No se encontró la información de la asignatura.</Typography>
      </Box>
    );
  }

  const getEstadoAsistencia = (estudianteId: string) => {
    const estudiante = estudiantesConCambios.find(e => e.id === estudianteId);
    return estudiante?.asistencias.find(reg => reg.fecha === asistenciaFecha)?.estado || '';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2 }}>
        <BookIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Asignatura: {materiaDetalle.nombre} ({materiaDetalle.nombreCurso})
      </Typography>

      <Paper elevation={2} sx={{
        mb: 4,
        borderRadius: 3,
        overflow: 'hidden',
        borderLeft: `4px solid ${theme.palette.secondary.main}`
      }}>
        <Box sx={{ p: 2, backgroundColor: theme.palette.action.selected }}>
          <Grid container spacing={1} alignItems="center">
            <Box sx={{ flexBasis: { xs: '100%', sm: '50%' }, maxWidth: { xs: '100%', sm: '50%' }, p: 1 }}>
              <Typography variant="subtitle1">
                <SchoolIcon fontSize="small" sx={{ mr: 0.5 }} />
                Curso: <strong>{materiaDetalle.nombreCurso}</strong>
              </Typography>
            </Box>
            <Box sx={{ flexBasis: { xs: '100%', sm: '50%' }, maxWidth: { xs: '100%', sm: '50%' }, p: 1 }}>
              <Typography variant="subtitle1">
                <PlaceIcon fontSize="small" sx={{ mr: 0.5 }} />
                Docente: <strong>{materiaDetalle.docente}</strong>
              </Typography>
            </Box>
          </Grid>
        </Box>
      </Paper>

      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        <CalendarTodayIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Gestión de Asistencia y Calificaciones
        <Chip
          icon={edicionBloqueada ? <LockIcon /> : <LockOpenIcon />}
          label={edicionBloqueada ? 'Edición Bloqueada' : 'Edición Habilitada'}
          color={edicionBloqueada ? 'error' : 'success'}
          size="small"
          sx={{ ml: 2 }}
        />
      </Typography>

      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Seleccionar Fecha de Asistencia:</Typography>
          <TextField
            type="date"
            value={asistenciaFecha}
            onChange={(e) => setAsistenciaFecha(e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            variant="outlined"
            size="small"
            sx={{ mr: 2 }}
            disabled={edicionBloqueada}
          />
          <Typography variant="caption" display="block" color="text.secondary" mt={1}>
            La asistencia y las notas se registrarán para la fecha seleccionada.
          </Typography>
        </Box>

        <TableContainer component={Paper} variant="outlined" sx={{ mt: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                <TableCell><strong>Estudiante</strong></TableCell>
                <TableCell align="center"><strong>Asistencia ({asistenciaFecha})</strong></TableCell>
                <TableCell align="center"><strong>Parcial 1</strong></TableCell>
                <TableCell align="center"><strong>Parcial 2</strong></TableCell>
                <TableCell align="center"><strong>Parcial 3</strong></TableCell>
                <TableCell align="center">
                  <strong>Promedio</strong>
                  <CalculateIcon fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5 }} />
                </TableCell>
                <TableCell align="center"><strong>Reporte Disciplinario</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {estudiantesConCambios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">No hay estudiantes matriculados en esta asignatura.</TableCell>
                </TableRow>
              ) : (
                estudiantesConCambios.map((estudiante) => (
                  <TableRow key={estudiante.id}>
                    <TableCell>{estudiante.nombre}</TableCell>
                    <TableCell align="center">
                      <FormControl fullWidth size="small" disabled={edicionBloqueada}>
                        <Select
                          value={getEstadoAsistencia(estudiante.id)}
                          onChange={(e) => handleAsistenciaChange(estudiante.id, e.target.value as 'Presente' | 'Ausente' | 'Justificado')}
                          displayEmpty
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value=""><em>Seleccionar</em></MenuItem>
                          <MenuItem value="Presente">Presente</MenuItem>
                          <MenuItem value="Ausente">Ausente</MenuItem>
                          <MenuItem value="Justificado">Justificado</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    {['parcial1', 'parcial2', 'parcial3'].map(periodoKey => {
                      const periodo = periodoKey as CalificacionRegistro['periodo'];
                      const nota = estudiante.calificaciones.find(c => c.periodo === periodo)?.nota;
                      return (
                        <TableCell key={periodo} align="center">
                          <TextField
                            type="number"
                            value={nota !== null ? nota : ''}
                            onChange={(e) => handleNotaChange(estudiante.id, periodo, e.target.value)}
                            inputProps={{ step: "0.1", min: "0", max: "5" }}
                            size="small"
                            sx={{ width: 80 }}
                            disabled={edicionBloqueada}
                          />
                        </TableCell>
                      );
                    })}
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight="bold">
                        {calcularPromedio(estudiante.calificaciones) !== null
                          ? calcularPromedio(estudiante.calificaciones)
                          : '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        aria-label="añadir observación"
                        onClick={() => handleOpenObservacionModal(estudiante.id, estudiante.nombre)}
                        disabled={edicionBloqueada || !profesorActual}
                      >
                        <AddCommentIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleGuardarCambios}
            disabled={loading || edicionBloqueada}
          >
            Guardar Cambios
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
              
      {/* Modal para Reporte Disciplinario */}
      <Dialog open={isObservacionModalOpen} onClose={handleCloseObservacionModal} maxWidth="xs" fullWidth>
        <DialogTitle>
          Reporte Disciplinario a {currentStudentNameForObservacion}
          <IconButton
            aria-label="close"
            onClick={handleCloseObservacionModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            &times;
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} direction="column" sx={{ width: '100%' }}>
            <TextField
              fullWidth
              type="date"
              label="Fecha del Incidente"
              value={observacionFechaIncidente}
              onChange={(e) => setObservacionFechaIncidente(e.target.value)}
              InputLabelProps={{ shrink: true }}
              variant="outlined"
            />
            <FormControl fullWidth variant="outlined">
              <InputLabel>Tipo de Falta</InputLabel>
              <Select
                value={observacionTipoFalta}
                onChange={(e) => setObservacionTipoFalta(e.target.value as 'Leve' | 'Grave' | 'Gravísima')}
                label="Tipo de Falta"
              >
                <MenuItem value="Leve">Falta Leve</MenuItem>
                <MenuItem value="Grave">Falta Grave</MenuItem>
                <MenuItem value="Gravísima">Falta Gravísima</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Artículo del Manual de Convivencia"
              value={observacionArticulo}
              onChange={(e) => setObservacionArticulo(e.target.value)}
              variant="outlined"
              placeholder="Ej: Art. 30, Num. 2"
            />
            <TextField
              fullWidth
              label="Descripción de lo sucedido"
              value={observacionDescripcion}
              onChange={(e) => setObservacionDescripcion(e.target.value)}
              multiline
              rows={4}
              variant="outlined"
              placeholder="Detalle el incidente de forma clara y concisa."
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseObservacionModal} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSaveObservacion} color="primary" variant="contained">
            Guardar Observación
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VistaAsignatura;
>>>>>>> Stashed changes
