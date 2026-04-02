import { CheckInReservationService } from '../CheckInReservationService';
import { ReservationRepository } from '../../ports/out/ReservationRepository';
import { Reservation } from '../../models/Reservation';

const TODAY = new Date().toISOString().split('T')[0];

const makeReservation = (overrides: Partial<Reservation> = {}): Reservation => ({
  id: 'res-1',
  userId: 'user-1',
  spotId: 'spot-1',
  date: TODAY,
  slot: 'AM',
  status: 'pending',
  createdAt: new Date(),
  ...overrides,
});

const makeRepo = (reservation: Reservation | null = makeReservation()): ReservationRepository => ({
  findById: jest.fn().mockResolvedValue(reservation),
  updateStatus: jest.fn().mockImplementation((id, status, date) =>
    Promise.resolve({ ...makeReservation(), status, checkedInAt: date })
  ),
  save: jest.fn(),
  findByUserId: jest.fn(),
  findBySpotAndDateSlot: jest.fn(),
  findAll: jest.fn(),
  getRawStats: jest.fn(),
});

describe('CheckInReservationService', () => {
  describe('Réservation introuvable', () => {
    it("lève 'Reservation not found' si l'id n'existe pas", async () => {
      const service = new CheckInReservationService(makeRepo(null));
      await expect(service.checkIn('unknown-id', 'user-1', 'employee')).rejects.toThrow(
        'Reservation not found'
      );
    });
  });

  describe('Autorisation', () => {
    it("lève une erreur si l'utilisateur n'est pas le propriétaire ni secrétaire", async () => {
      const reservation = makeReservation({ userId: 'user-1' });
      const service = new CheckInReservationService(makeRepo(reservation));
      await expect(service.checkIn('res-1', 'user-99', 'employee')).rejects.toThrow(
        'not authorized'
      );
    });

    it('autorise le propriétaire de la réservation', async () => {
      const reservation = makeReservation({ userId: 'user-1' });
      const service = new CheckInReservationService(makeRepo(reservation));
      await expect(service.checkIn('res-1', 'user-1', 'employee')).resolves.toBeDefined();
    });

    it('autorise un secrétaire même s\'il n\'est pas le propriétaire', async () => {
      const reservation = makeReservation({ userId: 'user-1' });
      const service = new CheckInReservationService(makeRepo(reservation));
      await expect(service.checkIn('res-1', 'secretary-99', 'secretary')).resolves.toBeDefined();
    });
  });

  describe('Statut de la réservation', () => {
    it("rejette le check-in si le statut n'est pas 'pending'", async () => {
      const reservation = makeReservation({ status: 'checked_in' });
      const service = new CheckInReservationService(makeRepo(reservation));
      await expect(service.checkIn('res-1', 'user-1', 'employee')).rejects.toThrow(
        "reservation status is 'checked_in'"
      );
    });

    it("rejette si le statut est 'cancelled'", async () => {
      const reservation = makeReservation({ status: 'cancelled' });
      const service = new CheckInReservationService(makeRepo(reservation));
      await expect(service.checkIn('res-1', 'user-1', 'employee')).rejects.toThrow(
        "reservation status is 'cancelled'"
      );
    });
  });

  describe('Validation de la date', () => {
    it("rejette le check-in si la réservation n'est pas pour aujourd'hui", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const reservation = makeReservation({ date: yesterday.toISOString().split('T')[0] });
      const service = new CheckInReservationService(makeRepo(reservation));
      await expect(service.checkIn('res-1', 'user-1', 'employee')).rejects.toThrow(
        'Check-in is only allowed on the day of the reservation'
      );
    });
  });

  describe('Check-in réussi', () => {
    it("appelle updateStatus avec 'checked_in' et une date", async () => {
      const repo = makeRepo();
      const service = new CheckInReservationService(repo);
      await service.checkIn('res-1', 'user-1', 'employee');

      expect(repo.updateStatus).toHaveBeenCalledWith('res-1', 'checked_in', expect.any(Date));
    });

    it("retourne la réservation avec le statut 'checked_in'", async () => {
      const service = new CheckInReservationService(makeRepo());
      const result = await service.checkIn('res-1', 'user-1', 'employee');
      expect(result.status).toBe('checked_in');
    });
  });
});
