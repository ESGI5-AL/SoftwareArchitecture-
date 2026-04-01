import { Request, Response } from 'express';
import { GetReservationsUseCase } from '../../../../../domain/ports/in/GetReservationsUseCase';

export class GetReservationsHandler {
  constructor(private readonly getReservationsUseCase: GetReservationsUseCase) {}

  async handle(_req: Request, res: Response): Promise<void> {
    try {
      const reservations = await this.getReservationsUseCase.execute();
      res.json(reservations);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: message });
    }
  }
}
