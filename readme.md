# SAHYOG

AI Powered Emergency and Trust Network for blood donation, verified fundraising, missing person support, and live incident awareness.

[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-0ea5e9)](https://sahyog.ashparx.com/)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-22c55e)](#tech-stack)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%2B%20PostGIS-3b82f6)](#tech-stack)
[![Live](https://img.shields.io/badge/Live-sahyog.ashparx.com-ef4444)](https://sahyog.ashparx.com/)

## Live Application

Production URL:

https://sahyog.ashparx.com/

## Why SAHYOG

SAHYOG unifies emergency workflows that are usually scattered across apps and social channels.

- Blood: faster donor discovery with location-aware matching.
- Fundraising: transparent campaign tracking with verified flows.
- Missing: community reporting and sighting support.
- Trust: score-driven reliability signals and moderation support.

## Core Features

### Blood Donation Network

- Donor registration with profile and location context.
- Urgent request creation and response flow.
- Radius-based donor matching with compatibility logic.

### Verified Fundraising

- Campaign creation and progress tracking.
- Payment integration for donation flow.
- Trust and activity signals to improve credibility.

### Missing Persons Support

- Missing person case posting and updates.
- Community sightings and case progress visibility.
- Structured details for better identification outcomes.

### Live Emergency Experience

- Real-time updates for key user actions.
- Notification center for blood, fund, missing, and reports.
- Dashboard cards with active report visibility.

### Download Ready Experience

- Landing page includes app download call to action.
- APK download link is wired in the live interface.

## Tech Stack

| Layer    | Technology                                             |
| -------- | ------------------------------------------------------ |
| Frontend | React, Vite, Tailwind CSS, Framer Motion, React Router |
| Backend  | Node.js, Express, Socket.IO                            |
| Database | PostgreSQL, PostGIS                                    |
| Auth     | JWT based auth and role middleware                     |
| Payments | Cashfree integration flow                              |
| Infra    | Render style deployment support                        |

## Project Structure

```text
tic-2k26-FutureMinds/
    backend/
        src/
            app.js
            config/
            middleware/
            modules/
            services/
            utils/
    frontend/
        src/
            components/
            context/
            lib/
            pages/
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL with PostGIS extension

### Install Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### Run Development Servers

```bash
cd backend
npm run dev

cd ../frontend
npm run dev
```

### Local URLs

- Frontend: http://localhost:5173
- Backend health: http://localhost:5000/api/health
- Admin login: http://localhost:5173/admin/login

## Key API Areas

- Auth: login, verify, register
- User: profile and community stats
- Blood: requests, donors, responses
- Fund: campaigns, donate, transactions
- Missing: reports, sightings
- Report: create, list, active count
- Admin: dashboard, moderation, verification

## Security Notes

- Role-aware middleware for protected routes.
- JWT token based auth for user and admin workflows.
- Parameterized queries and server-side validations.
- Standard protection headers and rate limits.

## Team

Built by Team FutureMinds for TIC 2K26.

Because when every second counts, trust matters.
