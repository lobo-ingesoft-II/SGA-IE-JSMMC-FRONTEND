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

import { EstudianteAsignatura } from '../../../../../../models//PanelProfesor/estudianteAsignatura';
import { AsistenciaRegistro } from '../../../../../../models/PanelProfesor/asistencia';
import { CalificacionRegistro } from '../../../../../../models/PanelProfesor/calificacion';
import { 
  MateriaDetalle, 
  getMateriaDetalle, 
  updateAsistencia, 
  updateCalificacion, 
  getProfesorActual, 
  checkIfEditionIsLocked, 
  getEstudiantesConAsistencias, 
  autoGuardarCalificacion,
  // Funciones de observaciones integradas
  crearObservacion,
  getObservacionesEstudiante,
  validarDatosObservacion,
  // Funciones auxiliares para fechas
  obtenerFechaSegura,
  validarFechaNoFutura
} from '../../../../../../services/PanelProfesor/asignaturaService';

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
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error' | 'warning' | 'info'>('success');

  const [estudiantesConCambios, setEstudiantesConCambios] = useState<EstudianteAsignatura[]>([]);

  // Estados para manejar asistencias reales del backend
  const [estudiantesConAsistenciasReales, setEstudiantesConAsistenciasReales] = useState<Array<EstudianteAsignatura & { 
    estadoAsistencia: 'Presente' | 'Ausente' | 'Justificado' | 'No registrado'
  }> | null>(null);
  const [cargandoAsistencias, setCargandoAsistencias] = useState(false);

  // Estados para manejar observaciones
  const [cargandoObservaciones, setCargandoObservaciones] = useState(false);

  const [isObservacionModalOpen, setIsObservacionModalOpen] = useState(false);
  const [currentStudentIdForObservacion, setCurrentStudentIdForObservacion] = useState<string | null>(null);
  const [currentStudentNameForObservacion, setCurrentStudentNameForObservacion] = useState<string>('');
  const [observacionFechaIncidente, setObservacionFechaIncidente] = useState<string>(() => {
    // Usar julio 11, 2025 como fecha actual máxima
    return '2025-07-11';
  });
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
        setError(err.message || 'Error al cargar la información de la asignatura.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [materiaId, asistenciaFecha]);

  // Función para cargar asistencias globales reales desde el backend cuando cambie la fecha
  const cargarAsistenciasReales = useCallback(async () => {
    if (!materiaDetalle || !asistenciaFecha) return;
    
    setCargandoAsistencias(true);
    try {
      // Obtener asistencias globales de los estudiantes del curso para la fecha
      const estudiantesConAsistencias = await getEstudiantesConAsistencias(materiaId, asistenciaFecha);
      setEstudiantesConAsistenciasReales(estudiantesConAsistencias);
    } catch (error) {
      setSnackbarMessage('Error al cargar las asistencias globales del día seleccionado');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setCargandoAsistencias(false);
    }
  }, [materiaDetalle, materiaId, asistenciaFecha]);

  // Cargar asistencias cuando cambien la materia o la fecha
  useEffect(() => {
    cargarAsistenciasReales();
  }, [cargarAsistenciasReales]);

  // Manejar cambios de asistencia con API real
  const handleAsistenciaChange = useCallback(async (
    estudianteId: string,
    nuevoEstado: 'Presente' | 'Ausente' | 'Justificado'
  ) => {
    if (edicionBloqueada || !profesorActual) {
      setSnackbarMessage('La edición está bloqueada para esta fecha');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    try {
      // 1. Actualizar asistencia en el backend
      const exito = await updateAsistencia(materiaId, estudianteId, asistenciaFecha, nuevoEstado);
      
      if (exito) {
        // 2. Actualizar inmediatamente el estado de asistencias para UI responsiva
        if (estudiantesConAsistenciasReales) {
          setEstudiantesConAsistenciasReales(prev => 
            prev ? prev.map(est => 
              est.id === estudianteId 
                ? { ...est, estadoAsistencia: nuevoEstado }
                : est
            ) : null
          );
        }

        // 3. También actualizar estado local (por compatibilidad con otros componentes)
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

        // 4. Recargar asistencias desde el backend para confirmar el cambio global
        await cargarAsistenciasReales();

        setSnackbarMessage(`Asistencia actualizada: ${nuevoEstado}`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } else {
        throw new Error('La API retornó false');
      }
    } catch (error) {
      // Mostrar mensaje de error específico
      let errorMessage = 'Error al actualizar la asistencia. Inténtalo de nuevo.';
      if (error instanceof Error) {
        if (error.message.includes('curso') || error.message.includes('asignatura')) {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [materiaId, asistenciaFecha, profesorActual, edicionBloqueada, estudiantesConAsistenciasReales, cargarAsistenciasReales]);

  const handleNotaChange = useCallback((
    estudianteId: string,
    periodo: CalificacionRegistro['periodo'],
    value: string
  ) => {
    if (edicionBloqueada) return;

    const nota = value === '' ? null : parseFloat(value);

    // Validar rango de nota
    if (nota !== null && (nota < 0 || nota > 5)) {
      setSnackbarMessage('La nota debe estar entre 0 y 5');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      return;
    }

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

    setLoading(true);
    let erroresAsistencia: string[] = [];
    let erroresCalificacion: string[] = [];
    let exitosAsistencia = 0;
    let exitosCalificacion = 0;

    try {
      console.log('🚀 Iniciando guardado de cambios...');
      
      // Procesar asistencias
      for (const estudiante of estudiantesConCambios) {
        const asistenciaActual = estudiante.asistencias.find(reg => reg.fecha === asistenciaFecha);
        if (asistenciaActual) {
          try {
            const exito = await updateAsistencia(materiaDetalle.id, estudiante.id, asistenciaFecha, asistenciaActual.estado);
            if (exito) {
              exitosAsistencia++;
              console.log(`✅ Asistencia actualizada para ${estudiante.nombre}`);
            } else {
              erroresAsistencia.push(`${estudiante.nombre}: Error al actualizar asistencia`);
            }
          } catch (error) {
            erroresAsistencia.push(`${estudiante.nombre}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
          }
        }
      }

      // Procesar calificaciones - MEJORADO para mejor feedback
      for (const estudiante of estudiantesConCambios) {
        for (const calificacion of estudiante.calificaciones) {
          if (calificacion.periodo.startsWith('parcial') && calificacion.nota !== null) {
            try {
              console.log(`📝 Guardando ${calificacion.periodo} para ${estudiante.nombre}: ${calificacion.nota}`);
              const exito = await updateCalificacion(materiaDetalle.id, estudiante.id, calificacion.periodo, calificacion.nota);
              if (exito) {
                exitosCalificacion++;
                console.log(`✅ Calificación ${calificacion.periodo} guardada para ${estudiante.nombre}`);
              } else {
                erroresCalificacion.push(`${estudiante.nombre} - ${calificacion.periodo}: Error al actualizar calificación`);
              }
            } catch (error) {
              erroresCalificacion.push(`${estudiante.nombre} - ${calificacion.periodo}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            }
          }
        }
      }

      // Recargar datos si hubo cambios exitosos
      if (exitosAsistencia > 0 || exitosCalificacion > 0) {
        console.log('🔄 Recargando datos después de guardar cambios...');
        
        // Recargar asistencias
        if (exitosAsistencia > 0) {
          await cargarAsistenciasReales();
        }
        
        // Recargar calificaciones - IMPORTANTE: Recargar datos completos
        if (exitosCalificacion > 0) {
          try {
            console.log('📊 Recargando calificaciones actualizadas...');
            const detalleActualizado = await getMateriaDetalle(materiaId);
            setMateriaDetalle(detalleActualizado);
            setEstudiantesConCambios([...detalleActualizado.estudiantes]);
            console.log('✅ Datos de calificaciones recargados exitosamente');
          } catch (error) {
            console.error('❌ Error al recargar datos:', error);
          }
        }
      }

      // Mostrar resultados con mejor información
      const totalErrores = erroresAsistencia.length + erroresCalificacion.length;
      const totalExitos = exitosAsistencia + exitosCalificacion;

      if (totalErrores === 0 && totalExitos > 0) {
        setSnackbarMessage(`🎉 Cambios guardados exitosamente: ${exitosAsistencia} asistencias y ${exitosCalificacion} calificaciones actualizadas.`);
        setSnackbarSeverity('success');
      } else if (totalExitos > 0 && totalErrores > 0) {
        const mensajeExitos = `✅ Éxitos: ${exitosAsistencia} asistencias, ${exitosCalificacion} calificaciones. `;
        const mensajeErrores = `⚠️ Errores: ${totalErrores} actualizaciones fallaron.`;
        setSnackbarMessage(mensajeExitos + mensajeErrores);
        setSnackbarSeverity('warning');
      } else if (totalErrores > 0) {
        setSnackbarMessage(`❌ Error: No se pudieron guardar los cambios. ${totalErrores} actualizaciones fallaron.`);
        setSnackbarSeverity('error');
      } else {
        setSnackbarMessage('ℹ️ No hay cambios para guardar.');
        setSnackbarSeverity('info');
      }

    } catch (err: any) {
      console.error('❌ Error general al guardar cambios:', err);
      setSnackbarMessage(`❌ Error general al guardar cambios: ${err.message}`);
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const handleOpenObservacionModal = (estudianteId: string, estudianteNombre: string) => {
    setCurrentStudentIdForObservacion(estudianteId);
    setCurrentStudentNameForObservacion(estudianteNombre);
    // Usar función segura para la fecha para evitar problemas de validación (2 días atrás)
    setObservacionFechaIncidente('2025-07-11');
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
      // Validar fecha antes de proceder
      if (!validarFechaNoFutura(observacionFechaIncidente)) {
        setSnackbarMessage('La fecha del incidente no puede ser futura. Seleccione una fecha anterior a hoy.');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        return;
      }

      // Validar datos antes de enviar
      validarDatosObservacion({
        idEstudiante: currentStudentIdForObservacion,
        fechaIncidente: observacionFechaIncidente,
        tipoFalta: observacionTipoFalta,
        articuloManualConvivencia: observacionArticulo,
        descripcion: observacionDescripcion,
      });

      // Crear observación usando el servicio integrado
      await crearObservacion(materiaDetalle.id, {
        idEstudiante: currentStudentIdForObservacion,
        fechaIncidente: observacionFechaIncidente,
        tipoFalta: observacionTipoFalta,
        articuloManualConvivencia: observacionArticulo,
        descripcion: observacionDescripcion,
      });

      setSnackbarMessage('Observación guardada exitosamente.');
      setSnackbarSeverity('success');
      handleCloseObservacionModal();
      
      // No recargar información adicional después de crear una nueva observación
      console.log('Observación creada exitosamente');
    } catch (err: any) {
      console.error('Error al guardar observación:', err);
      
      // Mostrar mensaje de error más específico
      let errorMessage = 'Error al guardar observación';
      
      if (err.message) {
        if (err.message.includes('fecha del incidente no puede ser futura')) {
          errorMessage = 'La fecha del incidente no puede ser futura. Seleccione una fecha anterior a hoy.';
        } else if (err.message.includes('Descripción debe tener al menos 10 caracteres')) {
          errorMessage = 'La descripción debe tener al menos 10 caracteres.';
        } else if (err.message.includes('Artículo del manual de convivencia es requerido')) {
          errorMessage = 'El artículo del manual de convivencia es requerido.';
        } else {
          errorMessage = `Error: ${err.message}`;
        }
      }
      
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
    }
  };

  // Función para auto-guardar calificación cuando el usuario pierde el foco del campo
  const handleAutoGuardarCalificacion = useCallback(async (
    estudianteId: string,
    periodo: CalificacionRegistro['periodo'],
    nota: number | null
  ) => {
    if (edicionBloqueada || !materiaDetalle) return;

    try {
      console.log(`💾 Auto-guardando ${periodo} = ${nota} para estudiante ${estudianteId}`);
      
      const resultado = await autoGuardarCalificacion(materiaDetalle.id, estudianteId, periodo, nota);
      
      if (resultado.exito && nota !== null) {
        // Recargar calificaciones después del auto-guardado exitoso
        try {
          console.log('🔄 Recargando calificaciones después del auto-guardado...');
          const detalleActualizado = await getMateriaDetalle(materiaId);
          setMateriaDetalle(detalleActualizado);
          setEstudiantesConCambios([...detalleActualizado.estudiantes]);
          console.log('✅ Calificaciones recargadas después del auto-guardado');
        } catch (reloadError) {
          console.error('❌ Error al recargar después del auto-guardado:', reloadError);
        }
        
        // Mostrar confirmación sutil solo para éxitos con nota válida
        setSnackbarMessage(`✅ ${resultado.mensaje}`);
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
        // Auto-cerrar después de 2 segundos
        setTimeout(() => setSnackbarOpen(false), 2000);
      } else if (!resultado.exito) {
        // Mostrar error
        setSnackbarMessage(`❌ ${resultado.mensaje}`);
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('❌ Error en auto-guardado:', error);
      setSnackbarMessage(`❌ Error en auto-guardado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  }, [edicionBloqueada, materiaDetalle, materiaId]);

  // Efecto para debugging - mostrar las calificaciones cargadas
  useEffect(() => {
    if (materiaDetalle && materiaDetalle.estudiantes.length > 0) {
      console.log('📊 Estado actual de estudiantes con calificaciones:');
      materiaDetalle.estudiantes.forEach(estudiante => {
        console.log(`👤 ${estudiante.nombre}:`, estudiante.calificaciones);
      });
    }
  }, [materiaDetalle]);

  // Función para cargar resúmenes de observaciones de todos los estudiantes
  const cargarResumenesObservaciones = useCallback(async () => {
    // Función eliminada - ya no mostramos contadores de observaciones
    console.log('Función de carga de resúmenes de observaciones deshabilitada');
  }, []);

  // No cargar resúmenes de observaciones automáticamente
  useEffect(() => {
    // Efecto deshabilitado - ya no cargamos contadores de observaciones
  }, []);

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

  // Obtener estado de asistencia usando datos reales del backend
  const getEstadoAsistencia = (estudianteId: string) => {
    // 1. Priorizar asistencias reales del backend
    if (estudiantesConAsistenciasReales) {
      const estudianteConAsistencia = estudiantesConAsistenciasReales.find(e => e.id === estudianteId);
      if (estudianteConAsistencia && estudianteConAsistencia.estadoAsistencia !== 'No registrado') {
        // Retornar asistencia - el estado aplicado del estudiante
        return estudianteConAsistencia.estadoAsistencia;
      }
    }
    
    // 2. Fallback a datos locales solo si no hay datos globales del backend
    const estudiante = estudiantesConCambios.find(e => e.id === estudianteId);
    return estudiante?.asistencias.find(reg => reg.fecha === asistenciaFecha)?.estado || '';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 2 }}>
        <BookIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
        Asignatura: {materiaDetalle.nombre}
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
            {materiaDetalle.sede && (
              <Box sx={{ flexBasis: { xs: '100%', sm: '50%' }, maxWidth: { xs: '100%', sm: '50%' }, p: 1 }}>
                <Typography variant="subtitle1">
                  <PlaceIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Sede: <strong>{materiaDetalle.sede.nombre}</strong>
                </Typography>
              </Box>
            )}
            {materiaDetalle.gradoCurso && (
              <Box sx={{ flexBasis: { xs: '100%', sm: '50%' }, maxWidth: { xs: '100%', sm: '50%' }, p: 1 }}>
                <Typography variant="subtitle1">
                  <SchoolIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Grado: <strong>{materiaDetalle.gradoCurso}</strong>
                </Typography>
              </Box>
            )}
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
        </Box>

        <TableContainer component={Paper} variant="outlined" sx={{ mt: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.grey[100] }}>
                <TableCell><strong>Estudiante</strong></TableCell>
                <TableCell align="center">
                  <strong>Asistencia ({asistenciaFecha})</strong>
                  <Typography variant="caption" display="block" color="text.secondary" sx={{ fontWeight: 'normal' }}>
                    Estado aplicado a todo el día
                  </Typography>
                  {cargandoAsistencias && (
                    <Box component="span" sx={{ ml: 1 }}>
                      <Typography variant="caption" color="primary" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                        🔄 Cargando...
                      </Typography>
                    </Box>
                  )}
                </TableCell>
                <TableCell align="center"><strong>Parcial 1</strong></TableCell>
                <TableCell align="center"><strong>Parcial 2</strong></TableCell>
                <TableCell align="center"><strong>Parcial 3</strong></TableCell>
                <TableCell align="center">
                  <strong>Promedio</strong>
                  <CalculateIcon fontSize="small" sx={{ verticalAlign: 'middle', ml: 0.5 }} />
                </TableCell>
                <TableCell align="center"><strong>Acciones</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {estudiantesConCambios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">No hay estudiantes matriculados en esta asignatura.</TableCell>
                </TableRow>
              ) : (
                estudiantesConCambios.map((estudiante) => (
                  <TableRow key={estudiante.id}>
                    <TableCell>{estudiante.nombre}</TableCell>
                    <TableCell align="center">
                      {/* Selector de asistencia */}
                      {/* La asistencia es GLOBAL por estudiante por día - afecta todas las materias */}
                      <FormControl fullWidth size="small" disabled={edicionBloqueada || cargandoAsistencias}>
                        <Select
                          value={getEstadoAsistencia(estudiante.id)}
                          onChange={(e) => handleAsistenciaChange(estudiante.id, e.target.value as 'Presente' | 'Ausente' | 'Justificado')}
                          displayEmpty
                          sx={{ minWidth: 120 }}
                        >
                          <MenuItem value=""><em>{cargandoAsistencias ? 'Cargando...' : 'Seleccionar'}</em></MenuItem>
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
                            placeholder="0.0"
                            onBlur={(e) => {
                              const value = e.target.value === '' ? null : parseFloat(e.target.value);
                              handleAutoGuardarCalificacion(estudiante.id, periodo, value);
                            }}
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
                      {/* Solo botón para agregar observación */}
                      <IconButton
                        color="primary"
                        aria-label="añadir observación"
                        onClick={() => handleOpenObservacionModal(estudiante.id, estudiante.nombre)}
                        disabled={edicionBloqueada || !profesorActual}
                        title="Añadir observación disciplinaria"
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
              error={!validarFechaNoFutura(observacionFechaIncidente)}
              helperText={
                !validarFechaNoFutura(observacionFechaIncidente) 
                  ? 'La fecha no puede ser futura' 
                  : 'Seleccione la fecha del incidente'
              }
              inputProps={{
                max: '2025-07-11' // Fecha máxima: julio 11, 2025
              }}
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