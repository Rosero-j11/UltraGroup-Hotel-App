/**
 * Categorías de habitación disponibles en la plataforma.
 * Se usan como clave para mostrar etiquetas legibles en la UI
 * (p.ej. 'suite' → 'Suite', 'family' → 'Familiar').
 */
export type RoomType = 'single' | 'double' | 'suite' | 'family' | 'penthouse';

/**
 * Estado de disponibilidad de una habitación.
 * Las habitaciones `inactive` no aparecen en los resultados de búsqueda del viajero.
 */
export type RoomStatus = 'active' | 'inactive';

/**
 * Entidad que representa una habitación asociada a un hotel.
 * `taxRate` es el porcentaje de impuesto (0-100). El costo total
 * por noche se calcula como: `baseCost + baseCost * (taxRate / 100)`.
 */
export interface Room {
  id: string;
  hotelId: string;
  type: RoomType;
  baseCost: number;
  taxRate: number;
  location: string;
  description: string;
  capacity: number;
  imageUrl: string;
  status: RoomStatus;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO para crear una nueva habitación desde el panel de administración.
 * `hotelId` es requerido para asociar la habitación al hotel correcto.
 */
export interface CreateRoomDto {
  hotelId: string;
  type: RoomType;
  baseCost: number;
  taxRate: number;
  location: string;
  description: string;
  capacity: number;
  imageUrl: string;
}

/**
 * DTO para actualizar una habitación. Omite `hotelId` porque una habitación
 * no puede reasignarse a otro hotel una vez creada.
 */
export interface UpdateRoomDto extends Partial<Omit<CreateRoomDto, 'hotelId'>> {
  id: string;
  status?: RoomStatus;
}
