import { CreateReservationService } from '../CreateReservationService';
import { ReservationRepository } from '../../ports/out/ReservationRepository';
import { ParkingSpotRepository } from '../../ports/out/ParkingSpotRepository';
import { MessagePublisher } from '../../ports/out/MessagePublisher';
import { ParkingSpot } from '../../models/ParkingSpot';
import { Reservation } from '../../models/Reservation';
import { CreateReservationRequestDTO } from '../../dtos/ReservationDTOs';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Retourne une date locale au format YYYY-MM-DD décalée de `days` jours depuis aujourd'hui. */
function dateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const makeSpot = (overrides: Partial<ParkingSpot> = {}): ParkingSpot => ({
  id: 'spot-uuid-1',
  spotNumber: 'B01',
  row: 'B',
  position: 1,
  hasCharger: false,
  isActive: true,
  ...overrides,
});

const makeSavedReservation = (dto: CreateReservationRequestDTO): Reservation => ({
  id: 'res-uuid-1',
  userId: dto.userId,
  spotId: dto.spotId,
  date: dto.date,
  slot: dto.slot,
  status: 'pending',
  createdAt: new Date(),
});

const makeReservationRepo = (overrides: Partial<ReservationRepository> = {}): ReservationRepository => ({
  save: jest.fn().mockImplementation((data) => Promise.resolve(makeSavedReservation(data as CreateReservationRequestDTO))),
  findById: jest.fn().mockResolvedValue(null),
  findByUserId: jest.fn().mockResolvedValue([]),
  findBySpotAndDateSlot: jest.fn().mockResolvedValue(null),
  findAll: jest.fn().mockResolvedValue([]),
  updateStatus: jest.fn(),
  getRawStats: jest.fn(),
  ...overrides,
});

const makeSpotRepo = (spot: ParkingSpot | null = makeSpot()): ParkingSpotRepository => ({
  findAll: jest.fn().mockResolvedValue([]),
  findById: jest.fn().mockResolvedValue(spot),
  findAvailableSpots: jest.fn().mockResolvedValue([]),
});

const makePublisher = (): MessagePublisher => ({
  publish: jest.fn().mockResolvedValue(undefined),
});

const makeDTO = (overrides: Partial<CreateReservationRequestDTO> = {}): CreateReservationRequestDTO => ({
  userId: 'user-1',
  userRole: 'employee',
  spotId: 'spot-uuid-1',
  date: dateOffset(1),
  slot: 'AM',
  ...overrides,
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('CreateReservationService', () => {
  describe('Validation de la date', () => {
    it('rejette une date dans le passé', async () => {
      const service = new CreateReservationService(
        makeReservationRepo(),
        makeSpotRepo(),
        makePublisher()
      );
      const dto = makeDTO({ date: dateOffset(-1) });
      await expect(service.create(dto)).rejects.toThrow('Cannot reserve a date in the past');
    });

    it('accepte la date du jour (aujourd\'hui)', async () => {
      const service = new CreateReservationService(
        makeReservationRepo(),
        makeSpotRepo(),
        makePublisher()
      );
      const dto = makeDTO({ date: dateOffset(0) });
      await expect(service.create(dto)).resolves.toBeDefined();
    });
  });

  describe('Fenêtre de réservation — Employee', () => {
    it('rejette une date au-delà de la semaine courante + suivante (> 11 jours ouvrés depuis lundi)', async () => {
      const service = new CreateReservationService(
        makeReservationRepo(),
        makeSpotRepo(),
        makePublisher()
      );
      // 30 jours dans le futur dépasse toujours la fenêtre employee
      const dto = makeDTO({ userRole: 'employee', date: dateOffset(30) });
      await expect(service.create(dto)).rejects.toThrow(
        'Reservation date exceeds the allowed booking window'
      );
    });

    it('accepte une réservation demain pour un employé', async () => {
      const service = new CreateReservationService(
        makeReservationRepo(),
        makeSpotRepo(),
        makePublisher()
      );
      const dto = makeDTO({ userRole: 'employee', date: dateOffset(1) });
      await expect(service.create(dto)).resolves.toBeDefined();
    });
  });

  describe('Fenêtre de réservation — Manager', () => {
    it('accepte une réservation à 25 jours pour un manager', async () => {
      const service = new CreateReservationService(
        makeReservationRepo(),
        makeSpotRepo(),
        makePublisher()
      );
      const dto = makeDTO({ userRole: 'manager', date: dateOffset(25) });
      await expect(service.create(dto)).resolves.toBeDefined();
    });

    it('rejette une réservation à 31 jours pour un manager', async () => {
      const service = new CreateReservationService(
        makeReservationRepo(),
        makeSpotRepo(),
        makePublisher()
      );
      const dto = makeDTO({ userRole: 'manager', date: dateOffset(31) });
      await expect(service.create(dto)).rejects.toThrow(
        'Reservation date exceeds the allowed booking window (30-day)'
      );
    });
  });

  describe('Validation de la place', () => {
    it('rejette si la place n\'existe pas', async () => {
      const service = new CreateReservationService(
        makeReservationRepo(),
        makeSpotRepo(null),
        makePublisher()
      );
      await expect(service.create(makeDTO())).rejects.toThrow('is not available');
    });

    it('rejette si la place est inactive', async () => {
      const service = new CreateReservationService(
        makeReservationRepo(),
        makeSpotRepo(makeSpot({ isActive: false })),
        makePublisher()
      );
      await expect(service.create(makeDTO())).rejects.toThrow('is not available');
    });
  });

  describe('Détection de conflit', () => {
    it('rejette si la place est déjà réservée pour ce créneau', async () => {
      const existingReservation: Reservation = {
        id: 'existing-res',
        userId: 'other-user',
        spotId: 'spot-uuid-1',
        date: dateOffset(1),
        slot: 'AM',
        status: 'pending',
        createdAt: new Date(),
      };
      const reservationRepo = makeReservationRepo({
        findBySpotAndDateSlot: jest.fn().mockResolvedValue(existingReservation),
      });
      const service = new CreateReservationService(
        reservationRepo,
        makeSpotRepo(),
        makePublisher()
      );
      await expect(service.create(makeDTO())).rejects.toThrow('already reserved for this time');
    });
  });

  describe('Création réussie', () => {
    it('sauvegarde la réservation avec le statut pending', async () => {
      const reservationRepo = makeReservationRepo();
      const service = new CreateReservationService(
        reservationRepo,
        makeSpotRepo(),
        makePublisher()
      );
      const dto = makeDTO();
      const result = await service.create(dto);

      expect(reservationRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ userId: dto.userId, spotId: dto.spotId, status: 'pending' })
      );
      expect(result.status).toBe('pending');
    });

    it('publie un événement reservation.created après la sauvegarde', async () => {
      const publisher = makePublisher();
      const service = new CreateReservationService(
        makeReservationRepo(),
        makeSpotRepo(),
        publisher
      );
      await service.create(makeDTO());

      expect(publisher.publish).toHaveBeenCalledWith(
        'reservation.created',
        expect.objectContaining({ reservationId: 'res-uuid-1' })
      );
    });

    it('ne lève pas d\'erreur si la publication de l\'événement échoue', async () => {
      const publisher: MessagePublisher = {
        publish: jest.fn().mockRejectedValue(new Error('RabbitMQ down')),
      };
      const service = new CreateReservationService(
        makeReservationRepo(),
        makeSpotRepo(),
        publisher
      );
      await expect(service.create(makeDTO())).resolves.toBeDefined();
    });
  });
});
