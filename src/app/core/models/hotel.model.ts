/**
 * Estado posible de un hotel en el sistema.
 * - `active`: visible y reservable para viajeros.
 * - `inactive`: oculto en el portal de búsqueda.
 */
export type HotelStatus = 'active' | 'inactive';

/**
 * Entidad principal que representa un hotel en la base de datos (localStorage + JSON).
 * Los campos `createdAt` y `updatedAt` se almacenan como strings ISO 8601.
 */
export interface Hotel {
  id: string;
  name: string;
  description: string;
  city: string;
  address: string;
  stars: number;
  imageUrl: string;
  status: HotelStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO (Data Transfer Object) que el formulario de creación envía al servicio.
 * No incluye campos auto-generados (id, status, timestamps).
 */
export interface CreateHotelDto {
  name: string;
  description: string;
  city: string;
  address: string;
  stars: number;
  imageUrl: string;
}

/**
 * DTO para actualizar un hotel existente.
 * Extiende `Partial<CreateHotelDto>`, por lo que todos los campos del DTO
 * base son opcionales. Solo `id` es obligatorio.
 * Permite además cambiar el `status` sin pasar por la lógica de `toggle`.
 */
export interface UpdateHotelDto extends Partial<CreateHotelDto> {
  id: string;
  status?: HotelStatus;
}
