import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ReservationService } from './reservation.service';
import { Reservation } from '../models';

const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 'res-001',
    hotelId: 'hotel-001',
    hotelName: 'Hotel Gran Reserva',
    roomId: 'room-001',
    roomType: 'double',
    checkIn: '2026-03-15',
    checkOut: '2026-03-18',
    guest: {
      fullName: 'Juan Pérez',
      birthDate: '1990-01-01',
      gender: 'M',
      documentType: 'CC',
      documentNumber: '12345678',
      email: 'juan@test.com',
      phone: '+57 300 000 0000',
    },
    emergencyContact: { fullName: 'María Pérez', phone: '+57 310 000 0000' },
    baseCost: 300000,
    taxes: 57000,
    totalCost: 1071000,
    status: 'confirmed',
    createdAt: '2026-02-01T00:00:00.000Z',
  },
];

describe('ReservationService', () => {
  let service: ReservationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReservationService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(ReservationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debería cargar reservas desde el JSON mock', fakeAsync(() => {
    service.loadReservations().subscribe(reservations => {
      expect(reservations.length).toBe(1);
      expect(service.reservations().length).toBe(1);
    });

    httpMock.expectOne('assets/data/reservations.json').flush(MOCK_RESERVATIONS);
    tick(400); // avanza el delay(400) del servicio
  }));

  it('debería crear una reserva y calcular el costo total correctamente', fakeAsync(() => {
    service.loadReservations().subscribe();
    httpMock.expectOne('assets/data/reservations.json').flush(MOCK_RESERVATIONS);
    tick(400); // avanza el delay(400) de loadReservations

    const dto = {
      hotelId: 'hotel-002',
      hotelName: 'Hotel Medellín',
      roomId: 'room-005',
      roomType: 'single',
      checkIn: '2026-04-10',
      checkOut: '2026-04-12', // 2 noches
      guest: {
        fullName: 'Ana García',
        birthDate: '1995-05-15',
        gender: 'F' as const,
        documentType: 'CC' as const,
        documentNumber: '987654321',
        email: 'ana@test.com',
        phone: '+57 315 000 0000',
      },
      emergencyContact: { fullName: 'Luis García', phone: '+57 316 000 0000' },
      baseCost: 180000,
      taxes: 34200,
    };

    let created: Reservation | undefined;
    service.createReservation(dto).subscribe(reservation => { created = reservation; });
    tick(800); // avanza el delay(800) de createReservation

    // 2 noches × (180000 + 34200) = 428400
    expect(created!.totalCost).toBe((180000 + 34200) * 2);
    expect(created!.status).toBe('confirmed');
    expect(created!.id).toBeTruthy();
    expect(service.reservations().length).toBe(2);
    expect(service.lastCreated()?.id).toBe(created!.id);
  }));

  it('debería filtrar reservas por hotel', fakeAsync(() => {
    service.loadReservations().subscribe();
    httpMock.expectOne('assets/data/reservations.json').flush(MOCK_RESERVATIONS);
    tick(400); // avanza el delay(400) para que _reservations se actualice

    const hotelReservations = service.getReservationsByHotel('hotel-001');
    expect(hotelReservations.length).toBe(1);
    expect(service.getReservationsByHotel('hotel-999').length).toBe(0);
  }));

  it('debería cancelar una reserva existente', fakeAsync(() => {
    service.loadReservations().subscribe();
    httpMock.expectOne('assets/data/reservations.json').flush(MOCK_RESERVATIONS);
    tick(400); // avanza el delay(400) para que _reservations tenga los datos

    let cancelled: Reservation | undefined;
    service.cancelReservation('res-001').subscribe(res => { cancelled = res; });
    tick(500); // avanza el delay(500) de cancelReservation

    expect(cancelled!.status).toBe('cancelled');
    expect(service.getReservationById('res-001')?.status).toBe('cancelled');
  }));
});
