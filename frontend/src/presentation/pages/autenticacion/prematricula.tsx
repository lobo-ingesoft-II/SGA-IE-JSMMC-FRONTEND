import React, { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid';
import logo from '../../assets/logo/logo.png';
import { departamentos } from '../../../data/departamentos'; // Ajusta la ruta si es necesario

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

const SignUp = () => {
const [categoriaSisben, setCategoriaSisben] = useState('');
const [subcategoriaSisben, setSubcategoriaSisben] = useState('');
const [paisNacimiento, setPaisNacimiento] = useState('COLOMBIA');
const [departamentoNacimiento, setDepartamentoNacimiento] = useState('');
const [municipioNacimiento, setMunicipioNacimiento] = useState('');
const [poblacionDesplazada, setPoblacionDesplazada] = useState('');
const [fechaDesplazamiento, setFechaDesplazamiento] = useState('');

// Para residencia
const [paisResidencia, setPaisResidencia] = useState('COLOMBIA');
const [departamentoResidencia, setDepartamentoResidencia] = useState('');
const [municipioResidencia, setMunicipioResidencia] = useState('');

// Discapacidad
const [discapacidad, setDiscapacidad] = useState('');
const [detalleDiscapacidad, setDetalleDiscapacidad] = useState('');

// Documento
const [tipoDocumento, setTipoDocumento] = useState('');
const [numeroDocumento, setNumeroDocumento] = useState('');

const handleCategoriaSisbenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
setCategoriaSisben(e.target.value);
setSubcategoriaSisben('');
};

const handleDepartamentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
setDepartamentoNacimiento(e.target.value);
setMunicipioNacimiento('');
};

const handlePaisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
setPaisNacimiento(e.target.value);
setDepartamentoNacimiento('');
setMunicipioNacimiento('');
};

// Lista de departamentos solo si país es Colombia
const departamentosColombia = departamentos.map(dep => dep.nombre);

// Municipios según departamento seleccionado
const municipiosDepartamentoNacimiento =
departamentos.find(dep => dep.nombre === departamentoNacimiento)?.municipios || [];

const municipiosDepartamentoResidencia =
departamentos.find(dep => dep.nombre === departamentoResidencia)?.municipios || [];

const theme = useTheme();
const isDesktop = useMediaQuery(theme.breakpoints.up('md'));

// Estilos para igualar el ancho de los campos en filas
// Ya no se usa fieldStyle para los TextField, solo para el div vacío
const fieldStyle = { flex: 1 };

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
}
}}
>
<Stack direction="column" spacing={2} alignItems="center" justifyContent="center" mb={4} >
<img src={logo} width={90} alt="Logo IED Josué Manrique" style={{ display: 'block' }} />
<Typography variant="h4" component="h1" align="center">
Formulario de matrícula IED Josué Manrique
</Typography>
</Stack>

