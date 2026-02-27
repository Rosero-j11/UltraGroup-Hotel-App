export type HotelStatus = 'active' | 'inactive';

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

export interface CreateHotelDto {
  name: string;
  description: string;
  city: string;
  address: string;
  stars: number;
  imageUrl: string;
}

export interface UpdateHotelDto extends Partial<CreateHotelDto> {
  id: string;
  status?: HotelStatus;
}
