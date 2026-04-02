import { Response } from 'express';
import { GetDashboardStatsUseCase } from '../../../../../domain/ports/in/GetDashboardStatsUseCase';
import { AuthRequest } from '../authMiddleware';

export class GetDashboardStatsHandler {
  constructor(private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase) {}

  async handle(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await this.getDashboardStatsUseCase.getStats();
      res.json(stats);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  }
}
