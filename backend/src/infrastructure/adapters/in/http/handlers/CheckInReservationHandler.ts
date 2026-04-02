import { Response } from 'express';
import { CheckInReservationUseCase } from '../../../../../domain/ports/in/CheckInReservationUseCase';
import { AuthRequest } from '../authMiddleware';

export class CheckInReservationHandler {
  constructor(private readonly checkInUseCase: CheckInReservationUseCase) {}

  async handle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const reservation = await this.checkInUseCase.checkIn(
        id,
        req.user!.userId,
        req.user!.role
      );
      res.json(reservation);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      if (message.includes('not found')) {
        res.status(404).json({ error: message });
      } else if (message.includes('not authorized')) {
        res.status(403).json({ error: message });
      } else {
        res.status(400).json({ error: message });
      }
    }
  }
}
