export type DocumentType = 'CC' | 'CE' | 'PASSPORT' | 'NIT';
export type Gender = 'M' | 'F' | 'OTHER';
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Guest {
  fullName: string;
  birthDate: string;
  gender: Gender;
  documentType: DocumentType;
  documentNumber: string;
  email: string;
  phone: string;
}

export interface EmergencyContact {
  fullName: string;
  phone: string;
}

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

export interface SearchHotelParams {
  city: string;
  checkIn: string;
  checkOut?: string;
  guests?: number;
}
