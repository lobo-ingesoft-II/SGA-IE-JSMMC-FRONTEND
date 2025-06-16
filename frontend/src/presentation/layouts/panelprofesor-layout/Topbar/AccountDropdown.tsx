import {
  Avatar,
  Button,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import IconifyIcon from "../../../components/base/IconifyIcon";
import { MouseEvent, useState, useEffect } from "react";
import { getProfesorInicioData } from "../../../../services/PanelProfesor/inicioService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/authContext";

const AccountDropdown = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [nombreCompleto, setNombreCompleto] = useState("Usuario");
  const open = Boolean(anchorEl);

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await getProfesorInicioData();
        if (data?.nombre && data?.apellidos) {
          setNombreCompleto(`${data.nombre} ${data.apellidos}`);
        } else if (data?.nombre) {
          setNombreCompleto(data.nombre);
        }
      } catch (err) {
        console.error("Error al cargar el nombre del profesor:", err);
      }
    })();
  }, []);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  const handlePerfil = () => {
    const id = user?.id;
    if (id) {
      const ruta =
        user.role === "profesor"
          ? `/PanelProfesor/${id}/Inicio`
          : `/PanelAdministrador/Inicio/${id}`;
      navigate(ruta, { replace: true });
    }
    handleClose();
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:8009/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      logout();
      navigate("/autenticacion/login", { replace: true });
    }
  };

  return (
    <>
      <Button
        color="inherit"
        id="account-dropdown-button"
        aria-controls={open ? "account-dropdown-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        sx={{
          borderRadius: 2,
          gap: 1.875,
          px: { xs: 0, sm: 0.625 },
          py: 0.625,
        }}
      >
        <Tooltip title={nombreCompleto} placement="top" arrow>
          <Avatar sx={{ width: 45, height: 45, bgcolor: "primary.main" }}>
            <IconifyIcon icon="mdi:account" width={24} height={24} color="white" />
          </Avatar>
        </Tooltip>
        <Typography
          variant="body1"
          color="text.primary"
          display={{ xs: "none", sm: "block" }}
        >
          {nombreCompleto}
        </Typography>
        <IconifyIcon
          icon="ion:caret-down-outline"
          width={24}
          height={24}
          color="text.primary"
          display={{ xs: "none", sm: "block" }}
        />
      </Button>

      <Menu
        id="account-dropdown-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{ "aria-labelledby": "account-dropdown-button" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handlePerfil}>
          <ListItemIcon>
            <IconifyIcon icon="ion:home-sharp" />
          </ListItemIcon>
          <ListItemText>Perfil</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <IconifyIcon icon="material-symbols:logout" />
          </ListItemIcon>
          <ListItemText>Cerrar sesión</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default AccountDropdown;