{/* INFORMACIÓN PERSONAL */}
  <Typography variant="h5" mb={2}>
    1. INFORMACIÓN PERSONAL DEL ESTUDIANTE
  </Typography>
  {isDesktop ? (
    <Stack direction="row" spacing={3} width="100%" mb={4}>
      <Stack spacing={2} sx={{ flex: 1 }}>
        <TextField label="Apellidos" fullWidth />
        <TextField label="Nombres" fullWidth />
        <TextField
          select
          label="Tipo de documento"
          fullWidth
          value={tipoDocumento}
          onChange={e => {
            setTipoDocumento(e.target.value);
            setNumeroDocumento('');
          }}
        >
          <MenuItem value="">Seleccione</MenuItem>
          {tiposDocumento.map((tipo) => (
            <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
          ))}
        </TextField>
        {tipoDocumento && (
          <TextField
            label="Número de documento (sin puntos ni comas)"
            fullWidth
            value={numeroDocumento}
            onChange={e => setNumeroDocumento(e.target.value)}
          />
        )}
        <TextField
          label="Fecha de Nacimiento"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          select
          label="País de Nacimiento"
          fullWidth
          value={paisNacimiento}
          onChange={handlePaisChange}
        >
          <MenuItem value="COLOMBIA">COLOMBIA</MenuItem>
          <MenuItem value="VENEZUELA">VENEZUELA</MenuItem>
          {paises.filter(p => p !== 'COLOMBIA' && p !== 'VENEZUELA').map(pais => (
            <MenuItem key={pais} value={pais}>{pais}</MenuItem>
          ))}
        </TextField>
        {paisNacimiento === 'COLOMBIA' && (
          <TextField
            select
            label="Departamento de Nacimiento"
            fullWidth
            value={departamentoNacimiento}
            onChange={handleDepartamentoChange}
          >
            <MenuItem value="">Seleccione</MenuItem>
            {departamentosColombia.map(dep => (
              <MenuItem key={dep} value={dep}>{dep}</MenuItem>
            ))}
          </TextField>
        )}
        {paisNacimiento === 'COLOMBIA' && departamentoNacimiento && (
          <TextField
            select
            label="Municipio de Nacimiento"
            fullWidth
            value={municipioNacimiento}
            onChange={e => setMunicipioNacimiento(e.target.value)}
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
          fullWidth
          value={categoriaSisben}
          onChange={handleCategoriaSisbenChange}
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
          fullWidth
          value={subcategoriaSisben}
          onChange={e => setSubcategoriaSisben(e.target.value)}
          disabled={!categoriaSisben}
        >
          <MenuItem value="">Seleccione</MenuItem>
          {categoriaSisben &&
            sisbenSubcategorias[categoriaSisben].map((sub) => (
              <MenuItem key={sub} value={sub}>
                {sub}
              </MenuItem>
            ))}
        </TextField>
      </Stack>
      <Stack spacing={2} sx={{ flex: 1 }}>
        <TextField label="Dirección de Residencia" fullWidth />
        <TextField label="Teléfono / Celular" fullWidth />
        <TextField label="Ruta Escolar" fullWidth />
        <TextField label="Seguro Médico (EPS)" fullWidth />
        <TextField
          select
          label="Discapacidad"
          fullWidth
          value={discapacidad}
          onChange={e => {
            setDiscapacidad(e.target.value);
            if (e.target.value !== 'SI') setDetalleDiscapacidad('');
          }}
        >
          <MenuItem value="">Seleccione</MenuItem>
          <MenuItem value="SI">SI</MenuItem>
          <MenuItem value="NO">NO</MenuItem>
        </TextField>
        {discapacidad === 'SI' && (
          <TextField
            label="Especifique la discapacidad"
            fullWidth
            value={detalleDiscapacidad}
            onChange={e => setDetalleDiscapacidad(e.target.value)}
            multiline
            minRows={2}
          />
        )}
        <Stack direction="row" spacing={2} width="100%">
          <TextField
            select
            label="Población Desplazada"
            fullWidth
            value={poblacionDesplazada}
            onChange={e => {
              setPoblacionDesplazada(e.target.value);
              if (e.target.value !== 'SI') setFechaDesplazamiento('');
            }}
          >
            <MenuItem value="">Seleccione</MenuItem>
            <MenuItem value="SI">SI</MenuItem>
            <MenuItem value="NO">NO</MenuItem>
          </TextField>
          {poblacionDesplazada === 'SI' && (
            <TextField
              label="Fecha de Desplazamiento"
              type="date"
              fullWidth
              value={fechaDesplazamiento}
              onChange={e => setFechaDesplazamiento(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          )}
        </Stack>
        <TextField
          select
          label="País de Residencia"
          fullWidth
          value={paisResidencia}
          onChange={e => {
            setPaisResidencia(e.target.value);
            setDepartamentoResidencia('');
            setMunicipioResidencia('');
          }}
        >
          <MenuItem value="COLOMBIA">COLOMBIA</MenuItem>
          <MenuItem value="VENEZUELA">VENEZUELA</MenuItem>
          {paises.filter(p => p !== 'COLOMBIA' && p !== 'VENEZUELA').map(pais => (
            <MenuItem key={pais} value={pais}>{pais}</MenuItem>
          ))}
        </TextField>
        {paisResidencia === 'COLOMBIA' && (
          <TextField
            select
            label="Departamento de Residencia"
            fullWidth
            value={departamentoResidencia}
            onChange={e => {
              setDepartamentoResidencia(e.target.value);
              setMunicipioResidencia('');
            }}
          >
            <MenuItem value="">Seleccione</MenuItem>
            {departamentosColombia.map(dep => (
              <MenuItem key={dep} value={dep}>{dep}</MenuItem>
            ))}
          </TextField>
        )}
        {paisResidencia === 'COLOMBIA' && departamentoResidencia && (
          <TextField
            select
            label="Municipio de Residencia"
            fullWidth
            value={municipioResidencia}
            onChange={e => setMunicipioResidencia(e.target.value)}
          >
            <MenuItem value="">Seleccione</MenuItem>
            {municipiosDepartamentoResidencia.map(mun => (
              <MenuItem key={mun} value={mun}>{mun}</MenuItem>
            ))}
          </TextField>
        )}
      </Stack>
    </Stack>
    ) : (
      <Stack spacing={2} width="100%" mb={4}>
        {/* Todos los campos en una sola columna para móvil */}
        <TextField label="Apellidos" fullWidth />
        <TextField label="Nombres" fullWidth />
        <TextField
          select
          label="Tipo de documento"
          fullWidth
          value={tipoDocumento}
          onChange={e => {
            setTipoDocumento(e.target.value);
            setNumeroDocumento('');
          }}
        >
          <MenuItem value="">Seleccione</MenuItem>
          {tiposDocumento.map((tipo) => (
            <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>
          ))}
        </TextField>
        {tipoDocumento && (
          <TextField
            label="Número de documento (sin puntos ni comas)"
            fullWidth
            value={numeroDocumento}
            onChange={e => setNumeroDocumento(e.target.value)}
          />
        )}
        <TextField
          label="Fecha de Nacimiento"
          type="date"
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          select
          label="País de Nacimiento"
          fullWidth
          value={paisNacimiento}
          onChange={handlePaisChange}
        >
          <MenuItem value="COLOMBIA">COLOMBIA</MenuItem>
          <MenuItem value="VENEZUELA">VENEZUELA</MenuItem>
          {paises.filter(p => p !== 'COLOMBIA' && p !== 'VENEZUELA').map(pais => (
            <MenuItem key={pais} value={pais}>{pais}</MenuItem>
          ))}
        </TextField>
        {paisNacimiento === 'COLOMBIA' && (
          <TextField
            select
            label="Departamento de Nacimiento"
            fullWidth
            value={departamentoNacimiento}
            onChange={handleDepartamentoChange}
          >
            <MenuItem value="">Seleccione</MenuItem>
            {departamentosColombia.map(dep => (
              <MenuItem key={dep} value={dep}>{dep}</MenuItem>
            ))}
          </TextField>
        )}
        {paisNacimiento === 'COLOMBIA' && departamentoNacimiento && (
          <TextField
            select
            label="Municipio de Nacimiento"
            fullWidth
            value={municipioNacimiento}
            onChange={e => setMunicipioNacimiento(e.target.value)}
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
          fullWidth
          value={categoriaSisben}
          onChange={handleCategoriaSisbenChange}
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
          fullWidth
          value={subcategoriaSisben}
          onChange={e => setSubcategoriaSisben(e.target.value)}
          disabled={!categoriaSisben}
        >
          <MenuItem value="">Seleccione</MenuItem>
          {categoriaSisben &&
            sisbenSubcategorias[categoriaSisben].map((sub) => (
              <MenuItem key={sub} value={sub}>
                {sub}
              </MenuItem>
            ))}
        </TextField>
        <TextField label="Dirección de Residencia" fullWidth />
        <TextField label="Teléfono / Celular" fullWidth />
        <TextField label="Ruta Escolar" fullWidth />
        <TextField label="Seguro Médico (EPS)" fullWidth />
        <TextField
          select
          label="Discapacidad"
          fullWidth
          value={discapacidad}
          onChange={e => {
            setDiscapacidad(e.target.value);
            if (e.target.value !== 'SI') setDetalleDiscapacidad('');
          }}
        >
          <MenuItem value="">Seleccione</MenuItem>
          <MenuItem value="SI">SI</MenuItem>
          <MenuItem value="NO">NO</MenuItem>
        </TextField>
        {discapacidad === 'SI' && (
          <TextField
            label="Especifique la discapacidad"
            fullWidth
            value={detalleDiscapacidad}
            onChange={e => setDetalleDiscapacidad(e.target.value)}
            multiline
            minRows={2}
          />
        )}
        <TextField
          select
          label="Población Desplazada"
          fullWidth
          value={poblacionDesplazada}
          onChange={e => {
            setPoblacionDesplazada(e.target.value);
            if (e.target.value !== 'SI') setFechaDesplazamiento('');
          }}
        >
          <MenuItem value="">Seleccione</MenuItem>
          <MenuItem value="SI">SI</MenuItem>
          <MenuItem value="NO">NO</MenuItem>
        </TextField>
        {poblacionDesplazada === 'SI' && (
          <TextField
            label="Fecha de Desplazamiento"
            type="date"
            fullWidth
            value={fechaDesplazamiento}
            onChange={e => setFechaDesplazamiento(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        )}
        <TextField
          select
          label="País de Residencia"
          fullWidth
          value={paisResidencia}
          onChange={e => {
            setPaisResidencia(e.target.value);
            setDepartamentoResidencia('');
            setMunicipioResidencia('');
          }}
        >
          <MenuItem value="COLOMBIA">COLOMBIA</MenuItem>
          <MenuItem value="VENEZUELA">VENEZUELA</MenuItem>
          {paises.filter(p => p !== 'COLOMBIA' && p !== 'VENEZUELA').map(pais => (
            <MenuItem key={pais} value={pais}>{pais}</MenuItem>
          ))}
        </TextField>
        {paisResidencia === 'COLOMBIA' && (
          <TextField
            select
            label="Departamento de Residencia"
            fullWidth
            value={departamentoResidencia}
            onChange={e => {
              setDepartamentoResidencia(e.target.value);
              setMunicipioResidencia('');
            }}
          >
            <MenuItem value="">Seleccione</MenuItem>
            {departamentosColombia.map(dep => (
              <MenuItem key={dep} value={dep}>{dep}</MenuItem>
            ))}
          </TextField>
        )}
        {paisResidencia === 'COLOMBIA' && departamentoResidencia && (
          <TextField
            select
            label="Municipio de Residencia"
            fullWidth
            value={municipioResidencia}
            onChange={e => setMunicipioResidencia(e.target.value)}
          >
            <MenuItem value="">Seleccione</MenuItem>
            {municipiosDepartamentoResidencia.map(mun => (
              <MenuItem key={mun} value={mun}>{mun}</MenuItem>
            ))}
          </TextField>
        )}
      </Stack>
    )}

    {/* INFORMACIÓN ACADÉMICA */}
    <Typography variant="h5" mb={2} mt={4}>
      2. INFORMACIÓN ACADÉMICA
    </Typography>
    {isDesktop ? (
      <Stack direction="row" spacing={3} width="100%" mb={4}>
        <Stack spacing={2} sx={{ flex: 1 }}>
          <TextField label="Grado al que ingresa" fullWidth />
          <TextField label="Institución de donde viene" fullWidth />
        </Stack>
        <Stack spacing={2} sx={{ flex: 1 }}>
          <TextField label="Municipio" fullWidth />
          <TextField select label="Sede" fullWidth defaultValue="">
            {sedes.map((sede) => (
              <MenuItem key={sede} value={sede}>
                {sede}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>
    ) : (
      <Stack spacing={2} width="100%" mb={4}>
        <TextField label="Grado al que ingresa" fullWidth />
        <TextField label="Institución de donde viene" fullWidth />
        <TextField label="Municipio" fullWidth />
        <TextField select label="Sede" fullWidth defaultValue="">
          {sedes.map((sede) => (
            <MenuItem key={sede} value={sede}>
              {sede}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
    )}

    {/* INFORMACIÓN FAMILIAR */}
    <Typography variant="h5" mb={2} mt={4}>
      3. INFORMACIÓN FAMILIAR
    </Typography>
    <Stack spacing={2} width="100%" mb={4}>
      <Typography variant="subtitle1" mt={1}>
        Padre
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} width="100%">
        <TextField label="Apellidos" fullWidth />
        <TextField label="Nombres" fullWidth />
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} width="100%">
        <TextField label="C.C. N°" fullWidth />
        <TextField label="Celular" fullWidth />
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} width="100%">
        <TextField label="Ocupación" fullWidth />
        <div style={{ flex: 1 }} />
      </Stack>

      <Typography variant="subtitle1" mt={2}>
        Madre
      </Typography>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} width="100%">
        <TextField label="Apellidos" fullWidth />
        <TextField label="Nombres" fullWidth />
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} width="100%">
        <TextField label="C.C. N°" fullWidth />
        <TextField label="Celular" fullWidth />
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} width="100%">
        <TextField label="Ocupación" fullWidth />
        <div style={{ flex: 1 }} />
      </Stack>
    </Stack>

  
    <Button variant="contained" fullWidth sx={{ mt: 4, py: 1.5 }}>
      Registrar Estudiante
    </Button>
  </Paper>

);
};

export default SignUp;