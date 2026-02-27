import { ApplicationConfig, provideBrowserGlobalErrorListeners, LOCALE_ID } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es-CO';

import { routes } from './app.routes';

// Registra los datos de localización de Colombia (formatos de fecha,
// separadores de miles/decimales, etc.) antes de inicializar la app.
registerLocaleData(localeEs);

/**
 * Configuración global de la aplicación Angular (standalone bootstrap).
 *
 * ### Providers relevantes
 * - `provideRouter` con `withComponentInputBinding()`: permite pasar parámetros de ruta
 *   como @Input() en los componentes (p.ej. `id` en hotel-detail desde la URL).
 * - `withViewTransitions()`: animaciones nativas del browser entre rutas (View Transitions API).
 * - `provideHttpClient()`: habilita HttpClient para carga de JSON de assets.
 * - `provideAnimationsAsync()`: carga Angular Animations de forma lazy para mejor performance.
 * - `LOCALE_ID: 'es-CO'`: fija la localización para pipes como `DatePipe` y `CurrencyPipe`.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(), withViewTransitions()),
    provideHttpClient(),
    provideAnimationsAsync(),
    { provide: LOCALE_ID, useValue: 'es-CO' },
  ]
};
