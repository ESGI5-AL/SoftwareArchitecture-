# ADR-002: Tech Stack — React + Express + PostgreSQL

## Status
🟡 Accepted

## Context

We need to choose a technology stack for the frontend, backend, and database layers. The team has 3 members working across 4 half-day sprints, so developer productivity and ecosystem maturity are critical. The application must run in Docker containers and support real-time-like interactions (parking map, availability).

## Decision

We will use the following stack:

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React + TypeScript + Tailwind CSS + Vite | React 18, Vite 5 |
| **Backend** | Node.js + Express + TypeScript | Node 20, Express 4 |
| **Database** | PostgreSQL | 16 |
| **ORM/Query** | Raw SQL with `pg` driver | — |

**TypeScript across the full stack:** Shared type definitions between frontend and backend reduce bugs at integration boundaries. One language means any team member can work on any layer.

**React:** Largest ecosystem, mature component model, excellent developer tooling. Ideal for the interactive parking map and role-based views.

**Tailwind CSS:** Utility-first approach enables rapid UI development without writing custom CSS. Great for building responsive layouts for both mobile and desktop views.

**Vite:** Fast dev server with hot module replacement, significantly faster than webpack-based alternatives.

**Express:** Lightweight, minimal-opinion HTTP framework. Well-suited for REST APIs, easy to add middleware for auth and validation.

**PostgreSQL:** Robust relational database with ACID compliance. The data model (users, spots, reservations) is inherently relational. Supports UUIDs natively, excellent with date/time operations needed for reservation slots, and has strong indexing capabilities for availability queries.

## Consequences

**Positive**
- Single language (TypeScript) across the entire stack simplifies development and reduces context switching.
- All chosen technologies have extensive documentation, community support, and official Docker images.
- PostgreSQL's relational model naturally fits the domain (users → reservations → spots).

**Trade-offs**
- PostgreSQL requires more setup than SQLite but is far better suited for concurrent access and production workloads.
- Express is unopinionated — we need to establish our own project structure and patterns (controllers/services/repositories), which is documented in ADR-007.
  
