// Interfaces
export interface Usuario {
  id_usuario: number;
  nombres: string;
  apellidos: string;
  tipo_documento: string;
  documento_identidad: string;
  telefono: string;
  email: string;
  rol: string;
  estado: boolean;
  fecha_creacion?: string;
  fecha_modificacion?: string;
}

export interface NuevoUsuario {
  nombres: string;
  apellidos: string;
  tipo_documento: string;
  documento_identidad: string;
  telefono: string;
  email: string;
  contrasena: string;
  confirmarContrasena?: string; // Campo para confirmar contraseña (no se envía a la API)
  rol: string;
  datos_adicionales: {
    especialidad?: string;
    es_director?: boolean;
    parentesco?: string;
    celular?: string;
    direccion?: string;
  };
}

export interface ActualizarUsuario {
  nombres?: string;
  apellidos?: string;
  tipo_documento?: string;
  documento_identidad?: string;
  telefono?: string;
  email?: string;
  rol?: string;
  contrasena?: string; 
  confirmarContrasena?: string;
  datos_adicionales?: {
    especialidad?: string;
    es_director?: boolean;
    parentesco?: string;
    celular?: string;
    direccion?: string;
  };
}

// Interfaces para datos específicos de roles
export interface DatosProfesor {
  id_profesor: number;
  id_usuario: number;
  especialidad: string;
  es_director: boolean;
}

export interface DatosAcudiente {
  id_acudiente: number;
  id_usuario: number;
  parentesco: string;
  celular: string;
  direccion: string;
}

// Constantes
export const OPCIONES_PARENTESCO = ['Padre', 'Madre', 'Abuelo', 'Abuela', 'Tío', 'Tía', 'Otro'];

// Configuración de API
const API_BASE_URL = 'http://localhost:8009';
const PORTAL_ADMIN_URL = 'http://localhost:8012/portal_admin';

// Funciones de utilidad
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || 'Error en la solicitud');
  }
  return await response.json();
};

// Función para normalizar un usuario y asegurar que todos los campos estén presentes
function normalizarUsuario(usuario: any): Usuario {
  // Determinar el rol basado en los datos disponibles
  let rol = usuario.rol;
  if (!rol) {
    // Intentar inferir el rol basado en la estructura de datos
    if (usuario.especialidad !== undefined) {
      rol = 'profesor';
    } else if (usuario.parentesco !== undefined) {
      rol = 'acudiente';
    } else {
      rol = 'administrador'; // Valor por defecto
    }
  }
  
  // Determinar el estado del usuario
  let estado = true; // Por defecto, activo
  
  // Si el estado es un booleano, usarlo directamente
  if (typeof usuario.estado === 'boolean') {
    estado = usuario.estado;
  } 
  // Si el estado es una cadena, convertirla a booleano
  else if (typeof usuario.estado === 'string') {
    // Solo si el estado es explícitamente 'inactivo', lo marcamos como false
    estado = usuario.estado.toLowerCase() === 'activo';
  }
  // Si hay un campo 'activo', usarlo
  else if (typeof usuario.activo === 'boolean') {
    estado = usuario.activo;
  }
  // Si hay un campo 'estado_usuario', usarlo
  else if (typeof usuario.estado_usuario === 'string') {
    // Solo si el estado es explícitamente 'inactivo', lo marcamos como false
    estado = usuario.estado_usuario.toLowerCase() === 'activo';
  }
  
  console.log(`Usuario ${usuario.nombres}: estado=${usuario.estado}, normalizado=${estado}`);
  
  // Normalizar los campos de tipo de documento y documento de identidad
  const tipo_documento = usuario.tipoDocumento || usuario.tipo_documento || '';
  const documento_identidad = usuario.documentoIdentidad || usuario.documento_identidad || '';
  
  console.log(`Normalizando usuario ${usuario.nombres}: tipo_doc=${tipo_documento}, doc_id=${documento_identidad}`);
  
  return {
    id_usuario: usuario.id_usuario || usuario.id || 0,
    nombres: usuario.nombres || '',
    apellidos: usuario.apellidos || '',
    tipo_documento: tipo_documento,
    documento_identidad: documento_identidad,
    telefono: usuario.telefono || '',
    email: usuario.email || '',
    rol: rol,
    estado: estado,
    fecha_creacion: usuario.fecha_creacion || '',
    fecha_modificacion: usuario.fecha_modificacion || ''
  };
}

