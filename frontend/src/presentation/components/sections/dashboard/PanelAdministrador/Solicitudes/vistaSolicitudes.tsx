import { useState, useEffect } from 'react';
import { getSolicitudesConFallback, aprobarSolicitud, rechazarSolicitud } from '../../../../../../services/PanelAdministrador/solicitudesService';
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
  Button,
  IconButton,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Tabs,
  Tab,
  Pagination,
  Stack,
  Chip,
  Snackbar,
  Alert,
  Avatar,
  Tooltip,
  Card,
  CardContent,
  Collapse,
  InputAdornment
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Visibility as ViewIcon,
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

// Interfaces y servicios
interface SolicitudPrematricula {
  id: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  fechaNacimiento: string;
  edad?: number;
  acudiente1CC: string;
  nombreAcudiente1: string;
  telefonoAcudiente1?: string;
  correoAcudiente1?: string;
  sede: string;
  gradoSolicitado: string;
  fechaSolicitud: string;
  observaciones?: string;
  estado?: 'pendiente' | 'procesando';
}

interface CursoDisponible {
  id: number;
  nombre: string;
  grado: string;
  sede: string;
  cupos_disponibles: number;
}

// Datos mock para desarrollo
const MOCK_SOLICITUDES: SolicitudPrematricula[] = [
  {
    id: "1",
    numeroDocumento: "1234567890",
    nombres: "Juan Carlos",
    apellidos: "Pérez Gómez",
    fechaNacimiento: "2010-03-15",
    edad: 13,
    acudiente1CC: "98765432101",
    nombreAcudiente1: "María Gómez",
    telefonoAcudiente1: "3001234567",
    correoAcudiente1: "maria.gomez@email.com",
    sede: "Sede Principal",
    gradoSolicitado: "Séptimo",
    fechaSolicitud: "2024-01-15T10:30:00Z",
    observaciones: "Estudiante con buen rendimiento académico",
    estado: "pendiente"
  },
  {
    id: "2",
    numeroDocumento: "0987654321",
    nombres: "Ana Sofia",
    apellidos: "Rodríguez López",
    fechaNacimiento: "2009-07-22",
    edad: 14,
    acudiente1CC: "12345678901",
    nombreAcudiente1: "Carlos Rodríguez",
    telefonoAcudiente1: "3109876543",
    correoAcudiente1: "carlos.rodriguez@email.com",
    sede: "Sede Norte",
    gradoSolicitado: "Octavo",
    fechaSolicitud: "2024-01-14T14:20:00Z",
    estado: "pendiente"
  },
  {
    id: "3",
    numeroDocumento: "1122334455",
    nombres: "Luis Fernando",
    apellidos: "González Castro",
    fechaNacimiento: "2011-01-10",
    edad: 12,
    acudiente1CC: "55443322101",
    nombreAcudiente1: "Carmen Castro",
    telefonoAcudiente1: "3125551234",
    correoAcudiente1: "carmen.castro@email.com",
    sede: "Sede Principal",
    gradoSolicitado: "Sexto",
    fechaSolicitud: "2024-01-13T09:15:00Z",
    estado: "pendiente"
  }
];

const MOCK_CURSOS: CursoDisponible[] = [
  { id: 1, nombre: "6-A", grado: "Sexto", sede: "Sede Principal", cupos_disponibles: 8 },
  { id: 2, nombre: "7-A", grado: "Séptimo", sede: "Sede Principal", cupos_disponibles: 5 },
  { id: 3, nombre: "8-B", grado: "Octavo", sede: "Sede Norte", cupos_disponibles: 3 }
];

const SOLICITUDES_POR_PAGINA = 15;

