# UltraGroup Hotel App

Aplicación web desarrollada como prueba técnica para **UltraGroup** — posición Frontend Developer.  
Construida con **Angular 19+**, Angular Material y buenas prácticas de arquitectura frontend moderna.

---

## Tabla de contenidos

1. [Requisitos previos](#requisitos-previos)
2. [Instalación y ejecución](#instalación-y-ejecución)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Módulos de la aplicación](#módulos-de-la-aplicación)
5. [Decisiones técnicas](#decisiones-técnicas)
6. [Escalabilidad](#escalabilidad)
7. [Testing](#testing)
8. [Mock API](#mock-api)

---

## Módulos / URLs

| Módulo | URL | Descripción |
|---|---|---|
| Viajero (default) | `/traveler/search` | Búsqueda y reserva de hoteles |
| Administración | `/admin/hotels` | Gestión de hoteles, habitaciones y reservas |

---

## Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| Node.js | 18.x o superior |
| npm | 9.x o superior |
| Angular CLI | 17.x o superior |

```bash
npm install -g @angular/cli
```

---

## Instalación y ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar servidor de desarrollo
ng serve

# 3. Abrir en el navegador
# http://localhost:4200
```

### Comandos adicionales

```bash
# Ejecutar tests unitarios (modo headless CI)
ng test --watch=false --browsers=ChromeHeadless

# Ejecutar tests en modo watch interactivo
ng test

# Compilar para producción
ng build --configuration production
```

---

## Estructura del proyecto

```
src/
├── app/
│   ├── app.ts                     # Componente raíz (standalone)
│   ├── app.config.ts              # Bootstrap providers: HttpClient, Router, Animations, i18n
│   ├── app.routes.ts              # Ruteo raíz con lazy loading
│   │
│   ├── core/
│   │   ├── models/                # Interfaces TypeScript del dominio
│   │   │   ├── hotel.model.ts
│   │   │   ├── room.model.ts
│   │   │   ├── reservation.model.ts
│   │   │   └── index.ts
│   │   └── services/              # Servicios inyectables con Signals
│   │       ├── hotel.service.ts
│   │       ├── room.service.ts
│   │       ├── reservation.service.ts
│   │       ├── notification.service.ts
│   │       └── *.spec.ts
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── loading-spinner/   # Overlay/inline spinner configurable
│   │   │   ├── confirm-dialog/    # Diálogo de confirmación reutilizable
│   │   │   ├── status-badge/      # Badge de estado (activo/inactivo/etc.)
│   │   │   └── star-rating/       # Display de estrellas
│   │   └── pipes/
│   │       └── cop-currency.pipe.ts  # Formateo de moneda COP
│   │
│   ├── layouts/
│   │   ├── admin-layout/          # Sidenav para módulo administración
│   │   └── traveler-layout/       # Toolbar para módulo viajero
│   │
│   └── features/
│       ├── admin/                 # Módulo agencia
│       │   ├── hotels/
│       │   │   ├── hotel-list/    # Listado y gestión de hoteles
│       │   │   ├── hotel-form/    # Formulario crear/editar hotel
│       │   │   └── hotel-rooms/   # Habitaciones de un hotel
│       │   ├── rooms/
│       │   │   ├── room-list/     # Listado y gestión de habitaciones
│       │   │   └── room-form/     # Formulario crear/editar habitación
│       │   ├── reservations/
│       │   │   ├── reservation-list/    # Listado de reservas
│       │   │   └── reservation-detail/ # Detalle completo de reserva
│       │   └── admin.routes.ts
│       │
│       └── traveler/              # Módulo viajero
│           ├── search/            # Hero + búsqueda + resultados
│           ├── hotel-detail/      # Detalle del hotel con habitaciones
│           ├── booking/           # Flujo de reserva en 3 pasos
│           ├── booking-confirmation/ # Confirmación con animación
│           └── traveler.routes.ts
│
└── assets/
    └── data/
        ├── hotels.json            # 6 hoteles mock en ciudades colombianas
        ├── rooms.json             # 14 habitaciones distribuidas
        └── reservations.json      # 6 reservas de ejemplo
```

---

## Módulos de la aplicación

### Módulo Administración (`/admin`)

Perfil: **Agencia de viajes**

| Sección | Funcionalidades |
|---|---|
| **Hoteles** | Listar, crear, editar, activar/desactivar. Filtros por nombre y estado. |
| **Habitaciones** | Listar todas las habitaciones con filtros por hotel/tipo/estado. Crear, editar, activar/desactivar. Cálculo automático de costo total (base + impuestos). |
| **Reservas** | Listar todas las reservas con filtros. Ver detalle completo (huésped, contacto de emergencia, desglose de costos). |

> **Regla de negocio:** No es posible eliminar hoteles ni habitaciones — solo activar/desactivar. Esto garantiza la integridad de las reservas históricas.

### Módulo Viajero (`/traveler`)

Perfil: **Viajero / Turista**

| Pantalla | Funcionalidades |
|---|---|
| **Búsqueda** | Formulario con ciudad (obligatoria), fechas y número de huéspedes. Resultados filtrados con precio mínimo por noche. |
| **Detalle del hotel** | Información completa, calificación por estrellas, habitaciones disponibles con precios. |
| **Reserva (Stepper 3 pasos)** | Paso 1: Datos del huésped con validación. Paso 2: Contacto de emergencia. Paso 3: Resumen y confirmación. |
| **Confirmación** | Animación de éxito, detalle completo de la reserva creada. |

---

## Decisiones técnicas

### 1. Angular Signals (en lugar de NgRx)

Se optó por **Angular Signals** (`signal()`, `computed()`) como solución de gestión de estado:

- **Menor overhead:** NgRx agrega ~30-50 archivos de boilerplate (actions, reducers, selectors, effects). Signals logra el mismo resultado reactivo en el propio servicio.
- **Built-in desde Angular 16+:** No requiere dependencia externa.
- **Colocación de estado:** Cada servicio es dueño de su estado (`_hotels = signal<Hotel[]>([])`) y expone señales de solo lectura (`hotels = this._hotels.asReadonly()`).
- **Computed automático:** Las derivaciones (`activeHotels`, `hotelCount`) son reactivas sin `createSelector`.

> Cuándo preferir NgRx: estado cross-module complejo, múltiples equipos, necesidad de DevTools/time-travel debugging.

### 2. Componentes Standalone

Todos los componentes usan `standalone: true` (default desde Angular 17):

- Elimina `NgModule` — cada componente declara sus propias dependencias en `imports: []`.
- Mejora treeshaking y facilita lazy loading granular con `loadComponent()`.

### 3. Lazy Loading granular

```typescript
// admin.routes.ts
{
  path: 'hotels',
  loadComponent: () => import('./hotels/hotel-list/hotel-list.component')
    .then(m => m.HotelListComponent)
}
```

Chunks individuales por componente → menor TTI (Time to Interactive).

### 4. Reactive Forms

`ReactiveFormsModule` en todos los formularios con:

- Validaciones: `required`, `email`, `minLength`, `min/max`.
- `markAllAsTouched()` antes de submit para mostrar errores visualmente.
- `valueChanges` para cálculos en tiempo real (costo total = (baseCost + taxes) × noches).

### 5. Mock API con HttpClient

```typescript
this.http.get<Hotel[]>('assets/data/hotels.json')
  .pipe(delay(400)) // simula latencia de red
  .subscribe(...)
```

**Ventaja de escalabilidad:** Cambiar a una API real solo requiere modificar la URL — los componentes no cambian.

### 6. Internacionalización (i18n)

- `LOCALE_ID` configurado como `'es-CO'` globalmente.
- `registerLocaleData(localeEs)` en `app.config.ts`.
- `CopCurrencyPipe` usando `Intl.NumberFormat` para formatear moneda COP.

### 7. Control flow moderno (`@if` / `@for`)

```html
@if (loading()) {
  <app-loading-spinner />
} @else {
  @for (hotel of hotels(); track hotel.id) {
    <mat-card>...</mat-card>
  }
}
```

Sintaxis Angular 17+, más descriptiva y con mejor rendimiento.

---

## Escalabilidad

### Arquitectura en capas

```
Componente UI → Servicio (estado Signals) → HTTP (mock/real)
```

Los componentes **nunca** hacen llamadas HTTP directamente.

### Agregar una nueva entidad (ej: Paquetes turísticos)

1. Crear `package.model.ts` en `core/models/`
2. Agregar `packages.json` en `assets/data/`
3. Crear `PackageService` en `core/services/` (mismo patrón Signals)
4. Crear componentes en `features/admin/packages/`
5. Agregar rutas en `admin.routes.ts`

### Migrar a API real

1. Crear `environment.ts` con `apiUrl: 'https://api.ultragroup.com'`
2. En cada servicio, cambiar `'assets/data/hotels.json'` → `${environment.apiUrl}/hotels`
3. Los componentes no requieren cambios.

### Autenticación

- Crear `AuthService` con signal `currentUser`
- Crear `authGuard` con `CanActivateFn`
- Agregar `canActivate: [authGuard]` a rutas del admin

---

## Testing

### Cobertura actual

| Archivo | Tests | Qué se prueba |
|---|---|---|
| `hotel.service.spec.ts` | 10 | Estado inicial, carga HTTP, CRUD, filtros por ciudad, toggleStatus, manejo de errores |
| `reservation.service.spec.ts` | 5 | Carga, creación con cálculo de noches × precio, filtros, cancelación |

### Tecnologías

- **Jasmine** — Framework de assertions (incluido con Angular CLI)
- **Karma** — Test runner con Chrome Headless
- **HttpTestingController** — Mock de peticiones HTTP sin dependencias externas

```bash
# Una sola vez (CI)
ng test --watch=false --browsers=ChromeHeadless

# Modo watch (desarrollo)
ng test
```

---

## Mock API

### Hoteles (`assets/data/hotels.json`)
6 hoteles en ciudades colombianas: Bogotá ⭐⭐⭐⭐⭐, Medellín ⭐⭐⭐⭐, Cartagena ⭐⭐⭐⭐⭐, Santa Marta ⭐⭐⭐, Cali ⭐⭐⭐⭐ (inactivo), Bucaramanga ⭐⭐⭐⭐.

### Habitaciones (`assets/data/rooms.json`)
14 habitaciones: tipos `single`, `double`, `suite`, `family`, `penthouse`. Cada una con `baseCost`, `taxes`, `location`, `capacity`.

### Reservas (`assets/data/reservations.json`)
6 reservas con estados `confirmed`, `pending`, `cancelled` para probar todos los filtros.

---

## Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| Angular 19+ | Framework principal |
| Angular Material (azure-blue) | UI Components, Material 3 |
| Angular Signals | Gestión de estado reactivo |
| TypeScript 5.x | Tipado estático estricto |
| SCSS | Estilos con variables |
| uuid | Generación de IDs únicos |
| Jasmine / Karma | Testing unitario |

---

*Desarrollado como prueba técnica para UltraGroup — Frontend Developer.*
