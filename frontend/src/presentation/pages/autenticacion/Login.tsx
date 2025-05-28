import { ReactElement, Suspense, useState } from 'react';
import {
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  Link,
  OutlinedInput,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';  // <-- Importa Link de react-router-dom
import loginBanner from '../../assets/authentication-banners/login.png';
import IconifyIcon from '../../components/base/IconifyIcon';
import logo from '../../assets/logo/logo.png';
import Image from '../../components/base/Image';

const Login = (): ReactElement => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  // Estado para mostrar mensaje de éxito al loguearse
  const [loginSuccess, setLoginSuccess] = useState(false);

  // (llamada a backend)
  const handleLogin = () => {
    // Simulación fetch/Axios para validar
    // 
    setLoginSuccess(true);
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
    <Stack
      flex={1}
      m={2.5}
      gap={3}
      alignItems="center"
    >
      {/* Logo centrado + título */}
      <Stack alignItems="center" gap={1}>
        <Image src={logo} width={82.6} alt="Logo" />
        <Typography variant="h6" textAlign="center" fontWeight="bold">
          Institución Educativa Departamental Josué Manrique
        </Typography>
      </Stack>

      <Stack alignItems="center" gap={2.5} sx={{ width: { xs: '100%', sm: 330 } }}>
        <Typography variant="h3" textAlign="center">
          Iniciar sesión
        </Typography>

        <FormControl variant="standard" fullWidth>
          <InputLabel shrink htmlFor="email">
            Código de usuario
          </InputLabel>
          <TextField
            variant="filled"
            placeholder="Ingresa tu código de usuario"
            id="email"
            fullWidth
          />
        </FormControl>

        <FormControl variant="standard" fullWidth>
          <InputLabel shrink htmlFor="password">
            Contraseña
          </InputLabel>
          <OutlinedInput
            placeholder="********"
            type={showPassword ? 'text' : 'password'}
            id="password"
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
          />
        </FormControl>

        <Button variant="contained" fullWidth onClick={handleLogin}>
          Log in
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
            to="/authentication/sign-up"
            underline="hover"
            sx={{ ml: 0.5 }}
          >
            Formulario prematrícula
          </Link>
        </Typography>
      </Stack>
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
  </Stack>
  );
}

export default Login;
