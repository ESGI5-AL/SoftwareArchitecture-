# ADR-003: JWT-Based Authentication with Role-Based Access Control

## Status

Accepted

## Context

The application has three distinct user profiles with different permissions:

- **Employee:** Can make reservations (max 5 days), check in via QR, view own history
- **Secretary:** Full admin access — manage all reservations, create/edit users
- **Manager:** Employee permissions + 30-day reservations + analytics dashboard

We need an authentication mechanism that:

- Works with a REST API (stateless)
- Supports role-based route protection
- Functions well on both mobile browsers (QR check-in) and desktop

## Decision

We will use **JWT (JSON Web Tokens)** for authentication with role-based access control (RBAC).

**Token strategy:**

- On login, the backend issues an **access token** (short-lived, 15 min) and a **refresh token** (longer-lived, 7 days).
- The JWT payload contains: `{ userId, email, role }`.
- Access tokens are stored in memory (React state/context) — never in `localStorage` or cookies to mitigate XSS attacks.
- Refresh tokens are sent as HTTP-only cookies for silent renewal.

**Route protection:**

- An auth middleware on the backend validates the JWT on every protected route and extracts the user's role.
- **Role guards** protect sensitive routes:


	- `/api/admin/*` → requires **secretary** role
	- `/api/dashboard/*` → requires **manager** role
	- `/api/reservations/*`, `/api/checkin/*` → requires any authenticated user

## Open Questions

- **Token refresh flow:** Should we implement silent refresh on the frontend with an interceptor, or use a simpler approach with longer-lived tokens for the MVP? Given our 4-sprint timeline, a simpler approach may be more realistic.
- **Password policy:** Do we need password complexity rules, or is this handled by an existing company directory (LDAP/SSO)? For now we assume local authentication with basic hashing.

## Consequences

### Positive

- Stateless authentication scales horizontally — no server-side session store needed.
- Role embedded in the token payload avoids an extra database lookup on every request.
- Works seamlessly across devices — the same token works on desktop and mobile browser.

### Trade-offs

- Token revocation requires additional mechanisms (e.g., a token blacklist or short expiry + refresh). Mitigated by the short 15-minute access token lifespan.
- If the JWT secret is compromised, all tokens are compromised. Mitigated by using strong secrets and environment variable management