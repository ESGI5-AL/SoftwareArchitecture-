import { Response } from 'express';
import { GetMyReservationsUseCase } from '../../../../../domain/ports/in/GetMyReservationsUseCase';
import { AuthRequest } from '../authMiddleware';

export class GetMyReservationsHandler {
  constructor(private readonly getUseCase: GetMyReservationsUseCase) {}

  async handle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const reservations = await this.getUseCase.getMyReservations(req.user!.userId);
      res.json(reservations);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  }
}
