// src/components/Sidebar.tsx

import { ReactElement, useState, useEffect } from 'react';
import {
  Link,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
} from '@mui/material';

import IconifyIcon from '../../../components/base/IconifyIcon';
import logo from '../../../assets/logo/logo.png';
import Image from '../../../components/base/Image';
import NavButton from './NavButton';

import { NavItem } from '../../../../helpers/navItem';
import { fetchNavItems } from '../../../../services/PanelProfesor/navService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../context/authContext'; // Asegúrate que esta ruta sea correcta


/**
 * llama a fetchNavItems()
 * para poblar dinámicamente `navItems`. En modo desarrollo, si falla
 * la llamada, fetchNavItems() retornará un menú de prueba.
 */

const Sidebar = (): ReactElement => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [navItems, setNavItems] = useState<NavItem[]>([]);

  useEffect(() => {
    fetchNavItems()
      .then((items) => {
        setNavItems(items);
      })
      .catch((err) => {
        console.error('Error cargando navItems:', err);
      });
  }, []);

  return (
    <Stack
      justifyContent="flex-start"
      bgcolor="background.paper"
      height={1}
      boxShadow={(theme) => theme.shadows[4]}
      sx={{
        overflow: 'hidden',
        margin: { xs: 0, lg: 3.75 },
        borderRadius: { xs: 0, lg: 5 },
        '&:hover': {
          overflowY: 'auto',
        },
        width: 218,
      }}
    >
      {/* Logo que direcciona a “/” */}
      <Link
        href="/"
        sx={{
          display: 'block',
          mt: 6.25,
          mb: 1,
          mx: 'auto',
          bgcolor: 'background.paper',
          borderRadius: 5,
          width: 120,
          position: 'relative',
          zIndex: 5,
        }}
      >
        <Image
          src={logo}
          sx={{
            width: '100%',
            height: 'auto',
            display: 'block',
            margin: '0 auto',
          }}
        />
      </Link>

      <Stack
        justifyContent="space-between"
        mt={1}
        height={1}
        sx={{
          overflow: 'hidden',
          '&:hover': {
            overflowY: 'auto',
          },
          width: 218,
        }}
      >
        {/* Lista principal de NavButtons */}
        <List
          sx={{
            mx: 2.5,
            py: 1.25,
            flex: '1 1 auto',
            width: 178,
          }}
        >
          {navItems.map((navItem, index) => (
            <NavButton key={index} navItem={navItem} Link={Link} />
          ))}
        </List>

        {/* Botón fijo de “Cerrar sesión” */}
        <List sx={{ mx: 2.5 }}>
          <ListItem sx={{ mx: 0, my: 2.5 }}>
            <ListItemButton
              onClick={async () => {
                const token = localStorage.getItem('token');
                try {
                  await fetch('http://localhost:8009/logout', {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  });
                } catch (error) {
                  console.error('Error al cerrar sesión:', error);
                } finally {
                  logout(); // Limpia sesión del frontend
                  navigate('/autenticacion/login', { replace: true }); // Redirige
                }
              }}
              sx={{
                backgroundColor: 'background.paper',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'common.white',
                  opacity: 1.5,
                },
              }}
            >
              <ListItemIcon>
                <IconifyIcon icon="ri:logout-circle-line" />
              </ListItemIcon>
              <ListItemText>Cerrar sesión</ListItemText>
            </ListItemButton>
          </ListItem>
        </List>
      </Stack>
    </Stack>
  );
};

export default Sidebar;
