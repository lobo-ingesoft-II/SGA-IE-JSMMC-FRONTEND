<<<<<<< Updated upstream
import React, { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import logo from '../../assets/logo/logo.png';
import { departamentos } from '../../../data/departamentos';

const sedes = [
  'CONCENTRACION RURAL CABUYARITO',
  'CONCENTRACION RURAL CAÑO TIGRE',
  'ESCUELA RURAL BUENAVISTA MAYA',
  'ESCUELA RURAL BOTELLAS',
  'ESCUELA RURAL BUENAVISTA DE ALTO REDONDO',
  'ESCUELA RURAL GUAICARAMO',
  'ESCUELA RURAL JORGE ELIÉCER GAITÁN',
  'ESCUELA RURAL LA LIBERTAD',
  'ESCUELA RURAL LAS VIRGINIAS',
  'ESCUELA RURAL MARIA AUXILIADORA',
  'ESCUELA RURAL PALOMAS CAÑO CLARO',
  'ESCUELA RURAL SAN ISIDRO',
  'ESCUELA RURAL SAN JESUS DE PALOMAS',
  'ESCUELA RURAL SIMON BOLIVAR',
  'INSTITUCIÓN EDUCATIVA DEPARTAMENTAL JOSUÉ MANRIQUE'
];

const sisbenSubcategorias: Record<string, string[]> = {
  A: ['A1', 'A2', 'A3', 'A4', 'A5'],
  B: Array.from({ length: 7 }, (_, i) => `B${i + 1}`),
  C: Array.from({ length: 18 }, (_, i) => `C${i + 1}`),
  D: Array.from({ length: 21 }, (_, i) => `D${i + 1}`),
};

const parentescos = [
  'Padre',
  'Madre',
  'Abuelo',
  'Abuela',
  'Tío',
  'Tía',
  'Otro',
];

const paises = [
  'COLOMBIA',
  'VENEZUELA',
  'ARGENTINA',
  'BRASIL',
  'CHILE',
  'ECUADOR',
  'PERÚ',
  'OTRO',
];

const tiposDocumento = [
  'Registro Civil de Nacimiento',
  'Tarjeta de Identidad',
  'Cédula de Ciudadanía',
];

// Tipado del formulario
type FormData = {
  apellidos: string;
  nombres: string;
  tipoDocumento: string;
  numeroDocumento: string;
  fechaNacimiento: string;
  paisNacimiento: string;
  departamentoNacimiento: string;
  municipioNacimiento: string;
  categoriaSisben: string;
  subcategoriaSisben: string;
  direccionResidencia: string;
  telefono: string;
  rutaEscolar: string;
  seguroMedico: string;
  discapacidad: string;
  detalleDiscapacidad: string;
  poblacionDesplazada: string;
  fechaDesplazamiento: string;
  paisResidencia: string;
  departamentoResidencia: string;
  municipioResidencia: string;
  gradoIngreso: string;
  institucionAnterior: string;
  municipioAnterior: string;
  sede: string;
  acudiente1Parentesco: string;
  acudiente1Apellidos: string;
  acudiente1Nombres: string;
  acudiente1CC: string;
  acudiente1Celular: string;
  acudiente1Ocupacion: string;
  acudiente2Parentesco: string;
  acudiente2Apellidos: string;
  acudiente2Nombres: string;
  acudiente2CC: string;
  acudiente2Celular: string;
  acudiente2Ocupacion: string;
};

const initialForm: FormData = {
  apellidos: '',
  nombres: '',
  tipoDocumento: '',
  numeroDocumento: '',
  fechaNacimiento: '',
  paisNacimiento: 'COLOMBIA',
  departamentoNacimiento: '',
  municipioNacimiento: '',
  categoriaSisben: '',
  subcategoriaSisben: '',
  direccionResidencia: '',
  telefono: '',
  rutaEscolar: '',
  seguroMedico: '',
  discapacidad: '',
  detalleDiscapacidad: '',
  poblacionDesplazada: '',
  fechaDesplazamiento: '',
  paisResidencia: 'COLOMBIA',
  departamentoResidencia: '',
  municipioResidencia: '',
  gradoIngreso: '',
  institucionAnterior: '',
  municipioAnterior: '',
  sede: '',
  acudiente1Parentesco: '',
  acudiente1Apellidos: '',
  acudiente1Nombres: '',
  acudiente1CC: '',
  acudiente1Celular: '',
  acudiente1Ocupacion: '',
  acudiente2Parentesco: '',
  acudiente2Apellidos: '',
  acudiente2Nombres: '',
  acudiente2CC: '',
  acudiente2Celular: '',
  acudiente2Ocupacion: '',
};

const SignUp: React.FC = () => {
  const [form, setForm] = useState<FormData>(initialForm);

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

  const departamentosColombia = departamentos.map(dep => dep.nombre);
  const municipiosDepartamentoNacimiento =
    departamentos.find(dep => dep.nombre === form.departamentoNacimiento)?.municipios || [];
  const municipiosDepartamentoResidencia =
    departamentos.find(dep => dep.nombre === form.departamentoResidencia)?.municipios || [];

  // Handler genérico
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'categoriaSisben' ? { subcategoriaSisben: '' } : {}),
      ...(name === 'paisNacimiento'
        ? { departamentoNacimiento: '', municipioNacimiento: '' }
        : {}),
      ...(name === 'departamentoNacimiento'
        ? { municipioNacimiento: '' }
        : {}),
      ...(name === 'paisResidencia'
        ? { departamentoResidencia: '', municipioResidencia: '' }
        : {}),
      ...(name === 'departamentoResidencia'
        ? { municipioResidencia: '' }
        : {}),
      ...(name === 'discapacidad' && value !== 'SI'
        ? { detalleDiscapacidad: '' }
        : {}),
      ...(name === 'poblacionDesplazada' && value !== 'SI'
        ? { fechaDesplazamiento: '' }
        : {}),
      ...(name === 'tipoDocumento'
        ? { numeroDocumento: '' }
        : {}),
    }));
  };

 // Envío del formulario (conexión a FastAPI + descarga automática de PDF)
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    // 1) Creamos el registro y extraemos el nuevo documento
    const res1 = await fetch('http://localhost:8010/pre_registration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (!res1.ok) throw new Error(`Error al registrar (${res1.status})`);
    const doc = await res1.json();          // p. ej. { _id: "68461bbbde5cb0997ac3b578", ... }
    const id  = doc._id;                    // <-- aquí tomamos _id

    alert('Estudiante registrado correctamente');
    setForm(initialForm);

    // 2) Ahora solicitamos el PDF al servicio de PDF (puerto 8015)
    const res2 = await fetch(`http://localhost:8015/pdf_pre_registro/${id}`, {
      method: 'POST',
    });
    if (!res2.ok) throw new Error(`Error al generar PDF (${res2.status})`);

    // 3) Convertimos la respuesta a blob y forzamos la descarga
    const blob = await res2.blob();
    const url  = window.URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `pre_registro_${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error(err);
    alert('Hubo un error al registrar el estudiante o descargar el PDF');
  }
};


=======
import React from 'react';
import { Box } from '@mui/material';
import VistaPrematricula from '../../components/sections/autenticacion/prematricula/vistaPrematricula';
>>>>>>> Stashed changes

/**
 * Página de prematrícula ubicada en la ruta '/autenticacion/prematricula'
 * Simplemente renderiza el componente de vista de prematrícula.
 */
const PreMatriculaPage: React.FC = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: { xs: 56, sm: 64 }, // ajusta si tienes appbar
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: 'auto',
        py: 2,
        px: { xs: 1, sm: 2, md: 4 }
      }}
    >
      <VistaPrematricula />
    </Box>
  );
};

export default PreMatriculaPage;
