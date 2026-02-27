export type RoomType = 'single' | 'double' | 'suite' | 'family' | 'penthouse';
export type RoomStatus = 'active' | 'inactive';

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

export interface UpdateRoomDto extends Partial<Omit<CreateRoomDto, 'hotelId'>> {
  id: string;
  status?: RoomStatus;
}
