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
  Snackbar,
  Alert,
  Box,
  InputLabel,
  FormControl,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import loginBanner from '../../assets/authentication-banners/login.png';
import IconifyIcon from '../../components/base/IconifyIcon';
import logo from '../../assets/logo/logo.png';
import Image from '../../components/base/Image';
import { useAuth } from '../../../context/authContext';

// Buenas prácticas: separar el estado del formulario y el handler
type LoginForm = {
  username: string;
  password: string;
};

const initialForm: LoginForm = {
  username: '',
  password: '',
};

const Login = (): ReactElement => {
  const [form, setForm] = useState<LoginForm>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Handler genérico para los campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  // Preparado para FastAPI
  const handleLogin = async () => {
    setLoading(true);
    setLoginError(null);
    setLoginSuccess(false);
    try {
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.access_token) {
          login(data.access_token);
          setLoginSuccess(true);
          setLoginError(null);
          navigate('/home', { replace: true });
        } else {
          setLoginError('Respuesta inválida del servidor');
        }
      } else {
        const data = await response.json();
        setLoginError(data.detail || 'Error al iniciar sesión');
      }
    } catch (error) {
      setLoginError('No se pudo conectar con el servidor');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
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
        {/* Logo centrado + título */}
        <Stack alignItems="center" gap={1}>
          <Image src={logo} width={82.6} alt="Logo" />
          <Typography variant="h6" textAlign="center" fontWeight="bold">
            Institución Educativa Departamental Josué Manrique
          </Typography>
        </Stack>

        <Box sx={{ width: '100%', maxWidth: 330 }}>
          <Stack alignItems="center" gap={2.5}>
            <Typography variant="h3" textAlign="center">
              Iniciar sesión
            </Typography>

            {/* Campo de usuario */}
            <TextField
              variant="filled"
              label="Código de usuario"
              placeholder="Ingresa tu código de usuario"
              id="username"
              name="username"
              fullWidth
              value={form.username}
              onChange={handleChange}
              disabled={loading}
              InputLabelProps={{ shrink: true }}
              autoComplete="username"
            />

            {/* Campo de contraseña */}
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
                      <IconifyIcon icon={showPassword ? 'ic:baseline-key-off' : 'ic:baseline-key'} />
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
              onClick={handleLogin}
              disabled={loading || !form.username || !form.password}
            >
              {loading ? 'Ingresando...' : 'Log in'}
            </Button>

            {loginSuccess && (
              <Typography variant="body1" color="success.main" mt={2}>
                ¡Credenciales correctas! Has iniciado sesión exitosamente.
              </Typography>
            )}

            {loginError && loginError !== 'No se pudo conectar con el servidor' && (
              <Typography variant="body1" color="error.main" mt={2}>
                {loginError}
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
                to="/authentication/sign-up"
                underline="hover"
                sx={{ ml: 0.5 }}
              >
                Formulario prematrícula
              </Link>
            </Typography>
          </Stack>
        </Box>
      </Stack>

      {/* Lado banner (oculto en móvil) */}
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

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          No se pudo conectar con el servidor
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default Login;