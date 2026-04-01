import { Response } from 'express';
import { z } from 'zod';
import { CreateReservationUseCase } from '../../../../../domain/ports/in/CreateReservationUseCase';
import { AuthRequest } from '../authMiddleware';

const createSchema = z.object({
  spotId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slot: z.enum(['AM', 'PM', 'FULL'])
});

export class CreateReservationHandler {
  constructor(private readonly createUseCase: CreateReservationUseCase) {}

  async handle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const validated = createSchema.parse(req.body);
      const reservation = await this.createUseCase.create({
        userId: req.user!.userId,
        spotId: validated.spotId,
        date: validated.date,
        slot: validated.slot
      });
      res.status(201).json(reservation);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.issues });
      } else {
        const message = error instanceof Error ? error.message : 'Unknown error';
        if (message.includes('already reserved') || message.includes('not available')) {
          res.status(409).json({ error: message });
        } else {
          res.status(500).json({ error: message });
        }
      }
    }
  }
}
