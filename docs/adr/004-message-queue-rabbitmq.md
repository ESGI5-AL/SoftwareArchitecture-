# ADR-004: RabbitMQ for Email Notification Queue

## Status

 Proposed

## Context

When a reservation is created or modified, the system must send a confirmation email to the employee. The requirement specifies that "a message to a queue should be sent in order to be processed by another application that will send a confirmation email."

This implies:
- The parking system itself does not send emails directly
- An external consumer service handles email delivery
- The communication between the two systems must be asynchronous and reliable

## Decision

We will use **RabbitMQ** as the message broker between the parking reservation system and the external email service.

**Queue design:**
- The backend publishes a message to a `reservation.notifications` queue whenever a reservation is created, confirmed (checked in), or cancelled.
- Messages are published with `persistent: true` to survive broker restarts.

**Message schema:**
```json
{
  "event": "reservation.created",
  "timestamp": "2026-03-30T14:00:00Z",
  "reservation": {
    "id": "uuid",
    "spotNumber": "C05",
    "date": "2026-04-01",
    "slot": "AM",
    "status": "pending"
  },
  "user": {
    "id": "uuid",
    "email": "employee@company.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

The external email consumer (out of scope for this project) subscribes to the queue and processes messages.

**Why RabbitMQ over alternatives:**
- Reliable delivery with message acknowledgments and persistence
- Widely adopted with mature client libraries for Node.js (`amqplib`)
- Built-in management UI (port 15672) for monitoring queues
- Official lightweight Docker image (`rabbitmq:3-management-alpine`)
- Simpler than Kafka for our use case (no need for event streaming or replay)

## Open Questions

- **Which events should trigger a message?** Currently scoped to `reservation.created`, `reservation.cancelled`, and `reservation.checked_in`. Should `no_show` also notify the employee?
- **Dead letter queue:** Should we set up a DLQ for failed messages, or is that the responsibility of the consumer team?

## Consequences

**Positive**
- Email sending is fully decoupled from the reservation flow — a slow or failing email service does not block reservations.
- Messages are persisted — if the email consumer is temporarily down, messages queue up and are processed when it recovers.
- The management UI allows ops to monitor the queue and detect issues.

**Trade-offs**
- Adds infrastructure complexity (one more container to manage).
- The email consumer service itself is out of scope — we only define the interface (message schema) and publish events.