import { DashboardStatsDTO } from '../../dtos/DashboardDTOs';

export interface GetDashboardStatsUseCase {
  getStats(): Promise<DashboardStatsDTO>
}
