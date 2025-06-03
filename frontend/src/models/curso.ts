import { Materia } from './materia';
import { Sede } from './sede';

export interface Curso {
  id: string;
  nombre: string;
  grado: string;
  materias: Materia[];
  sede: Sede;  
}
