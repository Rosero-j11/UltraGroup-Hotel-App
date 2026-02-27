import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HotelService } from './hotel.service';
import { Hotel } from '../models';

const MOCK_HOTELS: Hotel[] = [
  {
    id: 'hotel-001',
    name: 'Hotel Gran Reserva',
    description: 'Hotel de lujo en Bogotá',
    city: 'Bogotá',
    address: 'Cra 7 # 32-16',
    stars: 5,
    imageUrl: 'https://example.com/hotel1.jpg',
    status: 'active',
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-15T10:00:00.000Z',
  },
  {
    id: 'hotel-002',
    name: 'Hotel Medellín Plaza',
    description: 'Hotel boutique en Medellín',
    city: 'Medellín',
    address: 'Calle 10 # 40-22',
    stars: 4,
    imageUrl: 'https://example.com/hotel2.jpg',
    status: 'active',
    createdAt: '2024-02-10T09:30:00.000Z',
    updatedAt: '2024-02-10T09:30:00.000Z',
  },
  {
    id: 'hotel-003',
    name: 'Hotel Inactivo',
    description: 'Hotel deshabilitado',
    city: 'Bogotá',
    address: 'Cra 1 # 1-1',
    stars: 2,
    imageUrl: 'https://example.com/hotel3.jpg',
    status: 'inactive',
    createdAt: '2024-03-01T08:00:00.000Z',
    updatedAt: '2024-03-01T08:00:00.000Z',
  },
];

describe('HotelService', () => {
  let service: HotelService;
  let httpMock: HttpTestingController;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      providers: [
        HotelService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(HotelService);
    httpMock = TestBed.inject(HttpTestingController);
    // El constructor de HotelService llama loadHotels() automáticamente.
    // Hay que consumir esa request para que httpMock.verify() no falle.
    httpMock.expectOne('assets/data/hotels.json').flush([]);
    tick(400); // avanza el delay(400) del auto-load
  }));

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crearse correctamente', () => {
    expect(service).toBeTruthy();
  });

  it('debería iniciar con estado vacío', () => {
    expect(service.hotels()).toEqual([]);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
  });

  it('debería cargar hoteles desde el JSON mock y actualizar el signal', fakeAsync(() => {
    service.loadHotels().subscribe(hotels => {
      expect(hotels.length).toBe(3);
      expect(service.hotels().length).toBe(3);
    });

    const req = httpMock.expectOne('assets/data/hotels.json');
    expect(req.request.method).toBe('GET');
    req.flush(MOCK_HOTELS);
    tick(400); // avanza delay(400)
  }));

  it('debería calcular correctamente los hoteles activos con computed', fakeAsync(() => {
    service.loadHotels().subscribe();
    const req = httpMock.expectOne('assets/data/hotels.json');
    req.flush(MOCK_HOTELS);
    tick(400); // avanza delay(400)

    expect(service.activeHotels().length).toBe(2);
    expect(service.activeHotels().every(h => h.status === 'active')).toBe(true);
  }));

  it('debería encontrar un hotel por ID', fakeAsync(() => {
    service.loadHotels().subscribe();
    httpMock.expectOne('assets/data/hotels.json').flush(MOCK_HOTELS);
    tick(400);

    const found = service.getHotelById('hotel-001');
    expect(found).toBeDefined();
    expect(found?.name).toBe('Hotel Gran Reserva');
  }));

  it('debería retornar undefined para un ID inexistente', fakeAsync(() => {
    service.loadHotels().subscribe();
    httpMock.expectOne('assets/data/hotels.json').flush(MOCK_HOTELS);
    tick(400);

    const notFound = service.getHotelById('hotel-999');
    expect(notFound).toBeUndefined();
  }));

  it('debería filtrar hoteles por ciudad (solo activos)', fakeAsync(() => {
    service.loadHotels().subscribe();
    httpMock.expectOne('assets/data/hotels.json').flush(MOCK_HOTELS);
    tick(400);

    const bogotaHotels = service.getHotelsByCity('Bogotá');
    // hotel-001 es activo en Bogotá; hotel-003 es inactivo → no debe aparecer
    expect(bogotaHotels.length).toBe(1);
    expect(bogotaHotels[0].id).toBe('hotel-001');
  }));

  it('debería filtrar ciudades de manera case-insensitive', fakeAsync(() => {
    service.loadHotels().subscribe();
    httpMock.expectOne('assets/data/hotels.json').flush(MOCK_HOTELS);
    tick(400);

    expect(service.getHotelsByCity('BOGOTÁ').length).toBe(1);
    expect(service.getHotelsByCity('bogotá').length).toBe(1);
  }));

  it('debería crear un hotel y añadirlo al signal', fakeAsync(() => {
    service.loadHotels().subscribe();
    httpMock.expectOne('assets/data/hotels.json').flush(MOCK_HOTELS);
    tick(400);

    const newHotelDto = {
      name: 'Nuevo Hotel Test',
      description: 'Hotel creado en test',
      city: 'Cali',
      address: 'Av 1 # 2-3',
      stars: 3,
      imageUrl: 'https://example.com/new.jpg',
    };

    let created: Hotel | undefined;
    service.createHotel(newHotelDto).subscribe(hotel => { created = hotel; });
    tick(500); // avanza delay(500) de createHotel

    expect(created!.name).toBe('Nuevo Hotel Test');
    expect(created!.status).toBe('active');
    expect(created!.id).toBeTruthy();
    expect(service.hotels().length).toBe(4);
  }));

  it('debería alternar el estado del hotel entre active e inactive', fakeAsync(() => {
    service.loadHotels().subscribe();
    httpMock.expectOne('assets/data/hotels.json').flush(MOCK_HOTELS);
    tick(400);

    let updated: Hotel | undefined;
    service.toggleHotelStatus('hotel-001').subscribe(hotel => { updated = hotel; });
    tick(500); // avanza delay(500) de updateHotel (usado por toggleHotelStatus)

    expect(updated!.status).toBe('inactive');
    expect(service.getHotelById('hotel-001')?.status).toBe('inactive');
  }));

  it('debería obtener ciudades disponibles sin duplicados y ordenadas', fakeAsync(() => {
    service.loadHotels().subscribe();
    httpMock.expectOne('assets/data/hotels.json').flush(MOCK_HOTELS);
    tick(400);

    const cities = service.getAvailableCities();
    // Solo hoteles activos: Bogotá y Medellín
    expect(cities).toContain('Bogotá');
    expect(cities).toContain('Medellín');
    expect(cities).not.toContain(cities.find((c, i) => cities.indexOf(c) !== i));
  }));

  it('debería manejar el error al cargar hoteles y actualizar el signal de error', fakeAsync(() => {
    service.loadHotels().subscribe({
      error: () => {
        expect(service.error()).toBeTruthy();
        expect(service.loading()).toBe(false);
      }
    });

    const req = httpMock.expectOne('assets/data/hotels.json');
    req.error(new ErrorEvent('Network error'));
    // Los errores HTTP omiten el delay() y se propagan inmediatamente
  }));

  it('debería actualizar un hotel existente', fakeAsync(() => {
    service.loadHotels().subscribe();
    httpMock.expectOne('assets/data/hotels.json').flush(MOCK_HOTELS);
    tick(400);

    let updated: Hotel | undefined;
    service.updateHotel({ id: 'hotel-001', name: 'Nombre Actualizado' }).subscribe(hotel => { updated = hotel; });
    tick(500); // avanza delay(500) de updateHotel

    expect(updated!.name).toBe('Nombre Actualizado');
    expect(service.getHotelById('hotel-001')?.name).toBe('Nombre Actualizado');
  }));
});
