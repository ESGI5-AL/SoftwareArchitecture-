import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './infrastructure/config/database';
import { connectRabbitMQ } from './infrastructure/config/rabbitmq';
import { seedDatabase } from './infrastructure/config/seed';

// Adapters Out (Persistence & Messaging)
import { PostgresUserRepository } from './infrastructure/adapters/out/persistence/PostgresUserRepository';
import { PostgresParkingSpotRepository } from './infrastructure/adapters/out/persistence/PostgresParkingSpotRepository';
import { PostgresReservationRepository } from './infrastructure/adapters/out/persistence/PostgresReservationRepository';
import { RabbitMQPublisher } from './infrastructure/adapters/out/messaging/RabbitMQPublisher';

// Services (Domain Logic - SRP Split)
import { LoginService } from './domain/services/LoginService';
import { CreateReservationService } from './domain/services/CreateReservationService';
import { GetMyReservationsService } from './domain/services/GetMyReservationsService';
import { GetReservationsService } from './domain/services/GetReservationsService';
import { GetAvailabilityService } from './domain/services/GetAvailabilityService';

// Handlers (Inbound Adapters - SRP Split)
import { LoginHandler } from './infrastructure/adapters/in/http/handlers/LoginHandler';
import { GetAvailabilityHandler } from './infrastructure/adapters/in/http/handlers/GetAvailabilityHandler';
import { CreateReservationHandler } from './infrastructure/adapters/in/http/handlers/CreateReservationHandler';
import { GetMyReservationsHandler } from './infrastructure/adapters/in/http/handlers/GetMyReservationsHandler';
import { GetReservationsHandler } from './infrastructure/adapters/in/http/handlers/GetReservationsHandler';

// Routes (Aggregators)
import { authRoutes } from './infrastructure/adapters/in/http/authRoutes';
import { parkingRoutes } from './infrastructure/adapters/in/http/parkingRoutes';
import { reservationRoutes } from './infrastructure/adapters/in/http/reservationRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

async function start() {
  try {
    // 1. Initialize Infrastructure
    await seedDatabase();
    await connectRabbitMQ();

    // 2. Initialize Repositories (Adapters Out)
    const userRepository = new PostgresUserRepository();
    const parkingSpotRepository = new PostgresParkingSpotRepository();
    const reservationRepository = new PostgresReservationRepository();
    const messagePublisher = new RabbitMQPublisher();

    // 3. Initialize Services (Domain Logic)
    const jwtSecret = process.env.JWT_SECRET || 'supersecret';
    const loginService = new LoginService(userRepository, jwtSecret);
    const createReservationService = new CreateReservationService(
      reservationRepository,
      parkingSpotRepository,
      messagePublisher
    );
    const getMyReservationsService = new GetMyReservationsService(reservationRepository);
    const getReservationsService = new GetReservationsService(reservationRepository);
    const getAvailabilityService = new GetAvailabilityService(parkingSpotRepository);

    // 4. Initialize Handlers (Inbound Adapters Logic)
    const loginHandler = new LoginHandler(loginService);
    const getAvailabilityHandler = new GetAvailabilityHandler(getAvailabilityService);
    const createReservationHandler = new CreateReservationHandler(createReservationService);
    const getMyReservationsHandler = new GetMyReservationsHandler(getMyReservationsService);
    const getReservationsHandler = new GetReservationsHandler(getReservationsService);

    // 5. Middlewares
    app.use(cors());
    app.use(express.json());

    // 6. Health Check
    app.get('/api/health', (_req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected'
      });
    });

    // 7. Routes (Aggregators)
    app.use('/api/auth', authRoutes(loginHandler));
    app.use('/api/parking-spots', parkingRoutes(getAvailabilityHandler, parkingSpotRepository));
    app.use('/api/reservations', reservationRoutes(
      createReservationHandler,
      getMyReservationsHandler,
      getReservationsHandler
    ));

    // 8. Start Server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Fatal error during startup:', error);
    process.exit(1);
  }
}

start();

export default app;
