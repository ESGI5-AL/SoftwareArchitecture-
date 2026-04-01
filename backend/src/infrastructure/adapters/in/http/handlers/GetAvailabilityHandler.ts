import { Response } from 'express';
import { z } from 'zod';
import { GetParkingAvailabilityUseCase } from '../../../../../domain/ports/in/GetParkingAvailabilityUseCase';
import { AuthRequest } from '../authMiddleware';

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slot: z.enum(['AM', 'PM', 'FULL'])
});

export class GetAvailabilityHandler {
  constructor(private readonly parkingUseCase: GetParkingAvailabilityUseCase) {}

  async handle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const validated = querySchema.parse(req.query);
      const spots = await this.parkingUseCase.getAvailability(validated.date, validated.slot);
      res.json(spots);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.issues });
      } else {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ error: message });
      }
    }
  }
}
