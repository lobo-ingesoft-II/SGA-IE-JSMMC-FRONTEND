export interface Observacion {
  id: string; 
  idEstudiante: string; 
  idMateria: string; 
  idProfesor: string; 
  fechaIncidente: string; 
  tipoFalta: 'Leve' | 'Grave' | 'Gravísima'; 
  articuloManualConvivencia: string; 
  descripcion: string; 
  fechaRegistro: string;
}
