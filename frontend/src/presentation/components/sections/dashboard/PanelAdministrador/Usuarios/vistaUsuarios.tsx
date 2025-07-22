import { useState, useEffect } from 'react';
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
  FormHelperText
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { 
  Usuario, 
  getUsuariosPorRol, 
  crearUsuario, 
  actualizarUsuario, 
  eliminarUsuario, 
  cambiarEstadoUsuario,
  NuevoUsuario,
  ActualizarUsuario,
  getProfesorData,
  DatosProfesor,
  getAcudienteData,
  DatosAcudiente,
  OPCIONES_PARENTESCO
} from '../../../../../../services/PanelAdministrador/usuariosService';

const USUARIOS_POR_PAGINA = 15;

const VistaUsuarios = () => {
  // Estados para la tabla y filtros
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [rolSeleccionado, setRolSeleccionado] = useState<string>('todos');
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para el modal de creación/edición
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [formData, setFormData] = useState<NuevoUsuario | ActualizarUsuario>({
    nombres: '',
    apellidos: '',
    tipo_documento: 'CC',
    documento_identidad: '',
    telefono: '',
    email: '',
    contrasena: '',
    confirmarContrasena: '',
    rol: 'profesor',
    datos_adicionales: {}
  });
  const [procesando, setProcesando] = useState(false);

  // Estado para el total de usuarios (para paginación)
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  
  // Estados para notificaciones y validación
  const [notificacion, setNotificacion] = useState({
    abierta: false,
    mensaje: '',
    tipo: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  const [erroresForm, setErroresForm] = useState<Record<string, string>>({});

  // Cargar usuarios al iniciar y cuando cambie el rol o página
  useEffect(() => {
    // Limpiar usuarios actuales para evitar mostrar datos antiguos
    setUsuarios([]);
    setLoading(true);
    cargarUsuarios();
  }, [rolSeleccionado, paginaActual]);

  const cargarUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Cargando usuarios con rol: ${rolSeleccionado}, página: ${paginaActual}`);
      
      // Primero, obtener el total de usuarios para la paginación
      let total = 0;
      try {
        // Intentar obtener el total de usuarios (esto podría ser una llamada API separada)
        // Por ahora, usamos una estimación basada en los datos disponibles
        const todosUsuarios = await getUsuariosPorRol(rolSeleccionado, 1, 100);
        total = todosUsuarios.length;
        console.log(`Total de usuarios encontrados: ${total}`);
      } catch (err) {
        console.warn('Error al obtener total de usuarios:', err);
        total = 50; // Valor por defecto
      }
      
      setTotalUsuarios(total);
      setTotalPaginas(Math.ceil(total / USUARIOS_POR_PAGINA));
      
      // Luego, obtener los usuarios para la página actual
      const data = await getUsuariosPorRol(rolSeleccionado, paginaActual, USUARIOS_POR_PAGINA);
      console.log(`Usuarios cargados para rol ${rolSeleccionado}:`, data);
      setUsuarios(data);
    } catch (err: any) {
      console.error('Error al cargar usuarios:', err);
      setError('No se pudieron cargar los usuarios. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar usuarios por nombre
  const usuariosFiltrados = usuarios.filter(usuario => 
    `${usuario.nombres} ${usuario.apellidos}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  // Manejadores para el modal
  const abrirModalCreacion = () => {
    setModoEdicion(false);
    setUsuarioEditando(null);
    setFormData({
      nombres: '',
      apellidos: '',
      tipo_documento: 'CC',
      documento_identidad: '',
      telefono: '',
      email: '',
      contrasena: '',
      confirmarContrasena: '',
      rol: 'profesor',
      datos_adicionales: {}
    });
    setErroresForm({});
    setModalAbierto(true);
  };

  const abrirModalEdicion = async (usuario: Usuario) => {
    setProcesando(true);
    setModoEdicion(true);
    setUsuarioEditando(usuario);
    
    try {
      // Obtener datos adicionales según el rol
      let datosAdicionales = {};
      
      // Obtener datos adicionales según el rol
      if (usuario.rol === 'profesor') {
        try {
          // Obtener datos específicos del profesor desde la API
          const datosProfesor: DatosProfesor = await getProfesorData(usuario.id_usuario);
          console.log('Datos del profesor obtenidos:', datosProfesor);
          
          datosAdicionales = {
            especialidad: datosProfesor.especialidad || '',
            es_director: datosProfesor.es_director || false
          };
        } catch (error) {
          console.error('Error al obtener datos del profesor:', error);
          datosAdicionales = {
            especialidad: '',
            es_director: false
          };
        }
      } else if (usuario.rol === 'acudiente') {
        try {
          // Obtener datos específicos del acudiente desde la API
          const datosAcudiente: DatosAcudiente = await getAcudienteData(usuario.id_usuario);
          console.log('Datos del acudiente obtenidos:', datosAcudiente);
          
          datosAdicionales = {
            parentesco: datosAcudiente.parentesco || '',
            celular: datosAcudiente.celular || '',
            direccion: datosAcudiente.direccion || ''
          };
        } catch (error) {
          console.error('Error al obtener datos del acudiente:', error);
          datosAdicionales = {
            parentesco: '',
            celular: '',
            direccion: ''
          };
        }
      }
      
      // Preparar datos para el formulario de edición
      const datosEdicion: ActualizarUsuario = {
        nombres: usuario.nombres || '',
        apellidos: usuario.apellidos || '',
        tipo_documento: (usuario as any).tipoDocumento || usuario.tipo_documento || 'CC',
        documento_identidad: (usuario as any).documentoIdentidad || usuario.documento_identidad || '',
        telefono: usuario.telefono || '',
        email: usuario.email || '',
        rol: usuario.rol || 'profesor',
        contrasena: '',
        confirmarContrasena: '',
        datos_adicionales: datosAdicionales
      };
      
      // Imprimir datos para depuración
      console.log('Datos de usuario para edición:', {
        tipo_documento: (usuario as any).tipoDocumento || usuario.tipo_documento,
        documento_identidad: (usuario as any).documentoIdentidad || usuario.documento_identidad,
        telefono: usuario.telefono,
        usuario_completo: usuario
      });
      
      setFormData(datosEdicion);
      setErroresForm({});
    } catch (err) {
      console.error('Error general al abrir modal de edición:', err);
      setNotificacion({
        abierta: true,
        mensaje: 'Error al cargar los datos del usuario',
        tipo: 'error'
      });
    } finally {
      setProcesando(false);
      setModalAbierto(true);
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
  };

  // Manejar cambios en el formulario
  const handleFormChange = (e: any) => {
    const name = e.target.name;
    const value = e.target.value;
    if (!name) return;

    // Limpiar error del campo cuando se modifica
    if (erroresForm[name]) {
      setErroresForm(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    if (name.includes('.')) {
      // Manejar campos anidados (datos_adicionales)
      const [parent, child] = name.split('.');
      setFormData(prev => {
        // Crear un nuevo objeto para datos_adicionales
        const datosAdicionales = { ...((prev.datos_adicionales as object) || {}) };
        datosAdicionales[child] = value;
        
        return {
          ...prev,
          datos_adicionales: datosAdicionales
        };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Validar formulario
  const validarFormulario = (): boolean => {
    const errores: Record<string, string> = {};
    
    // Validar campos obligatorios
    if (!formData.nombres) errores.nombres = 'El nombre es obligatorio';
    if (!formData.apellidos) errores.apellidos = 'Los apellidos son obligatorios';
    if (!formData.tipo_documento) errores.tipo_documento = 'El tipo de documento es obligatorio';
    if (!formData.documento_identidad) errores.documento_identidad = 'El número de documento es obligatorio';
    if (!formData.telefono) errores.telefono = 'El teléfono es obligatorio';
    if (!formData.email) {
      errores.email = 'El email es obligatorio';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      errores.email = 'Ingresa un correo electrónico válido';
    }
    
    // Validar contraseña
    if (!modoEdicion) {
      // Para nuevo usuario, la contraseña es obligatoria
      if (!(formData as NuevoUsuario).contrasena) {
        errores.contrasena = 'La contraseña es obligatoria';
      }
      // Validar confirmación de contraseña
      if ((formData as NuevoUsuario).contrasena !== (formData as NuevoUsuario).confirmarContrasena) {
        errores.confirmarContrasena = 'Las contraseñas no coinciden';
      }
    } else if ((formData as ActualizarUsuario).contrasena) {
      // Si se está actualizando la contraseña, validar que coincida con la confirmación
      if ((formData as ActualizarUsuario).contrasena !== (formData as ActualizarUsuario).confirmarContrasena) {
        errores.confirmarContrasena = 'Las contraseñas no coinciden';
      }
    }
    
    // Validar campos adicionales según el rol
    if (formData.rol === 'profesor') {
      if (!formData.datos_adicionales?.especialidad) {
        errores['datos_adicionales.especialidad'] = 'La especialidad es obligatoria';
      }
    } else if (formData.rol === 'acudiente') {
      if (!formData.datos_adicionales?.parentesco) {
        errores['datos_adicionales.parentesco'] = 'El parentesco es obligatorio';
      }
    }
    
    setErroresForm(errores);
    return Object.keys(errores).length === 0;
  };

  // Guardar usuario (crear o actualizar)
  const guardarUsuario = async () => {
    // Validar formulario antes de enviar
    if (!validarFormulario()) {
      setNotificacion({
        abierta: true,
        mensaje: 'Por favor complete todos los campos obligatorios',
        tipo: 'error'
      });
      return;
    }
    
    setProcesando(true);
    try {
      if (modoEdicion && usuarioEditando) {
        // Actualizar usuario existente
        await actualizarUsuario(usuarioEditando.id_usuario, formData as ActualizarUsuario);
        setNotificacion({
          abierta: true,
          mensaje: 'Usuario actualizado correctamente',
          tipo: 'success'
        });
      } else {
        // Crear nuevo usuario
        await crearUsuario(formData as NuevoUsuario);
        setNotificacion({
          abierta: true,
          mensaje: 'Usuario creado correctamente',
          tipo: 'success'
        });
      }
      cerrarModal();
      cargarUsuarios();
    } catch (err: any) {
      console.error('Error al guardar usuario:', err);
      
      // Manejar errores específicos
      let mensajeError = 'No se pudo guardar el usuario';
      
      // Verificar si es un error de correo electrónico inválido
      if (err.toString().includes('Object') || 
          (err.message && err.message.includes('email'))) {
        mensajeError = 'Ingresa un correo electrónico válido';
      } else if (err.message) {
        mensajeError = err.message;
      }
      
      setNotificacion({
        abierta: true,
        mensaje: `Error: ${mensajeError}`,
        tipo: 'error'
      });
    } finally {
      setProcesando(false);
    }
  };

  // Eliminar usuario
  const handleEliminarUsuario = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      await eliminarUsuario(id);
      setNotificacion({
        abierta: true,
        mensaje: 'Usuario eliminado correctamente',
        tipo: 'success'
      });
      cargarUsuarios();
    } catch (err: any) {
      console.error('Error al eliminar usuario:', err);
      setNotificacion({
        abierta: true,
        mensaje: `Error: ${err.message || 'No se pudo eliminar el usuario'}`,
        tipo: 'error'
      });
    }
  };

  // Cambiar estado de usuario (activar/desactivar)
  const handleCambiarEstado = async (id: number, estadoActual: boolean) => {
    try {
      console.log(`Cambiando estado del usuario ${id} de ${estadoActual ? 'activo' : 'inactivo'} a ${estadoActual ? 'inactivo' : 'activo'}`);
      
      // Usar el servicio para cambiar el estado
      await cambiarEstadoUsuario(id, estadoActual);
      
      setNotificacion({
        abierta: true,
        mensaje: `Usuario ${estadoActual ? 'desactivado' : 'activado'} correctamente`,
        tipo: 'success'
      });
      cargarUsuarios();
    } catch (err: any) {
      console.error('Error al cambiar estado del usuario:', err);
      setNotificacion({
        abierta: true,
        mensaje: `Error: ${err.message || 'No se pudo cambiar el estado del usuario'}`,
        tipo: 'error'
      });
    }
  };

  // Cerrar notificación
  const cerrarNotificacion = () => {
    setNotificacion(prev => ({ ...prev, abierta: false }));
  };

  // Renderizar campos adicionales según el rol
  const renderCamposAdicionales = () => {
    const rol = formData.rol;
    
    if (rol === 'profesor') {
      return (
        <>
          <TextField
            margin="dense"
            label="Especialidad"
            name="datos_adicionales.especialidad"
            value={formData.datos_adicionales?.especialidad || ''}
            onChange={handleFormChange}
            fullWidth
            required
            error={!!erroresForm['datos_adicionales.especialidad']}
            helperText={erroresForm['datos_adicionales.especialidad']}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Es Director</InputLabel>
            <Select
              name="datos_adicionales.es_director"
              value={formData.datos_adicionales?.es_director === true}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  datos_adicionales: {
                    ...prev.datos_adicionales,
                    es_director: e.target.value === "true"
                  }
                }));
              }}
            >
              <MenuItem value="true">Sí</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </Select>
          </FormControl>
        </>
      );
    } else if (rol === 'acudiente') {
      return (
        <>
          <FormControl fullWidth margin="dense" error={!!erroresForm['datos_adicionales.parentesco']}>
            <InputLabel>Parentesco</InputLabel>
            <Select
              name="datos_adicionales.parentesco"
              value={formData.datos_adicionales?.parentesco || ''}
              onChange={handleFormChange}
              required
              data-testid="select-parentesco"
            >
              {OPCIONES_PARENTESCO.map((opcion) => (
                <MenuItem key={opcion} value={opcion}>{opcion}</MenuItem>
              ))}
            </Select>
            {erroresForm['datos_adicionales.parentesco'] && (
              <FormHelperText>{erroresForm['datos_adicionales.parentesco']}</FormHelperText>
            )}
          </FormControl>
          <TextField
            margin="dense"
            label="Celular"
            name="datos_adicionales.celular"
            value={formData.datos_adicionales?.celular || ''}
            onChange={handleFormChange}
            fullWidth
          />
          <TextField
            margin="dense"
            label="Dirección"
            name="datos_adicionales.direccion"
            value={formData.datos_adicionales?.direccion || ''}
            onChange={handleFormChange}
            fullWidth
          />
        </>
      );
    }
    
    return null;
  };

  if (loading && usuarios.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Cargando usuarios...</Typography>
      </Box>
    );
  }

  if (error && usuarios.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }} data-testid="vista-usuarios-container">
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestión de Usuarios
        </Typography>
        
        {/* Filtros y acciones */}
        <Box sx={{ mb: 3, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' } }}>
          <Tabs
            value={rolSeleccionado}
            onChange={(_, newValue) => {
              setRolSeleccionado(newValue);
              setPaginaActual(1);
            }}
            aria-label="filtro de roles"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Todos" value="todos" data-testid="tab-todos" />
            <Tab label="Administradores" value="administrador" data-testid="tab-administradores" />
            <Tab label="Profesores" value="profesor" data-testid="tab-profesores" />
            <Tab label="Acudientes" value="acudiente" data-testid="tab-acudientes" />
          </Tabs>
          
          <Box sx={{ display: 'flex', gap: 1, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
            <TextField
              size="small"
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              data-testid="buscar-usuario"
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={abrirModalCreacion}
              data-testid="btn-nuevo-usuario"
            >
              Nuevo Usuario
            </Button>
          </Box>
        </Box>
        
        {/* Tabla de usuarios */}
        <TableContainer component={Paper} variant="outlined" sx={{ overflow: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombres</TableCell>
                <TableCell>Apellidos</TableCell>
                <TableCell>Documento</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Rol</TableCell>
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
              ) : usuariosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No se encontraron usuarios
                  </TableCell>
                </TableRow>
              ) : (
                usuariosFiltrados.map((usuario) => (
                  <TableRow key={usuario.id_usuario} data-testid={`usuario-${usuario.id_usuario}`}>
                    <TableCell>{usuario.nombres}</TableCell>
                    <TableCell>{usuario.apellidos}</TableCell>
                    <TableCell>{usuario.tipo_documento} {usuario.documento_identidad}</TableCell>
                    <TableCell>{usuario.telefono}</TableCell>
                    <TableCell>{usuario.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={usuario.rol ? (usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)) : 'Sin rol'} 
                        color={
                          usuario.rol === 'administrador' ? 'error' : 
                          usuario.rol === 'profesor' ? 'primary' : 
                          usuario.rol === 'acudiente' ? 'success' : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={usuario.estado ? 'Activo' : 'Inactivo'} 
                        color={usuario.estado ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <IconButton 
                          size="small" 
                          color="primary" 
                          onClick={() => abrirModalEdicion(usuario)}
                          title="Editar"
                          data-testid={`btn-editar-${usuario.id_usuario}`}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color={usuario.estado ? 'warning' : 'success'} 
                          onClick={() => handleCambiarEstado(usuario.id_usuario, usuario.estado)}
                          title={usuario.estado ? 'Desactivar' : 'Activar'}
                          data-testid={`btn-estado-${usuario.id_usuario}`}
                        >
                          {usuario.estado ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleEliminarUsuario(usuario.id_usuario)}
                          title="Eliminar"
                          data-testid={`btn-eliminar-${usuario.id_usuario}`}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
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
              data-testid="paginacion"
            />
          </Box>
        )}
      </Paper>
      
      {/* Modal de creación/edición */}
      <Dialog 
        open={modalAbierto} 
        onClose={cerrarModal} 
        maxWidth="sm" 
        fullWidth
        data-testid="modal-usuario"
      >
        <DialogTitle>{modoEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nombres"
            name="nombres"
            value={formData.nombres}
            onChange={handleFormChange}
            fullWidth
            required
            error={!!erroresForm.nombres}
            helperText={erroresForm.nombres}
            data-testid="input-nombres"
          />
          <TextField
            margin="dense"
            label="Apellidos"
            name="apellidos"
            value={formData.apellidos}
            onChange={handleFormChange}
            fullWidth
            required
            error={!!erroresForm.apellidos}
            helperText={erroresForm.apellidos}
            data-testid="input-apellidos"
          />
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <FormControl fullWidth margin="dense" error={!!erroresForm.tipo_documento}>
              <InputLabel>Tipo de Documento</InputLabel>
              <Select
                name="tipo_documento"
                value={formData.tipo_documento || ''}
                onChange={handleFormChange}
                data-testid="select-tipo-documento"
              >
                <MenuItem value="CC">CC</MenuItem>
                <MenuItem value="CE">CE</MenuItem>
                <MenuItem value="TI">TI</MenuItem>
              </Select>
              {erroresForm.tipo_documento && (
                <FormHelperText>{erroresForm.tipo_documento}</FormHelperText>
              )}
            </FormControl>
            <TextField
              margin="dense"
              label="Número de Documento"
              name="documento_identidad"
              value={formData.documento_identidad || ''}
              onChange={handleFormChange}
              fullWidth
              required
              error={!!erroresForm.documento_identidad}
              helperText={erroresForm.documento_identidad}
              data-testid="input-documento"
            />
          </Box>
          <TextField
            margin="dense"
            label="Teléfono"
            name="telefono"
            value={formData.telefono || ''}
            onChange={handleFormChange}
            fullWidth
            required
            error={!!erroresForm.telefono}
            helperText={erroresForm.telefono}
            data-testid="input-telefono"
          />
          <TextField
            margin="dense"
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleFormChange}
            fullWidth
            required
            error={!!erroresForm.email}
            helperText={erroresForm.email}
            data-testid="input-email"
          />
          {/* Campo de contraseña */}
          <TextField
            margin="dense"
            label={modoEdicion ? "Nueva contraseña (opcional)" : "Contraseña"}
            name="contrasena"
            type="password"
            value={(formData as any).contrasena || ''}
            onChange={handleFormChange}
            fullWidth
            required={!modoEdicion}
            error={!!erroresForm.contrasena}
            helperText={erroresForm.contrasena}
            data-testid="input-contrasena"
          />
          
          {/* Campo de confirmación de contraseña */}
          <TextField
            margin="dense"
            label={modoEdicion ? "Confirmar nueva contraseña" : "Confirmar contraseña"}
            name="confirmarContrasena"
            type="password"
            value={(formData as any).confirmarContrasena || ''}
            onChange={handleFormChange}
            fullWidth
            required={!modoEdicion || (modoEdicion && !!(formData as ActualizarUsuario).contrasena)}
            error={!!erroresForm.confirmarContrasena}
            helperText={erroresForm.confirmarContrasena}
            data-testid="input-confirmar-contrasena"
          />
          <FormControl fullWidth margin="dense" error={!!erroresForm.rol}>
            <InputLabel>Rol</InputLabel>
            <Select
              name="rol"
              value={formData.rol}
              onChange={handleFormChange}
              data-testid="select-rol"
            >
              <MenuItem value="administrador">Administrador</MenuItem>
              <MenuItem value="profesor">Profesor</MenuItem>
              <MenuItem value="acudiente">Acudiente</MenuItem>
            </Select>
            {erroresForm.rol && (
              <FormHelperText>{erroresForm.rol}</FormHelperText>
            )}
          </FormControl>
          
          {/* Campos adicionales según el rol */}
          {renderCamposAdicionales()}
          
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={cerrarModal} 
            disabled={procesando}
            data-testid="btn-cancelar"
          >
            Cancelar
          </Button>
          <Button 
            onClick={guardarUsuario} 
            variant="contained" 
            color="primary" 
            disabled={procesando}
            data-testid="btn-guardar"
          >
            {procesando ? <CircularProgress size={24} /> : modoEdicion ? 'Actualizar' : 'Crear'}
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
          data-testid="notificacion"
        >
          {notificacion.mensaje}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default VistaUsuarios;