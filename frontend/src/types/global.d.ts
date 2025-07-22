import { ProfesorInicioData } from '../services/PanelProfesor/inicioService';
import { NavItem } from '../helpers/navItem';
import { Sede } from '../models/PanelProfesor/sede';
import { CursoConSede } from '../services/PanelProfesor/sedeService';
import { Curso } from '../models/PanelProfesor/curso';
import { Estudiante } from '../models/PanelProfesor/estudiante';
import { MateriaDetalle } from '../services/PanelProfesor/asignaturaService';

declare global {
  interface Window {
    profesorDashboardData?: ProfesorInicioData;
    sidebarNavItems?: NavItem[];
    sedeData?: {
      sede: Sede;
      cursos: CursoConSede[];
    };
    cursoData?: {
      curso: Curso;
      estudiantes: Estudiante[];
    };
    asignaturaData?: {
      materia: MateriaDetalle;
      profesor: { id: string; nombre: string };
      edicionBloqueada: boolean;
    };
    testUtils?: {
      enableTestMode: () => void;
      disableTestMode: () => void;
      isTestModeEnabled: () => boolean;
      getProfesorDashboardData: () => ProfesorInicioData | undefined;
    };
  }
}

export {};