import { ReactElement, useState, useEffect } from 'react'; 
import {
  Collapse,
  LinkTypeMap,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { OverridableComponent } from '@mui/material/OverridableComponent';
import IconifyIcon from '../../../components/base/IconifyIcon';
import { useLocation } from 'react-router-dom';
import { NavItem } from '../../../../helpers/navItem';

interface NavItemProps {
  navItem: NavItem;
  Link: OverridableComponent<LinkTypeMap>;
  'data-testid'?: string;
}

const NavButton = ({ navItem, Link, ...props }: NavItemProps): ReactElement => {
  const { pathname } = useLocation();
  const [checked, setChecked] = useState(false);
  const [nestedChecked, setNestedChecked] = useState<boolean[]>([]);

  const handleNestedChecked = (index: any, value: boolean) => {
    const updatedBooleanArray = [...nestedChecked];
    updatedBooleanArray[index] = value;
    setNestedChecked(updatedBooleanArray);
  };

  // Función auxiliar para construir la URL correctamente.
  // Si subPath no es absoluto, se concatena con basePath.
  const buildFinalHref = (basePath: string, subPath: string) => {
    if (subPath.startsWith('/')) {
      return subPath; 
    }
    const cleanBasePath = basePath.endsWith('/') && basePath.length > 1 ? basePath.slice(0, -1) : basePath;
    return `${cleanBasePath}/${subPath}`;
  };

  const isActive = (itemPath: string): boolean => {
    return pathname === itemPath; 
  };

  // Función para determinar si un padre colapsable debe permanecer expandido
  const shouldBeExpanded = (itemPath: string, sublist?: NavItem[]): boolean => {
    // Si la ruta actual coincide exactamente con el padre, debe estar expandido
    if (pathname === itemPath) return true;
    
    if (sublist) {
      return sublist.some(subItem => {
        const subItemHref = buildFinalHref(itemPath, subItem.path);
        if (subItem.collapsible && subItem.sublist) {
            return shouldBeExpanded(subItemHref, subItem.sublist);
        }
        return pathname === subItemHref;
      });
    }
    return false;
  };


  // Usamos useEffect para ajustar el estado 'checked' (expansión del padre)
  // si la ruta actual es una sub-ruta del NavItem principal.
  useEffect(() => {
    if (navItem.collapsible && navItem.sublist) {
      if (shouldBeExpanded(navItem.path, navItem.sublist)) {
        setChecked(true); // Expande el padre si una de sus sub-rutas está activa
      } else {
        // Opcional: Colapsar si la ruta actual no está en el submenú y no es la ruta del padre
        setChecked(false);
      }
    }
  }, [pathname, navItem.path, navItem.collapsible, navItem.sublist]);


  return (
    <ListItem
      {...props}
      sx={{
        my: 1.25,
        borderRadius: 2,
        backgroundColor: isActive(navItem.path) ? 'primary.main' : '',
        color: isActive(navItem.path) ? 'common.white' : 'text.secondary',
        '&:hover': {
          backgroundColor: isActive(navItem.path) ? 'primary.main' : 'action.focus',
          opacity: 1.5,
        },
      }}
    >
      {navItem.collapsible ? (
        <>
          <ListItemButton LinkComponent={Link} onClick={() => setChecked(!checked)}>
            <ListItemIcon>
              <IconifyIcon icon={navItem.icon as string} width={1} height={1} />
            </ListItemIcon>
            <ListItemText>{navItem.title}</ListItemText>
            <ListItemIcon>
              {navItem.collapsible &&
                (checked ? (
                  <IconifyIcon icon="mingcute:up-fill" width={1} height={1} />
                ) : (
                  <IconifyIcon icon="mingcute:down-fill" width={1} height={1} />
                ))}
            </ListItemIcon>
          </ListItemButton>
          <Collapse in={checked}>
            <List>
              {navItem.sublist?.map((subListItem: NavItem, idx: number) => {
                const subItemHref = buildFinalHref(navItem.path, subListItem.path);
                return (
                  <ListItem
                    key={idx}
                    sx={{
                      my: 0.5,
                      borderRadius: 2, 
                      // Resaltado para sub-items: solo si es la ruta activa exacta
                      backgroundColor: isActive(subItemHref) ? 'primary.main' : '',
                      color: isActive(subItemHref) ? 'common.white' : 'text.secondary',
                      '&:hover': {
                        backgroundColor: isActive(subItemHref) ? 'primary.main' : 'action.focus',
                        opacity: 1.5,
                      },
                    }}
                  >
                    {subListItem.collapsible ? (
                      <>
                        <ListItemButton
                          LinkComponent={Link}
                          onClick={() => {
                            handleNestedChecked(idx, !nestedChecked[idx]);
                          }}
                        >
                          <ListItemText sx={{ ml: 3.5 }}>{subListItem.title}</ListItemText>
                          <ListItemIcon>
                            {subListItem.collapsible &&
                              (nestedChecked[idx] ? (
                                <IconifyIcon icon="mingcute:up-fill" width={1} height={1} />
                              ) : (
                                <IconifyIcon icon="mingcute:down-fill" width={1} height={1} />
                              ))}
                          </ListItemIcon>
                        </ListItemButton>
                        <Collapse in={nestedChecked[idx]}>
                          <List>
                            {subListItem.sublist?.map(
                              (nestedSubListItem: NavItem, nestedIdx: number) => {
                                const nestedSubItemHref = buildFinalHref(subItemHref, nestedSubListItem.path);
                                return (
                                  <ListItem key={nestedIdx}>
                                    <ListItemButton
                                      LinkComponent={Link}
                                      href={nestedSubItemHref}
                                      // Resaltado para elementos de tercer nivel: solo si es la ruta activa exacta
                                      sx={{
                                        my: 0.5,
                                        borderRadius: 2, 
                                        backgroundColor: isActive(nestedSubItemHref) ? 'primary.main' : '',
                                        color: isActive(nestedSubItemHref) ? 'common.white' : 'text.secondary',
                                        '&:hover': {
                                          backgroundColor: isActive(nestedSubItemHref) ? 'primary.main' : 'action.focus',
                                          opacity: 1.5,
                                        },
                                      }}
                                    >
                                      <ListItemText sx={{ ml: 5 }}>
                                        {nestedSubListItem.title}
                                      </ListItemText>
                                    </ListItemButton>
                                  </ListItem>
                                );
                              },
                            )}
                          </List>
                        </Collapse>
                      </>
                    ) : (
                      <ListItemButton
                        LinkComponent={Link}
                        href={subItemHref}
                        // Resaltado para sub-items (no colapsables): solo si es la ruta activa exacta
                        sx={{
                          my: 0.5,
                          borderRadius: 2,
                          backgroundColor: isActive(subItemHref) ? 'primary.main' : '',
                          color: isActive(subItemHref) ? 'common.white' : 'text.secondary',
                          '&:hover': {
                            backgroundColor: isActive(subItemHref) ? 'primary.main' : 'action.focus',
                            opacity: 1.5,
                          },
                        }}
                      >
                        <ListItemText sx={{ ml: 3}}>{subListItem.title}</ListItemText>
                      </ListItemButton>
                    )}
                  </ListItem>
                );
              })}
            </List>
          </Collapse>
        </>
      ) : (
        <ListItemButton
          LinkComponent={Link}
          href={navItem.path}
          // Resaltado para ítem no colapsable: solo si es la ruta activa exacta
          sx={{
            backgroundColor: isActive(navItem.path) ? 'primary.main' : '',
            color: isActive(navItem.path) ? 'common.white' : 'text.secondary',
            opacity: navItem.active ? 1 : 0.6,
            '&:hover': {
              backgroundColor: isActive(navItem.path) ? 'primary.main' : 'action.focus',
              opacity: 1.5,
            },
          }}
        >
          <ListItemIcon>
            <IconifyIcon icon={navItem.icon as string} width={1} height={1} />
          </ListItemIcon>
          <ListItemText>{navItem.title}</ListItemText>
        </ListItemButton>
      )}
    </ListItem>
  );
};

export default NavButton;