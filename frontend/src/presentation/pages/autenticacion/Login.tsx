import { ReactElement, Suspense, useState } from 'react';
import {
  Button,
  IconButton,
  InputAdornment,
  Link,
  OutlinedInput,
  Skeleton,
  Stack,
  TextField,
  Typography,
  Box,
  InputLabel,
  FormControl,
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import loginBanner from '../../assets/authentication-banners/login.png';
import IconifyIcon from '../../components/base/IconifyIcon';
import logo from '../../assets/logo/logo.png';
import Image from '../../components/base/Image';
import { useAuth } from '../../../context/authContext';

type LoginForm = {
  email: string;
  password: string;
};

const initialForm: LoginForm = {
  email: '',
  password: '',
};

const Login = (): ReactElement => {
  const [form, setForm] = useState<LoginForm>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleLogin = async (e?: React.FormEvent) => {
  if (e) e.preventDefault();
  setLoading(true);
  setLoginError(null);
  setLoginSuccess(false);

  try {
    const response = await fetch('http://localhost:8009/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: form.email,
        contrasena: form.password,
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      setLoginError(data.detail || 'Error al iniciar sesión');
      return;
    }

    const data = await response.json();
    const { access_token, rol, id, correo } = data;

    const userData = {
      id,
      name: 'Nombre no disponible', // Puedes actualizar si tu backend devuelve el nombre
      email: correo,
      role: rol,
    };

    // Guardar en localStorage
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));

login(access_token, userData);
    setLoginSuccess(true);

    // Redirigir según rol e ID
    let ruta = '/';
    if (rol === 'administrador') ruta = `/PanelAdministrador/${id}/Inicio`;
    else if (rol === 'profesor') ruta = `/PanelProfesor/${id}/Inicio`;
    else if (rol === 'acudiente') ruta = `/PanelAcudiente/${id}/Inicio`;

    navigate(ruta, { replace: true });
  } catch (error) {
    setLoginError('No se pudo conectar con el servidor');
  } finally {
    setLoading(false);
  }
};


  const handleCloseSnackbar = () => {
    setLoginError(null);
  };

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      bgcolor="background.paper"
      boxShadow={(theme) => theme.shadows[3]}
      sx={{
        width: { xs: '90%', md: 960 },
        height: { xs: 'auto', md: 560 },
        m: 'auto',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      {/* Lado formulario */}
      <Stack flex={1} m={2.5} gap={3} alignItems="center">
        <Stack alignItems="center" gap={1}>
          <Image src={logo} width={82.6} alt="Logo" />
          <Typography variant="h6" textAlign="center" fontWeight="bold">
            Institución Educativa Departamental Josué Manrique
          </Typography>
        </Stack>

        <Box sx={{ width: '100%', maxWidth: 330 }}>
          <form onSubmit={handleLogin} autoComplete="on">
            <Stack alignItems="center" gap={2.5}>
              <Typography variant="h3" textAlign="center">
                Iniciar sesión
              </Typography>

              <TextField
                variant="filled"
                label="Correo electrónico"
                placeholder="Ingresa tu correo"
                id="email"
                name="email"
                fullWidth
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                InputLabelProps={{ shrink: true }}
                autoComplete="username"
              />

              <FormControl variant="outlined" fullWidth>
                <InputLabel shrink htmlFor="password">
                  Contraseña
                </InputLabel>
                <OutlinedInput
                  placeholder="********"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        edge="end"
                        sx={{ color: 'text.secondary' }}
                      >
                        <IconifyIcon
                          icon={showPassword ? 'ic:baseline-key-off' : 'ic:baseline-key'}
                        />
                      </IconButton>
                    </InputAdornment>
                  }
                  fullWidth
                  disabled={loading}
                  label="Contraseña"
                  autoComplete="current-password"
                />
              </FormControl>

              <Button
                variant="contained"
                fullWidth
                type="submit"
                disabled={loading || !form.email || !form.password}
              >
                {loading ? 'Ingresando...' : 'Log in'}
              </Button>

              {loginSuccess && (
                <Typography variant="body1" color="success.main" mt={2}>
                  ¡Credenciales correctas! Has iniciado sesión exitosamente.
                </Typography>
              )}

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  textAlign: 'center',
                  width: '100%',
                  mt: 1,
                }}
              >
                Inscribirse como nuevo estudiante{' '}
                <Link
                  component={RouterLink}
                  to="/autenticacion/prematricula"
                  underline="hover"
                  sx={{ ml: 0.5 }}
                >
                  Formulario prematrícula
                </Link>
              </Typography>
            </Stack>
          </form>
        </Box>
      </Stack>

      {/* Lado banner */}
      <Suspense
        fallback={
          <Skeleton
            variant="rectangular"
            height="100%"
            width="100%"
            sx={{ bgcolor: 'primary.main' }}
          />
        }
      >
        <Image
          alt="Login banner"
          src={loginBanner}
          sx={{
            width: '50%',
            display: { xs: 'none', md: 'block' },
            objectFit: 'cover',
          }}
        />
      </Suspense>

      {/* Snackbar de error */}
      <Snackbar
        open={!!loginError}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <MuiAlert
          onClose={handleCloseSnackbar}
          severity="error"
          elevation={6}
          variant="filled"
          action={
            <IconButton
              size="small"
              aria-label="close"
              onClick={handleCloseSnackbar}
              sx={{ color: 'black' }}
            >
              ✕
            </IconButton>
          }
        >
          {loginError}
        </MuiAlert>
      </Snackbar>
    </Stack>
  );
};

export default Login;
