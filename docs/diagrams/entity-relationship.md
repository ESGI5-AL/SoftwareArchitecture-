# Entity-Relationship Diagram

## Data Model

```mermaid
erDiagram
    USER {
        uuid id PK
        varchar email UK "unique"
        varchar password_hash
        varchar first_name
        varchar last_name
        enum role "employee | secretary | manager"
        enum vehicle_type "regular | electric | hybrid"
        varchar license_plate "nullable"
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    PARKING_SPOT {
        uuid id PK
        varchar spot_number UK "A01 to F10"
        char row "A, B, C, D, E, or F"
        integer position "1 to 10"
        boolean has_charger "true for rows A and F"
        boolean is_active
    }

    RESERVATION {
        uuid id PK
        uuid user_id FK
        uuid spot_id FK
        date date
        enum slot "AM | PM | FULL"
        enum status "pending | checked_in | completed | no_show | cancelled"
        timestamp checked_in_at "nullable"
        timestamp created_at
        timestamp updated_at
        timestamp cancelled_at "nullable"
        uuid cancelled_by "nullable FK to User"
    }

    USER ||--o{ RESERVATION : "makes"
    PARKING_SPOT ||--o{ RESERVATION : "assigned to"
```

## Notes

- **Unique constraint** on `(spot_id, date, slot)` to prevent double booking
- A `FULL` day slot conflicts with both `AM` and `PM` — enforced at the application level (see ADR-007)
- Rows A and F have `has_charger = true`, all others `false`
- Reservations are never hard-deleted — status transitions track the full lifecycle (see ADR-008)
- `cancelled_by` references the User who performed the cancellation (the employee themselves or a secretary)

## Parking Spot Seeding

60 spots total: 6 rows × 10 positions

| Row | Spots | Electric Charger | Position |
|-----|-------|-----------------|----------|
| A | A01–A10 | Yes (wall row) | Border |
| B | B01–B10 | No | Central pair with A |
| C | C01–C10 | No | Central pair with D |
| D | D01–D10 | No | Central pair with C |
| E | E01–E10 | No | Central pair with F |
| F | F01–F10 | Yes (wall row) | Border |

Layout: `[A B | C D | E F]`
