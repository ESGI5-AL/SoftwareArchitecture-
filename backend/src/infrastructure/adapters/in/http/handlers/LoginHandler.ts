import { Request, Response } from 'express';
import { z } from 'zod';
import { AuthUseCase } from '../../../../../domain/ports/in/AuthUseCase';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export class LoginHandler {
  constructor(private readonly authUseCase: AuthUseCase) {}

  async handle(req: Request, res: Response): Promise<void> {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await this.authUseCase.login(validated.email, validated.password);
      res.json(result);
    } catch (error: unknown) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.issues });
      } else {
        const message = error instanceof Error ? error.message : 'Authentication failed';
        res.status(401).json({ error: message });
      }
    }
  }
}