const VistaSolicitudes = () => {
  // Estados para la tabla y filtros
  const [solicitudes, setSolicitudes] = useState<SolicitudPrematricula[]>([]);
  const [sedeSeleccionada, setSedeSeleccionada] = useState<string>('todas');
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para expansión de detalles
  const [expandedSolicitud, setExpandedSolicitud] = useState<string | null>(null);

  // Estados para los modales
  const [modalAprobar, setModalAprobar] = useState(false);
  const [modalRechazar, setModalRechazar] = useState(false);
  const [solicitudSeleccionada, setSolicitudSeleccionada] = useState<SolicitudPrematricula | null>(null);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<number | ''>('');
  const [observacionesRechazo, setObservacionesRechazo] = useState('');
  const [procesando, setProcesando] = useState(false);

  // Estado para el total de solicitudes
  const [totalSolicitudes, setTotalSolicitudes] = useState(0);

  // Estados para notificaciones
  const [notificacion, setNotificacion] = useState({
    abierta: false,
    mensaje: '',
    tipo: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  // Cargar solicitudes al iniciar
  useEffect(() => {
    setSolicitudes([]);
    setLoading(true);
    cargarSolicitudes();
  }, [sedeSeleccionada, paginaActual]);

  const cargarSolicitudes = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Cargando solicitudes para sede: ${sedeSeleccionada}, página: ${paginaActual}`);
      
      // Llamada real a la API
      const solicitudes = await getSolicitudesConFallback();
      
      let filtradas = solicitudes;
      
      if (sedeSeleccionada !== 'todas') {
        filtradas = solicitudes.filter(s => s.sede === sedeSeleccionada);
      }
      
      setTotalSolicitudes(filtradas.length);
      setTotalPaginas(Math.ceil(filtradas.length / SOLICITUDES_POR_PAGINA));
      
      const inicio = (paginaActual - 1) * SOLICITUDES_POR_PAGINA;
      const fin = inicio + SOLICITUDES_POR_PAGINA;
      setSolicitudes(filtradas.slice(inicio, fin));
      
    } catch (err: any) {
      console.error('Error al cargar solicitudes:', err);
      setError('No se pudieron cargar las solicitudes. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar solicitudes por búsqueda
  const solicitudesFiltradas = solicitudes.filter(solicitud =>
    `${solicitud.nombres} ${solicitud.apellidos}`.toLowerCase().includes(busqueda.toLowerCase()) ||
    solicitud.numeroDocumento.includes(busqueda) ||
    solicitud.nombreAcudiente1.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Manejadores para los modales
  const abrirModalAprobacion = (solicitud: SolicitudPrematricula) => {
    setSolicitudSeleccionada(solicitud);
    setCursoSeleccionado('');
    setModalAprobar(true);
  };

  const abrirModalRechazo = (solicitud: SolicitudPrematricula) => {
    setSolicitudSeleccionada(solicitud);
    setObservacionesRechazo('');
    setModalRechazar(true);
  };

  const cerrarModales = () => {
    setModalAprobar(false);
    setModalRechazar(false);
    setSolicitudSeleccionada(null);
    setCursoSeleccionado('');
    setObservacionesRechazo('');
  };

  // Aprobar solicitud
  const handleAprobarSolicitud = async () => {
    if (!solicitudSeleccionada || !cursoSeleccionado) return;

    setProcesando(true);
    try {
      // Llamada real a la API
      await aprobarSolicitud(solicitudSeleccionada.id, cursoSeleccionado as number);
      
      setSolicitudes(prev => prev.filter(s => s.id !== solicitudSeleccionada.id));
      setNotificacion({
        abierta: true,
        mensaje: `Solicitud de ${solicitudSeleccionada.nombres} ${solicitudSeleccionada.apellidos} aprobada correctamente`,
        tipo: 'success'
      });
      cerrarModales();
      // Recargar solicitudes para actualizar la lista
      cargarSolicitudes();

    } catch (err: any) {
      console.error('Error al aprobar solicitud:', err);
      setNotificacion({
        abierta: true,
        mensaje: `Error: ${err.message || 'No se pudo aprobar la solicitud'}`,
        tipo: 'error'
      });
    } finally {
      setProcesando(false);
    }
  };

  // Rechazar solicitud
  const handleRechazarSolicitud = async () => {
    if (!solicitudSeleccionada) return;

    setProcesando(true);
    try {
      // Llamada real a la API
      await rechazarSolicitud(solicitudSeleccionada.id);
      
      setSolicitudes(prev => prev.filter(s => s.id !== solicitudSeleccionada.id));
      setNotificacion({
        abierta: true,
        mensaje: `Solicitud de ${solicitudSeleccionada.nombres} ${solicitudSeleccionada.apellidos} rechazada`,
        tipo: 'warning'
      });
      cerrarModales();
      // Recargar solicitudes para actualizar la lista
      cargarSolicitudes();

    } catch (err: any) {
      console.error('Error al rechazar solicitud:', err);
      setNotificacion({
        abierta: true,
        mensaje: `Error: ${err.message || 'No se pudo rechazar la solicitud'}`,
        tipo: 'error'
      });
    } finally {
      setProcesando(false);
    }
  };

  // Expandir/contraer detalles
  const toggleExpandSolicitud = (solicitudId: string) => {
    setExpandedSolicitud(expandedSolicitud === solicitudId ? null : solicitudId);
  };

  // Cerrar notificación
  const cerrarNotificacion = () => {
    setNotificacion(prev => ({ ...prev, abierta: false }));
  };

  // Obtener sedes únicas para los tabs
  const sedesUnicas = [...new Set(solicitudes.map(s => s.sede))];

  if (loading && solicitudes.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando solicitudes de prematrícula...</Typography>
      </Box>
    );
  }

  if (error && solicitudes.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, width: '100%' }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 3, width: '100%' }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <AssignmentIcon sx={{ mr: 2 }} />
          Solicitudes de Prematrícula
        </Typography>
        
        {/* Filtros y acciones */}
        <Box sx={{ 
          mb: 3, 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          gap: 2, 
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', md: 'center' } 
        }}>
          <Tabs
            value={sedeSeleccionada}
            onChange={(_, newValue) => {
              setSedeSeleccionada(newValue);
              setPaginaActual(1);
            }}
            aria-label="filtro de sedes"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Todas las Sedes" value="todas" />
            {sedesUnicas.map(sede => (
              <Tab key={sede} label={sede} value={sede} />
            ))}
          </Tabs>
          
          <TextField
            size="small"
            placeholder="Buscar por nombre, documento o acudiente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            }}
            sx={{ minWidth: 300 }}
          />
        </Box>
        
        {/* Tabla de solicitudes */}
        <TableContainer component={Paper} variant="outlined" sx={{ overflow: 'auto', width: '100%' }}>
          <Table sx={{ minWidth: '100%' }}>
            <TableHead>
              <TableRow>
                <TableCell>Estudiante</TableCell>
                <TableCell>Documento</TableCell>
                <TableCell>Acudiente</TableCell>
                <TableCell>Sede</TableCell>
                <TableCell>Grado</TableCell>
                <TableCell>Fecha Solicitud</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : solicitudesFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No se encontraron solicitudes
                  </TableCell>
                </TableRow>
              ) : (
                solicitudesFiltradas.map((solicitud) => (
                  <>
                    <TableRow key={solicitud.id} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32 }}>
                            {solicitud.nombres.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {solicitud.nombres} {solicitud.apellidos}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {solicitud.edad} años
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{solicitud.numeroDocumento}</TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{solicitud.nombreAcudiente1}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            CC {solicitud.acudiente1CC}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{solicitud.sede}</TableCell>
                      <TableCell>
                        <Chip label={solicitud.gradoSolicitado} size="small" color="primary" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        {new Date(solicitud.fechaSolicitud).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label="Pendiente" 
                          color="warning"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Ver detalles">
                            <IconButton 
                              size="small"
                              onClick={() => toggleExpandSolicitud(solicitud.id)}
                            >
                              {expandedSolicitud === solicitud.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Aprobar solicitud">
                            <IconButton 
                              size="small" 
                              color="success"
                              onClick={() => abrirModalAprobacion(solicitud)}
                            >
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Rechazar solicitud">
                            <IconButton 
                              size="small" 
                              color="error"
                              onClick={() => abrirModalRechazo(solicitud)}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                    
                    {/* Fila expandible con detalles */}
                    <TableRow>
                      <TableCell colSpan={8} sx={{ p: 0, borderBottom: 'none' }}>
                        <Collapse in={expandedSolicitud === solicitud.id}>
                          <Box sx={{ p: 2, backgroundColor: 'grey.50' }}>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                              {/* Card de información del estudiante */}
                              <Card variant="outlined" sx={{ flex: '1 1 300px' }}>
                                <CardContent>
                                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                    <PersonIcon sx={{ mr: 1 }} />
                                    Información del Estudiante
                                  </Typography>
                                  <Stack spacing={1}>
                                    <Typography variant="body2">
                                      <strong>Fecha de nacimiento:</strong> {new Date(solicitud.fechaNacimiento).toLocaleDateString()}
                                    </Typography>
                                    {solicitud.observaciones && (
                                      <Typography variant="body2">
                                        <strong>Observaciones:</strong> {solicitud.observaciones}
                                      </Typography>
                                    )}
                                  </Stack>
                                </CardContent>
                              </Card>
                              
                              {/* Card de información del acudiente */}
                              <Card variant="outlined" sx={{ flex: '1 1 300px' }}>
                                <CardContent>
                                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                                    <PersonIcon sx={{ mr: 1 }} />
                                    Información del Acudiente
                                  </Typography>
                                  <Stack spacing={1}>
                                    {solicitud.telefonoAcudiente1 && (
                                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                        <PhoneIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                        {solicitud.telefonoAcudiente1}
                                      </Typography>
                                    )}
                                    {solicitud.correoAcudiente1 && (
                                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                                        <EmailIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                        {solicitud.correoAcudiente1}
                                      </Typography>
                                    )}
                                  </Stack>
                                </CardContent>
                              </Card>
                            </Box>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Paginación */}
        {totalPaginas > 1 && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <Pagination 
              count={totalPaginas} 
              page={paginaActual} 
              onChange={(_, page) => setPaginaActual(page)} 
              color="primary" 
            />
          </Box>
        )}
      </Paper>
      
      {/* Modal de aprobación */}
      <Dialog open={modalAprobar} onClose={cerrarModales} maxWidth="sm" fullWidth>
        <DialogTitle>Aprobar Solicitud de Prematrícula</DialogTitle>
        <DialogContent>
          {solicitudSeleccionada && (
            <>
              <Typography variant="body1" gutterBottom>
                ¿Está seguro de aprobar la solicitud de{' '}
                <strong>{solicitudSeleccionada.nombres} {solicitudSeleccionada.apellidos}</strong>?
              </Typography>
              
              <FormControl fullWidth margin="normal">
                <InputLabel>Asignar a curso</InputLabel>
                <Select
                  value={cursoSeleccionado}
                  onChange={(e) => setCursoSeleccionado(e.target.value)}
                  required
                >
                  {MOCK_CURSOS
                    .filter(curso => 
                      curso.grado === solicitudSeleccionada.gradoSolicitado &&
                      curso.sede === solicitudSeleccionada.sede
                    )
                    .map(curso => (
                      <MenuItem key={curso.id} value={curso.id}>
                        {curso.nombre} - {curso.grado} ({curso.cupos_disponibles} cupos disponibles)
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              
              {cursoSeleccionado && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Se creará automáticamente el usuario acudiente y se matriculará al estudiante.
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModales} disabled={procesando}>
            Cancelar
          </Button>
          <Button
            onClick={handleAprobarSolicitud}
            variant="contained"
            disabled={!cursoSeleccionado || procesando}
            startIcon={procesando ? <CircularProgress size={16} /> : <CheckIcon />}
          >
            {procesando ? 'Aprobando...' : 'Aprobar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de rechazo */}
      <Dialog open={modalRechazar} onClose={cerrarModales} maxWidth="sm" fullWidth>
        <DialogTitle>Rechazar Solicitud de Prematrícula</DialogTitle>
        <DialogContent>
          {solicitudSeleccionada && (
            <>
              <Typography variant="body1" gutterBottom>
                ¿Está seguro de rechazar la solicitud de{' '}
                <strong>{solicitudSeleccionada.nombres} {solicitudSeleccionada.apellidos}</strong>?
              </Typography>
              
              <TextField
                label="Observaciones (opcional)"
                multiline
                rows={3}
                fullWidth
                margin="normal"
                value={observacionesRechazo}
                onChange={(e) => setObservacionesRechazo(e.target.value)}
                placeholder="Motivo del rechazo..."
              />
              
              <Alert severity="warning" sx={{ mt: 2 }}>
                Esta acción eliminará permanentemente la solicitud.
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={cerrarModales} disabled={procesando}>
            Cancelar
          </Button>
          <Button
            onClick={handleRechazarSolicitud}
            variant="contained"
            color="error"
            disabled={procesando}
            startIcon={procesando ? <CircularProgress size={16} /> : <CloseIcon />}
          >
            {procesando ? 'Rechazando...' : 'Rechazar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notificaciones */}
      <Snackbar 
        open={notificacion.abierta} 
        autoHideDuration={6000} 
        onClose={cerrarNotificacion}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={cerrarNotificacion} 
          severity={notificacion.tipo} 
          sx={{ width: '100%' }}
        >
          {notificacion.mensaje}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VistaSolicitudes;
