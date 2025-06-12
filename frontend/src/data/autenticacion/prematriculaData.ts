/**
 * Listado de sedes disponibles para pre-matrícula.
 */
export const sedes = [
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

/**
 * Subcategorías SISBEN por categoría.
 */
export const sisbenSubcategorias: Record<string, string[]> = {
  A: ['A1', 'A2', 'A3', 'A4', 'A5'],
  B: Array.from({ length: 7 }, (_, i) => `B${i + 1}`),
  C: Array.from({ length: 18 }, (_, i) => `C${i + 1}`),
  D: Array.from({ length: 21 }, (_, i) => `D${i + 1}`),
};

/**
 * Tipos de parentesco para acudientes.
 */
export const parentescos = [
  'Padre',
  'Madre',
  'Abuelo',
  'Abuela',
  'Tío',
  'Tía',
  'Otro',
];

/**
 * Países disponibles para nacionalidad y residencia.
 */
export const paises = [
  'COLOMBIA',
  'VENEZUELA',
  'ARGENTINA',
  'BRASIL',
  'CHILE',
  'ECUADOR',
  'PERÚ',
  'OTRO',
];

/**
 * Tipos de documento de identidad.
 */
export const tiposDocumento = [
  'Registro Civil de Nacimiento',
  'Tarjeta de Identidad',
  'Cédula de Ciudadanía',
];
