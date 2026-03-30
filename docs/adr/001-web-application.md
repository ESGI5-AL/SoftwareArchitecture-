# ADR-001: Use a Responsive Web Application

## Status

Accepted

## Context

The company needs to replace the current email + Excel parking reservation process with a digital solution. The application must support:

- Employees making reservations from any device (office PC or personal phone)
- QR code scanning for physical check-in at parking spots
- Secretaries managing reservations and users from desktop workstations
- Managers viewing analytics dashboards

Three options were evaluated:

1. **Native mobile app** (iOS + Android)
2. **Desktop application**
3. **Responsive web application**

## Decision

We will build a **responsive web application** that adapts to both mobile and desktop screens.

**Reasons:**

- **Universal access:** Works on any device with a browser — no app store distribution, no installation, no approval process needed.
- **QR code scanning:** Modern mobile browsers support camera access for QR scanning via Web APIs (e.g., `navigator.mediaDevices`), eliminating the need for a native app.
- **Single codebase:** One codebase serves all platforms — mobile employees, desktop secretaries, desktop managers.
- **Instant updates:** Deploy once, everyone gets the latest version immediately with no update prompts.
- **Container-friendly:** The entire application (frontend + backend) runs in Docker containers as required by project constraints.
- **Cost-effective:** Significantly lower development and maintenance cost than separate native apps for iOS and Android.

## Consequences

- **Positive:** Zero-friction onboarding — users just open a URL. No installation barrier for non-technical employees.
- **Positive:** PWA capabilities can be added later for home screen installation and offline caching.
- **Negative:** No native push notifications without PWA service workers (acceptable since email notifications are handled separately via the message queue).
- **Negative:** Camera/QR scanning behavior may vary across mobile browsers (mitigated by providing a manual spot number entry fallback).
