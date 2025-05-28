import React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Link from '@mui/material/Link';
import IconifyIcon from '../../components/base/IconifyIcon';
import signupBanner from '../../assets/authentication-banners/signup.png';
import logo from '../../assets/logo/logo.png';

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

const SignUp = () => {
  return (
    <Paper
      elevation={3}
      sx={{
        width: { xs: '90%', sm: '85%', md: '1200px' },
        margin: 'auto',
        p: { xs: 2, md: 4 },
        bgcolor: 'background.paper',
        borderRadius: 2,
      }}
    >
      {/* Encabezado con logo y título */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems="center"
        mb={4}
      >
        <img src={logo} width={60} alt="Logo IED Josué Manrique" style={{ display: 'block' }} />
        <Typography variant="h4" component="h1">
          Formulario de matrícula IED Josué Manrique
        </Typography>
      </Stack>

      {/* Sección 1: Información personal */}
      <Typography variant="h5" mb={2}>
        1. INFORMACIÓN PERSONAL DEL ESTUDIANTE
      </Typography>

      {/* Formulario en 3 columnas en desktop, en columna única en móvil */}
      <Stack spacing={4} width="100%">
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          {/* Columna 1 */}
          <Stack spacing={2} sx={{ flex: 1 }}>
            <TextField label="Apellidos" fullWidth />
            <TextField label="Nombres" fullWidth />
            <TextField label="Registro Civil N°" fullWidth />
            <TextField label="Tarjeta de Identidad N°" fullWidth />
            <TextField
              label="Fecha de Nacimiento"
              type="date"
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField label="Lugar de Nacimiento" fullWidth />
          </Stack>

          {/* Columna 2 */}
          <Stack spacing={2} sx={{ flex: 1 }}>
            <TextField label="Subcategoría SISBEN" fullWidth />
            <TextField label="Dirección de Residencia" fullWidth />
            <TextField label="Teléfono / Celular" fullWidth />
            <TextField label="Ruta Escolar" fullWidth />
            <TextField label="Seguro Médico (EPS)" fullWidth />
            <TextField label="Discapacidad" fullWidth />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Población Desplazada (SI/NO)" fullWidth />
              <TextField
                label="Fecha de Desplazamiento"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
            <TextField label="Municipio de Residencia" fullWidth />
          </Stack>

          {/* Columna 3 */}
          <Stack spacing={2} sx={{ flex: 1 }}>
            <Typography variant="h6">2. INFORMACIÓN ACADÉMICA</Typography>
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

            <Typography variant="h6" mt={3}>
              3. INFORMACIÓN FAMILIAR
            </Typography>
            <Typography variant="subtitle1" mt={1}>
              Padre
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Apellidos y Nombres" fullWidth />
              <TextField label="C.C. N°" fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Celular" fullWidth />
              <TextField label="Ocupación" fullWidth />
            </Stack>
            <Typography variant="subtitle1" mt={2}>
              Madre
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Apellidos y Nombres" fullWidth />
              <TextField label="C.C. N°" fullWidth />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField label="Celular" fullWidth />
              <TextField label="Ocupación" fullWidth />
            </Stack>
          </Stack>
        </Stack>

        {/* Botón de envío */}
        <Button variant="contained" fullWidth sx={{ mt: 4, py: 1.5 }}>
          Registrar Estudiante
        </Button>
      </Stack>
    </Paper>
  );
};

export default SignUp;
