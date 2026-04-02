import { GetDashboardStatsService } from '../GetDashboardStatsService';
import { ReservationRepository } from '../../ports/out/ReservationRepository';

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface RawStats {
  todayCount: number;
  avgDaily: number;
  noShowCount: number;
  totalPast: number;
  evCount: number;
  totalCount: number;
  activeUsers: number;
}

const makeRepo = (raw: RawStats): ReservationRepository => ({
  getRawStats: jest.fn().mockResolvedValue(raw),
  save: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findBySpotAndDateSlot: jest.fn(),
  findAll: jest.fn(),
  updateStatus: jest.fn(),
});

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('GetDashboardStatsService', () => {
  const TOTAL_SPOTS = 60;
  const EV_SPOTS = 20;

  describe('occupancyToday', () => {
    it('calcule le taux d\'occupation du jour en pourcentage (arrondi)', async () => {
      const service = new GetDashboardStatsService(
        makeRepo({ todayCount: 30, avgDaily: 0, noShowCount: 0, totalPast: 0, evCount: 0, totalCount: 0, activeUsers: 0 })
      );
      const stats = await service.getStats();
      expect(stats.occupancyToday).toBe(50); // 30/60 = 50%
    });

    it('arrondit correctement un pourcentage non entier', async () => {
      const service = new GetDashboardStatsService(
        makeRepo({ todayCount: 10, avgDaily: 0, noShowCount: 0, totalPast: 0, evCount: 0, totalCount: 0, activeUsers: 0 })
      );
      const stats = await service.getStats();
      expect(stats.occupancyToday).toBe(Math.round((10 / 60) * 100));
    });
  });

  describe('avgOccupancyLast30Days', () => {
    it('calcule la moyenne sur 30 jours', async () => {
      const service = new GetDashboardStatsService(
        makeRepo({ todayCount: 0, avgDaily: 45, noShowCount: 0, totalPast: 0, evCount: 0, totalCount: 0, activeUsers: 0 })
      );
      const stats = await service.getStats();
      expect(stats.avgOccupancyLast30Days).toBe(75); // 45/60 = 75%
    });
  });

  describe('noShowRate', () => {
    it('calcule le taux de no-show correctement', async () => {
      const service = new GetDashboardStatsService(
        makeRepo({ todayCount: 0, avgDaily: 0, noShowCount: 6, totalPast: 20, evCount: 0, totalCount: 0, activeUsers: 0 })
      );
      const stats = await service.getStats();
      expect(stats.noShowRate).toBe(30); // 6/20 = 30%
    });

    it('retourne 0 si totalPast est 0 (évite la division par zéro)', async () => {
      const service = new GetDashboardStatsService(
        makeRepo({ todayCount: 0, avgDaily: 0, noShowCount: 0, totalPast: 0, evCount: 0, totalCount: 0, activeUsers: 0 })
      );
      const stats = await service.getStats();
      expect(stats.noShowRate).toBe(0);
    });
  });

  describe('evChargerUsageRate', () => {
    it('calcule le taux d\'utilisation des bornes EV', async () => {
      const service = new GetDashboardStatsService(
        makeRepo({ todayCount: 0, avgDaily: 0, noShowCount: 0, totalPast: 0, evCount: 4, totalCount: 10, activeUsers: 0 })
      );
      const stats = await service.getStats();
      expect(stats.evChargerUsageRate).toBe(40); // 4/10 = 40%
    });

    it('retourne 0 si totalCount est 0 (évite la division par zéro)', async () => {
      const service = new GetDashboardStatsService(
        makeRepo({ todayCount: 0, avgDaily: 0, noShowCount: 0, totalPast: 0, evCount: 0, totalCount: 0, activeUsers: 0 })
      );
      const stats = await service.getStats();
      expect(stats.evChargerUsageRate).toBe(0);
    });
  });

  describe('Valeurs fixes', () => {
    it('retourne toujours totalSpots = 60 et evSpots = 20', async () => {
      const service = new GetDashboardStatsService(
        makeRepo({ todayCount: 0, avgDaily: 0, noShowCount: 0, totalPast: 0, evCount: 0, totalCount: 0, activeUsers: 5 })
      );
      const stats = await service.getStats();
      expect(stats.totalSpots).toBe(TOTAL_SPOTS);
      expect(stats.evSpots).toBe(EV_SPOTS);
      expect(stats.activeUsers).toBe(5);
    });
  });
});
