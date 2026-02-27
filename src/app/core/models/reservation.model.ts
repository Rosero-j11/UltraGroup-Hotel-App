/** Tipos de documento de identidad aceptados en Colombia. */
export type DocumentType = 'CC' | 'CE' | 'PASSPORT' | 'NIT';

/** Géneros disponibles para el registro del huésped. */
export type Gender = 'M' | 'F' | 'OTHER';

/**
 * Estado del ciclo de vida de una reserva.
 * - `pending`:   creada pero aún no procesada (no usado actualmente).
 * - `confirmed`: flujo de booking completado exitosamente.
 * - `cancelled`: cancelada desde el panel de administración.
 */
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

/** Datos del huésped principal que ocupa la habitación. */
export interface Guest {
  fullName: string;
  birthDate: string;
  gender: Gender;
  documentType: DocumentType;
  documentNumber: string;
  email: string;
  phone: string;
}

/** Contacto de emergencia obligatorio para toda reserva. */
export interface EmergencyContact {
  fullName: string;
  phone: string;
}

/**
 * Entidad completa de una reserva confirmada.
 * `totalCost` = (baseCost + taxes) × noches.
 * Fechas almacenadas como strings ISO 8601 para compatibilidad con JSON/localStorage.
 */
export interface Reservation {
  id: string;
  hotelId: string;
  hotelName: string;
  roomId: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guest: Guest;
  emergencyContact: EmergencyContact;
  totalCost: number;
  baseCost: number;
  taxes: number;
  status: ReservationStatus;
  createdAt: string;
}

/**
 * DTO que el componente `BookingComponent` construye al finalizar el stepper.
 * El servicio calcula internamente `totalCost` a partir de `baseCost`, `taxes`
 * y el número de noches derivado de `checkIn`/`checkOut`.
 */
export interface CreateReservationDto {
  hotelId: string;
  hotelName: string;
  roomId: string;
  roomType: string;
  checkIn: string;
  checkOut: string;
  guest: Guest;
  emergencyContact: EmergencyContact;
  baseCost: number;
  taxes: number;
}

/**
 * Parámetros que el buscador del viajero envía al servicio de hoteles
 * para filtrar resultados por ciudad, fechas y número de huéspedes.
 */
export interface SearchHotelParams {
  city: string;
  checkIn: string;
  checkOut?: string;
  guests?: number;
}
