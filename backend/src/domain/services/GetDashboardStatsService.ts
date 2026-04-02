import { GetDashboardStatsUseCase } from '../ports/in/GetDashboardStatsUseCase';
import { ReservationRepository } from '../ports/out/ReservationRepository';
import { DashboardStatsDTO } from '../dtos/DashboardDTOs';

const TOTAL_SPOTS = 60;
const EV_SPOTS = 20; // rows A and F, 10 each

export class GetDashboardStatsService implements GetDashboardStatsUseCase {
  constructor(private readonly reservationRepository: ReservationRepository) {}

  async getStats(): Promise<DashboardStatsDTO> {
    const raw = await this.reservationRepository.getRawStats();

    return {
      occupancyToday: Math.round((raw.todayCount / TOTAL_SPOTS) * 100),
      avgOccupancyLast30Days: Math.round((raw.avgDaily / TOTAL_SPOTS) * 100),
      noShowRate: raw.totalPast > 0 ? Math.round((raw.noShowCount / raw.totalPast) * 100) : 0,
      evChargerUsageRate: raw.totalCount > 0 ? Math.round((raw.evCount / raw.totalCount) * 100) : 0,
      activeUsers: raw.activeUsers,
      totalSpots: TOTAL_SPOTS,
      evSpots: EV_SPOTS
    };
  }
}
