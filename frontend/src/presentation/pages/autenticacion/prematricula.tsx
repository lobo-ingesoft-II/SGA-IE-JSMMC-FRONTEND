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



  return (
    <Paper
      elevation={3}
      sx={{
        width: { xs: '100%', sm: '90%', md: '900px' },
        mx: 'auto',
        p: { xs: 1, sm: 2, md: 4 },
        bgcolor: 'background.paper',
        borderRadius: 2,
        '& .MuiTextField-root': {
          width: '100%',
          boxSizing: 'border-box',
        },
      }}
    >
      <form onSubmit={handleSubmit} autoComplete="off">
        <Stack direction="column" spacing={2} alignItems="center" justifyContent="center" mb={4}>
          <img src={logo} width={90} alt="Logo IED Josué Manrique" style={{ display: 'block' }} />
          <Typography variant="h4" component="h1" align="center">
            Formulario de matrícula IED Josué Manrique
          </Typography>
        </Stack>

        {/* INFORMACIÓN PERSONAL */}
        <Typography variant="h5" mb={2}>
          1. INFORMACIÓN PERSONAL DEL ESTUDIANTE
        </Typography>
        <Stack direction={isDesktop ? 'row' : 'column'} spacing={3} width="100%" mb={4}>
          <Stack spacing={2} sx={{ flex: 1 }}>
            <TextField label="Apellidos" name="apellidos" value={form.apellidos} onChange={handleChange} fullWidth />
            <TextField label="Nombres" name="nombres" value={form.nombres} onChange={handleChange} fullWidth />
            <TextField
              select
              label="Tipo de documento"
              name="tipoDocumento"
              value={form.tipoDocumento}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="">Seleccione</MenuItem>
              {tiposDocumento.map(tipo => (
                <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
              ))}
            </TextField>
            {form.tipoDocumento && (
              <TextField
                label="Número de documento (sin puntos ni comas)"
                name="numeroDocumento"
                value={form.numeroDocumento}
                onChange={handleChange}
                fullWidth
              />
            )}
            <TextField
              label="Fecha de Nacimiento"
              name="fechaNacimiento"
              type="date"
              value={form.fechaNacimiento}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              select
              label="País de Nacimiento"
              name="paisNacimiento"
              value={form.paisNacimiento}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="COLOMBIA">COLOMBIA</MenuItem>
              <MenuItem value="VENEZUELA">VENEZUELA</MenuItem>
              {paises.filter(p => p !== 'COLOMBIA' && p !== 'VENEZUELA').map(pais => (
                <MenuItem key={pais} value={pais}>{pais}</MenuItem>
              ))}
            </TextField>
            {form.paisNacimiento === 'COLOMBIA' && (
              <TextField
                select
                label="Departamento de Nacimiento"
                name="departamentoNacimiento"
                value={form.departamentoNacimiento}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="">Seleccione</MenuItem>
                {departamentosColombia.map(dep => (
                  <MenuItem key={dep} value={dep}>{dep}</MenuItem>
                ))}
              </TextField>
            )}
            {form.paisNacimiento === 'COLOMBIA' && form.departamentoNacimiento && (
              <TextField
                select
                label="Municipio de Nacimiento"
                name="municipioNacimiento"
                value={form.municipioNacimiento}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="">Seleccione</MenuItem>
                {municipiosDepartamentoNacimiento.map(mun => (
                  <MenuItem key={mun} value={mun}>{mun}</MenuItem>
                ))}
              </TextField>
            )}
            <TextField
              select
              label="Categoría SISBEN"
              name="categoriaSisben"
              value={form.categoriaSisben}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="">Seleccione</MenuItem>
              <MenuItem value="A">A</MenuItem>
              <MenuItem value="B">B</MenuItem>
              <MenuItem value="C">C</MenuItem>
              <MenuItem value="D">D</MenuItem>
            </TextField>
            <TextField
              select
              label="Subcategoría SISBEN"
              name="subcategoriaSisben"
              value={form.subcategoriaSisben}
              onChange={handleChange}
              disabled={!form.categoriaSisben}
              fullWidth
            >
              <MenuItem value="">Seleccione</MenuItem>
              {form.categoriaSisben &&
                sisbenSubcategorias[form.categoriaSisben].map(sub => (
                  <MenuItem key={sub} value={sub}>{sub}</MenuItem>
                ))}
            </TextField>
          </Stack>
          <Stack spacing={2} sx={{ flex: 1 }}>
            <TextField label="Dirección de Residencia" name="direccionResidencia" value={form.direccionResidencia} onChange={handleChange} fullWidth />
            <TextField label="Teléfono / Celular" name="telefono" value={form.telefono} onChange={handleChange} fullWidth />
            <TextField label="Ruta Escolar" name="rutaEscolar" value={form.rutaEscolar} onChange={handleChange} fullWidth />
            <TextField label="Seguro Médico (EPS)" name="seguroMedico" value={form.seguroMedico} onChange={handleChange} fullWidth />
            <TextField
              select
              label="Discapacidad"
              name="discapacidad"
              value={form.discapacidad}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="">Seleccione</MenuItem>
              <MenuItem value="SI">SI</MenuItem>
              <MenuItem value="NO">NO</MenuItem>
            </TextField>
            {form.discapacidad === 'SI' && (
              <TextField
                label="Especifique la discapacidad"
                name="detalleDiscapacidad"
                value={form.detalleDiscapacidad}
                onChange={handleChange}
                multiline
                minRows={2}
                fullWidth
              />
            )}
            <TextField
              select
              label="Población Desplazada"
              name="poblacionDesplazada"
              value={form.poblacionDesplazada}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="">Seleccione</MenuItem>
              <MenuItem value="SI">SI</MenuItem>
              <MenuItem value="NO">NO</MenuItem>
            </TextField>
            {form.poblacionDesplazada === 'SI' && (
              <TextField
                label="Fecha de Desplazamiento"
                name="fechaDesplazamiento"
                type="date"
                value={form.fechaDesplazamiento}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            )}
            <TextField
              select
              label="País de Residencia"
              name="paisResidencia"
              value={form.paisResidencia}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="COLOMBIA">COLOMBIA</MenuItem>
              <MenuItem value="VENEZUELA">VENEZUELA</MenuItem>
              {paises.filter(p => p !== 'COLOMBIA' && p !== 'VENEZUELA').map(pais => (
                <MenuItem key={pais} value={pais}>{pais}</MenuItem>
              ))}
            </TextField>
            {form.paisResidencia === 'COLOMBIA' && (
              <TextField
                select
                label="Departamento de Residencia"
                name="departamentoResidencia"
                value={form.departamentoResidencia}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="">Seleccione</MenuItem>
                {departamentosColombia.map(dep => (
                  <MenuItem key={dep} value={dep}>{dep}</MenuItem>
                ))}
              </TextField>
            )}
            {form.paisResidencia === 'COLOMBIA' && form.departamentoResidencia && (
              <TextField
                select
                label="Municipio de Residencia"
                name="municipioResidencia"
                value={form.municipioResidencia}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="">Seleccione</MenuItem>
                {municipiosDepartamentoResidencia.map(mun => (
                  <MenuItem key={mun} value={mun}>{mun}</MenuItem>
                ))}
              </TextField>
            )}
          </Stack>
        </Stack>

        {/* INFORMACIÓN ACADÉMICA */}
        <Typography variant="h5" mb={2} mt={4}>
          2. INFORMACIÓN ACADÉMICA
        </Typography>
        <Stack direction={isDesktop ? 'row' : 'column'} spacing={3} width="100%" mb={4}>
          <Stack spacing={2} sx={{ flex: 1 }}>
            <TextField label="Grado al que ingresa" name="gradoIngreso" value={form.gradoIngreso} onChange={handleChange} fullWidth />
            <TextField label="Institución de donde viene" name="institucionAnterior" value={form.institucionAnterior} onChange={handleChange} fullWidth />
          </Stack>
          <Stack spacing={2} sx={{ flex: 1 }}>
            <TextField label="Municipio" name="municipioAnterior" value={form.municipioAnterior} onChange={handleChange} fullWidth />
            <TextField
              select
              label="Sede"
              name="sede"
              value={form.sede}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="">Seleccione</MenuItem>
              {sedes.map(sede => (
                <MenuItem key={sede} value={sede}>{sede}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </Stack>

        {/* INFORMACIÓN FAMILIAR */}
        <Typography variant="h5" mb={2} mt={4}>
          3. INFORMACIÓN FAMILIAR
        </Typography>
        <Stack spacing={2} width="100%" mb={4}>
          <Typography variant="subtitle1" mt={1}>
            Acudiente 1
          </Typography>
          <Stack direction={isDesktop ? 'row' : 'column'} spacing={2} width="100%">
            <TextField
              select
              label="Parentesco"
              name="acudiente1Parentesco"
              value={form.acudiente1Parentesco}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="">Seleccione</MenuItem>
              {parentescos.map((p) => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </TextField>
            <TextField label="Apellidos" name="acudiente1Apellidos" value={form.acudiente1Apellidos} onChange={handleChange} fullWidth />
          </Stack>
          <Stack direction={isDesktop ? 'row' : 'column'} spacing={2} width="100%">
            <TextField label="Nombres" name="acudiente1Nombres" value={form.acudiente1Nombres} onChange={handleChange} fullWidth />
            <TextField label="C.C. N°" name="acudiente1CC" value={form.acudiente1CC} onChange={handleChange} fullWidth />
          </Stack>
          <Stack direction={isDesktop ? 'row' : 'column'} spacing={2} width="100%">
            <TextField label="Celular" name="acudiente1Celular" value={form.acudiente1Celular} onChange={handleChange} fullWidth />
            <TextField label="Ocupación" name="acudiente1Ocupacion" value={form.acudiente1Ocupacion} onChange={handleChange} fullWidth />
          </Stack>

          <Typography variant="subtitle1" mt={2}>
            Acudiente 2
          </Typography>
          <Stack direction={isDesktop ? 'row' : 'column'} spacing={2} width="100%">
            <TextField
              select
              label="Parentesco"
              name="acudiente2Parentesco"
              value={form.acudiente2Parentesco}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="">Seleccione</MenuItem>
              {parentescos.map((p) => (
                <MenuItem key={p} value={p}>{p}</MenuItem>
              ))}
            </TextField>
            <TextField label="Apellidos" name="acudiente2Apellidos" value={form.acudiente2Apellidos} onChange={handleChange} fullWidth />
          </Stack>
          <Stack direction={isDesktop ? 'row' : 'column'} spacing={2} width="100%">
            <TextField label="Nombres" name="acudiente2Nombres" value={form.acudiente2Nombres} onChange={handleChange} fullWidth />
            <TextField label="C.C. N°" name="acudiente2CC" value={form.acudiente2CC} onChange={handleChange} fullWidth />
          </Stack>
          <Stack direction={isDesktop ? 'row' : 'column'} spacing={2} width="100%">
            <TextField label="Celular" name="acudiente2Celular" value={form.acudiente2Celular} onChange={handleChange} fullWidth />
            <TextField label="Ocupación" name="acudiente2Ocupacion" value={form.acudiente2Ocupacion} onChange={handleChange} fullWidth />
          </Stack>
        </Stack>
        <Button type="submit" variant="contained" fullWidth sx={{ mt: 4, py: 1.5 }}>
          Registrar Estudiante
        </Button>
      </form>
    </Paper>
  );
};

export default SignUp;