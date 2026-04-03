# 🆘 SAHYOG — AI Powered Emergency & Trust Network

> India's first AI-powered emergency and trust network connecting verified donors, transparent fundraising, missing persons tracking, and real-time emergency mapping.

![Stack](https://img.shields.io/badge/React-Vite-blue) ![Backend](https://img.shields.io/badge/Node.js-Express-green) ![DB](https://img.shields.io/badge/PostgreSQL-PostGIS-blue) ![Auth](https://img.shields.io/badge/JWT-WhatsApp_OTP-orange) ![Payments](https://img.shields.io/badge/Cashfree-Payment_Gateway-purple)

---

## 🌟 Features

### 🩸 Blood Donation Network
- Register as a blood donor with geo-location
- Create urgent blood requests with priority tagging
- **PostGIS-powered** donor search within a configurable radius
- Compatible blood group matching, including O- universal donor support
- Distance-sorted results with cooldown enforcement

### 💰 Verified Fundraising
- Create fundraising campaigns with categories
- **Cashfree Payment Gateway** integration with order, session, and webhook flow
- Track campaign progress with live raised amounts
- Urgency-based prioritization: critical, urgent, normal
- Duplicate campaign detection

### 🔍 Missing Persons Tracker
- Report missing persons with geo-tagged last-seen location
- Community-driven sighting reports with location data
- Urgency-based sorting and duplicate detection
- Unique identifier tracking such as scars and tattoos

### 🗺️ Live Emergency Map
- **Leaflet.js** interactive map with custom markers
- Blood request and missing person overlays
- Filter by blood, missing, or all
- Auto-center on the user's current location

### 🛡️ Trust Score System
- Dynamic 0-100 trust score per user
- Score increases from blood donation, sighting reports, donations, and verification
- Score decreases from confirmed report violations
- Visual trust indicators throughout the platform

### 🔐 Multi-tier Authentication
- **User Auth**: WhatsApp OTP via Twilio and JWT
- **Admin Auth**: Email and password with bcrypt and a separate JWT
- Separate JWT secrets for user and admin tokens
- Rate-limited auth endpoints

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Framer Motion, React Router, React Query, Leaflet |
| **Backend** | Node.js, Express 5, modular architecture |
| **Database** | PostgreSQL + PostGIS |
| **Auth** | JWT, WhatsApp OTP via Twilio |
| **Payments** | Cashfree Payment Gateway |
| **Security** | Helmet, CORS, Express Rate Limit, bcryptjs |

---

## 📁 Project Structure

```text
sahyog/
├── backend/
│   ├── src/
│   │   ├── app.js
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── admin.middleware.js
│   │   ├── utils/
│   │   │   ├── jwt.js
│   │   │   └── hash.js
│   │   └── modules/
│   │       ├── auth/
│   │       ├── user/
│   │       ├── admin/
│   │       ├── blood/
│   │       ├── fund/
│   │       ├── missing/
│   │       └── report/
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   ├── lib/
    │   │   ├── api.js
    │   │   └── utils.js
    │   ├── context/
    │   │   └── AuthContext.jsx
    │   ├── components/
    │   │   ├── Layout.jsx
    │   │   └── ui.jsx
    │   └── pages/
    │       ├── Landing.jsx
    │       ├── Login.jsx
    │       ├── Dashboard.jsx
    │       ├── Blood.jsx
    │       ├── Fund.jsx
    │       ├── Missing.jsx
    │       ├── MapView.jsx
    │       ├── AdminLogin.jsx
    │       └── AdminDashboard.jsx
    ├── index.html
    └── package.json
```

---

## 🚀 Setup Guide

### Prerequisites
- Node.js 18 or newer
- PostgreSQL 14 or newer with PostGIS enabled
- npm or yarn

### Step 1: Clone and Install

```bash
git clone <repository-url>
cd sahyog
```

#### Backend

```bash
cd backend
npm install
```

#### Frontend

```bash
cd frontend
npm install
```

### Step 2: Database Setup

```sql
CREATE DATABASE sahyog;

\c sahyog
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

> Note: the backend auto-creates all tables on first startup.

### Step 3: Environment Variables

Copy the backend example environment file and update the values:

```bash
cd backend
cp .env.example .env
```

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sahyog
DB_USER=postgres
DB_PASSWORD=your_password

USER_JWT_SECRET=your_user_secret_key
ADMIN_JWT_SECRET=your_admin_secret_key

TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token

CASHFREE_APP_ID=your_app_id
CASHFREE_SECRET_KEY=your_secret_key
```

### Step 4: Start Development Servers

#### Backend

```bash
cd backend
npm run dev
```

#### Frontend

```bash
cd frontend
npm run dev
```

### Step 5: Access the Application

| URL | Description |
|-----|-------------|
| http://localhost:5173 | Frontend application |
| http://localhost:5000/api/health | Backend health check |
| http://localhost:5173/admin/login | Admin panel |

### Default Admin Credentials
- Email: admin@sahyog.org
- Password: admin123

---

## 🌐 API Routes

### Auth
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/auth/login` | Send WhatsApp OTP | - |
| POST | `/api/auth/verify` | Verify OTP and get token | - |
| POST | `/api/auth/register` | Complete registration | User |

### User
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/user/profile` | Get user profile and stats | User |
| PUT | `/api/user/update` | Update profile | User |

### Blood
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/blood/requests` | List active requests | - |
| POST | `/api/blood/register-donor` | Register as donor | User |
| POST | `/api/blood/create-request` | Create blood request | User |
| GET | `/api/blood/nearby-donors` | Find donors using PostGIS | User |
| POST | `/api/blood/respond` | Respond to request | User |
| GET | `/api/blood/history` | Donation history | User |

### Fund
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/fund/categories` | List categories | - |
| GET | `/api/fund/campaign/list` | List campaigns | - |
| POST | `/api/fund/campaign/create` | Create campaign | User |
| POST | `/api/fund/donate` | Create payment order | User |
| POST | `/api/fund/webhook/cashfree` | Cashfree webhook | - |
| GET | `/api/fund/transactions` | Transaction history | User |

### Missing
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| GET | `/api/missing/list` | List missing persons | - |
| GET | `/api/missing/:id` | Get details and sightings | - |
| POST | `/api/missing/report` | Report missing person | User |
| POST | `/api/missing/sighting` | Report sighting | User |

### Report
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/report/create` | Create report | User |
| GET | `/api/report/list` | List user reports | User |

### Admin
| Method | Route | Description | Auth |
|--------|-------|-------------|------|
| POST | `/api/admin/auth/login` | Admin login | - |
| GET | `/api/admin/dashboard` | Dashboard stats | Admin |
| GET | `/api/admin/verifications` | List verifications | Admin |
| POST | `/api/admin/verification/approve` | Approve verification | Admin |
| POST | `/api/admin/verification/reject` | Reject verification | Admin |
| GET | `/api/admin/reports` | List reports | Admin |
| POST | `/api/admin/action` | Take action on report | Admin |

---

## 🧠 Smart Features

- Priority tagging for critical, urgent, and normal requests
- Duplicate detection for requests and campaigns
- Trust score system with live user reputation tracking
- Compatible blood matching, including O- universal donation logic
- Geo-spatial donor search with PostGIS `ST_DWithin`
- Cashfree webhook verification with HMAC signatures

---

## 🔒 Security

- Separate JWT secrets for user and admin tokens
- bcryptjs with 12 salt rounds for password hashing
- Helmet.js security headers
- CORS configured for the frontend origin
- Rate limiting for API and auth endpoints
- Parameterized queries to reduce SQL injection risk

---

## 📦 Deployment

### Backend

```bash
cd backend
npm start
```

### Frontend

```bash
cd frontend
npm run build
```

Set `VITE_API_URL` to your backend URL in production.

---

## 👥 Team FutureMinds

Built for TIC 2K26 Hackathon.

---

*SAHYOG - Because when every second counts, trust matters most.*
