# Parking Reservation System

Internal web application for managing company parking reservations. Replaces the manual email + Excel process with a self-service system supporting employees, secretaries (admin), and managers.

## Features

- **Half-day reservations** — Book parking spots by AM/PM/full-day slots, up to 5 working days ahead (30 days for managers)
- **Visual parking map** — 60 spots across 6 rows (A–F), 10 per row, with real-time availability
- **Electric charger spots** — Rows A & F reserved for electric/hybrid vehicles with wall chargers
- **QR code check-in** — Scan the QR code at your spot to confirm occupancy; unchecked spots auto-release at 11 AM
- **Secretary admin panel** — Full CRUD on reservations and user management
- **Manager dashboard** — Occupancy rates, no-show analytics, charger usage statistics
- **Email notifications** — Reservation confirmations via RabbitMQ message queue

## Quick Start

```bash
# Build all containers
./scripts/build.sh

# Start the application
./scripts/run.sh

# Run tests
./scripts/test.sh

# Seed the database (parking spots + default users)
./scripts/seed.sh

# Stop and clean up
./scripts/clean.sh
```

**Services:**
| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| RabbitMQ Management | http://localhost:15672 (guest/guest) |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React |
| Backend | Node.js|
| Database | PostgreSQL  |
| Message Queue | RabbitMQ |
| Containerization | Docker + Docker Compose |
| Authentication | JWT with role-based access control |

## Project Structure

```
├── backend/           # Express API (controllers, services, repositories)
├── frontend/          # React SPA (components, pages, contexts)
├── docker/            # Docker Compose + Dockerfiles
├── docs/
│   ├── adr/           # Architecture Decision Records
│   ├── diagrams/      # C4 and ER diagrams (Mermaid)
│   └── user-guides/   # End-user documentation
└── scripts/           # Automation scripts (build, run, test, clean, seed)
```

## Documentation

- [Architecture Decision Records](./docs/adr/)
- [Diagrams (C4 + ER)](./docs/diagrams/)
- [User Guides](./docs/user-guides/)

## Team

- Denisa DUDAS
- Camilla HAMMOU
- Sonia ALOUI