// API de Usuarios
export const usuariosApi = {
  // Obtener datos de un acudiente por ID
  async getAcudienteById(id: number): Promise<DatosAcudiente> {
    try {
      // Primero obtenemos el id_acudiente a partir del id_usuario
      const acudientesResponse = await fetch(`${API_BASE_URL}/admin/acudientes`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!acudientesResponse.ok) {
        throw new Error(`Error al obtener lista de acudientes: ${acudientesResponse.status}`);
      }
      
      const acudientes = await acudientesResponse.json();
      const acudiente = acudientes.find((a: any) => a.id_usuario === id);
      
      if (!acudiente) {
        throw new Error(`No se encontró acudiente con id_usuario ${id}`);
      }
      
      console.log('Acudiente encontrado:', acudiente);
      const idAcudiente = acudiente.id_acudiente;
      
      // Ahora obtenemos los datos detallados del acudiente
      const response = await fetch(`${API_BASE_URL}/acudiente/${idAcudiente}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Error al obtener datos del acudiente: ${response.status}`);
      }
      
      const datosAcudiente = await response.json();
      console.log('Datos del acudiente obtenidos:', datosAcudiente);
      return datosAcudiente;
    } catch (error) {
      console.error('Error al obtener datos del acudiente:', error);
      throw error;
    }
  },
  
  // Obtener datos de un profesor por ID
  async getProfesorById(id: number): Promise<DatosProfesor> {
    try {
      const response = await fetch(`${API_BASE_URL}/profesor/${id}`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Error al obtener datos del profesor: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener datos del profesor:', error);
      throw error;
    }
  },
  
  // Obtener administradores
  async getAdministradores(): Promise<Usuario[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/administradores`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Error al obtener administradores: ${response.status}`);
      }
      
      const data = await response.json();
      return data.map((admin: any) => ({
        ...admin,
        rol: 'administrador'
      })).map(normalizarUsuario);
    } catch (error) {
      console.error('Error al obtener administradores:', error);
      throw error;
    }
  },
  
  // Obtener profesores
  async getProfesores(): Promise<Usuario[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/profesores`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Error al obtener profesores: ${response.status}`);
      }
      
      const data = await response.json();
      return data.map((prof: any) => ({
        ...prof,
        rol: 'profesor'
      })).map(normalizarUsuario);
    } catch (error) {
      console.error('Error al obtener profesores:', error);
      throw error;
    }
  },
  
  // Obtener acudientes
  async getAcudientes(): Promise<Usuario[]> {
    try {
      // Usar el endpoint del portal_admin para obtener acudientes
      const response = await fetch(`${PORTAL_ADMIN_URL}/acudientes?limit=100`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Error al obtener acudientes: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Acudientes obtenidos desde portal_admin:', data);
      
      return data.map((acud: any) => ({
        ...acud,
        rol: 'acudiente',
        // Asegurar que los campos tengan los nombres correctos
        tipo_documento: acud.tipoDocumento || acud.tipo_documento,
        documento_identidad: acud.documentoIdentidad || acud.documento_identidad
      })).map(normalizarUsuario);
    } catch (error) {
      console.error('Error al obtener acudientes:', error);
      throw error;
    }
  },
  
  // Crear usuario
  async crear(usuario: NuevoUsuario): Promise<{ mensaje: string; id_usuario: number }> {
    // Eliminar el campo confirmarContrasena antes de enviar
    const { confirmarContrasena, ...usuarioSinConfirmacion } = usuario;
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/usuarios`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(usuarioSinConfirmacion)
      });
      
      return await handleApiResponse(response);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  },
  
  // Actualizar usuario
  async actualizar(id: number, datos: ActualizarUsuario): Promise<{ mensaje: string }> {
    // Eliminar el campo confirmarContrasena antes de enviar
    const { confirmarContrasena, ...datosSinConfirmacion } = datos;
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/usuarios/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(datosSinConfirmacion)
      });
      
      return await handleApiResponse(response);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  },
  
  // Cambiar estado de usuario
  async cambiarEstado(id: number, estadoActual: boolean): Promise<{ mensaje: string }> {
    // Si estadoActual es true (activo), cambiamos a 'inactivo'
    // Si estadoActual es false (inactivo), cambiamos a 'activo'
    const nuevoEstado = estadoActual ? 'inactivo' : 'activo';
    
    try {
      const response = await fetch(`${API_BASE_URL}/admin/usuarios/${id}/estado?estado=${nuevoEstado}`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      
      return await handleApiResponse(response);
    } catch (error) {
      console.error('Error al cambiar estado del usuario:', error);
      throw error;
    }
  },
  
  // Eliminar usuario
  async eliminar(id: number): Promise<{ mensaje: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/usuarios/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      return await handleApiResponse(response);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      throw error;
    }
  }
};

// Funciones de servicio (para mantener compatibilidad con el código existente)
export async function getUsuariosPorRol(rol: string, pagina: number = 1, limite: number = 15): Promise<Usuario[]> {
  try {
    let usuarios: Usuario[] = [];
    const token = localStorage.getItem('token');
    
    if (rol === 'todos') {
      // Usar el nuevo endpoint para todos los usuarios
      const response = await fetch(`${API_BASE_URL}/usuario/getUsers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error al obtener usuarios: ${response.status}`);
      }
      
      const data = await response.json();
      usuarios = data.map(normalizarUsuario);
    } else if (rol === 'acudiente') {
      // Caso especial para acudientes - usar directamente el endpoint del portal_admin
      const endpoint = `${PORTAL_ADMIN_URL}/acudientes?limit=${limite}`;
      console.log(`Obteniendo acudientes desde: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error al obtener acudientes: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Datos de acudientes recibidos:', data);
      
      usuarios = data.map((acud: any) => ({
        ...acud,
        rol: 'acudiente',
        tipo_documento: acud.tipoDocumento || acud.tipo_documento,
        documento_identidad: acud.documentoIdentidad || acud.documento_identidad
      })).map(normalizarUsuario);
    } else {
      // Para otros roles (administrador, profesor)
      const endpoint = `${PORTAL_ADMIN_URL}/${rol}es?limit=${limite}`;
      console.log(`Obteniendo ${rol}es desde: ${endpoint}`);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error al obtener ${rol}es: ${response.status}`);
      }
      
      const data = await response.json();
      usuarios = data.map((user: any) => ({
        ...user,
        rol: rol
      })).map(normalizarUsuario);
    }
    
    // Aplicar paginación
    const totalUsuarios = usuarios.length;
    const inicio = (pagina - 1) * limite;
    const fin = Math.min(inicio + limite, totalUsuarios);
    
    return usuarios.slice(inicio, fin);
  } catch (error) {
    console.error('Error en getUsuariosPorRol:', error);
    throw error;
  }
}

export async function crearUsuario(usuario: NuevoUsuario): Promise<{ mensaje: string; id_usuario: number }> {
  return usuariosApi.crear(usuario);
}

export async function actualizarUsuario(id: number, datos: ActualizarUsuario): Promise<{ mensaje: string }> {
  return usuariosApi.actualizar(id, datos);
}

export async function cambiarEstadoUsuario(id: number, estadoActual: boolean): Promise<{ mensaje: string }> {
  const nuevoEstado = estadoActual ? 'inactivo' : 'activo';
  
  try {
    console.log(`Cambiando estado del usuario ${id} a ${nuevoEstado}`);
    
    // Intentar primero con el endpoint del portal_admin
    try {
      const response = await fetch(`${PORTAL_ADMIN_URL}/usuarios/${id}/estado?estado=${nuevoEstado}`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        return await response.json();
      }
    } catch (portalError) {
      console.warn('Error al usar portal_admin, intentando con API directa:', portalError);
    }
    
    // Si falla, intentar con el endpoint directo
    const response = await fetch(`${API_BASE_URL}/admin/usuarios/${id}/estado?estado=${nuevoEstado}`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `Error al cambiar estado del usuario ${id}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en cambiarEstadoUsuario:', error);
    throw error;
  }
}

export async function eliminarUsuario(id: number): Promise<{ mensaje: string }> {
  return usuariosApi.eliminar(id);
}

// Función para obtener datos específicos de un profesor
export async function getProfesorData(id: number): Promise<DatosProfesor> {
  return usuariosApi.getProfesorById(id);
}

// Función para obtener datos específicos de un acudiente
export async function getAcudienteData(id: number): Promise<DatosAcudiente> {
  return usuariosApi.getAcudienteById(id);
}