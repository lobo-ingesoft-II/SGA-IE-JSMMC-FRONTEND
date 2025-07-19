/**
 * Utilidades para pruebas de integración con Selenium
 * 
 * Este archivo contiene funciones que facilitan las pruebas de integración
 * con Selenium, exponiendo datos y funcionalidades para que las pruebas
 * puedan interactuar con la aplicación.
 */

import { ProfesorInicioData } from '../services/PanelProfesor/inicioService';

/**
 * Expone los datos del dashboard del profesor para pruebas
 * Esta función puede ser llamada desde el código de prueba de Selenium
 */
export function exposeProfesorDashboardData(data: ProfesorInicioData): void {
  // @ts-ignore - Ignorar error de TypeScript ya que la propiedad está definida en global.d.ts
  window.profesorDashboardData = data;
}

/**
 * Obtiene los datos del dashboard del profesor para pruebas
 * Esta función puede ser llamada desde el código de prueba de Selenium
 */
export function getProfesorDashboardData(): ProfesorInicioData | undefined {
  // @ts-ignore - Ignorar error de TypeScript ya que la propiedad está definida en global.d.ts
  return window.profesorDashboardData;
}

/**
 * Activa el modo de prueba para la aplicación
 * Esta función puede ser llamada desde el código de prueba de Selenium
 */
export function enableTestMode(): void {
  const url = new URL(window.location.href);
  url.searchParams.set('test', 'true');
  window.history.replaceState({}, '', url.toString());
}

/**
 * Desactiva el modo de prueba para la aplicación
 * Esta función puede ser llamada desde el código de prueba de Selenium
 */
export function disableTestMode(): void {
  const url = new URL(window.location.href);
  url.searchParams.delete('test');
  window.history.replaceState({}, '', url.toString());
}

/**
 * Verifica si el modo de prueba está activado
 * Esta función puede ser llamada desde el código de prueba de Selenium
 */
export function isTestModeEnabled(): boolean {
  const url = new URL(window.location.href);
  return url.searchParams.get('test') === 'true';
}

// Exponer las funciones en el objeto window para que Selenium pueda acceder a ellas
declare global {
  interface Window {
    testUtils: {
      enableTestMode: typeof enableTestMode;
      disableTestMode: typeof disableTestMode;
      isTestModeEnabled: typeof isTestModeEnabled;
      getProfesorDashboardData: typeof getProfesorDashboardData;
    };
  }
}

// Inicializar el objeto testUtils en window
if (typeof window !== 'undefined') {
  window.testUtils = {
    enableTestMode,
    disableTestMode,
    isTestModeEnabled,
    getProfesorDashboardData
  };
}

export default {
  exposeProfesorDashboardData,
  getProfesorDashboardData,
  enableTestMode,
  disableTestMode,
  isTestModeEnabled
};