# LIFEX Mobile Clinic

A full-stack web application for Dr. Yusuf's LIFEX Mobile Clinic — built by **Tamarcom Technologies**.

Patients book appointments online, pay via bank transfer, and receive care from Dr. Yusuf through a structured digital workflow managed by front desk staff.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT with `jose` (Edge-compatible), bcryptjs
- **Validation:** Zod + react-hook-form
- **File uploads:** Cloudinary
- **Email:** Resend
- **SMS:** Termii (Nigeria)
- **Charts:** Recharts
- **Real-time chat:** 5-second polling (Socket.io upgrade path included)

---

## User Roles

| Role | Access |
|------|--------|
| **Patient** | Register/login from public site, book appointments, pay via bank transfer, view records & vitals, chat, special requests |
| **Front Desk** | Verify payments, manage schedule, search patients, handle special requests, chat |
| **Doctor** | View confirmed patient queue, access full patient files, write consultation notes, record vitals, follow-ups |
| **Admin** | Revenue dashboard, staff management, services & pricing, reports (CSV export), settings |

---

## Getting Started

### 1. Clone & install

```bash
cd MobileClinic
npm install --legacy-peer-deps
```

### 2. Set up environment variables

```bash
cp .env.example .env.local
# Fill in all values in .env.local
```

Required variables:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — min 32 chars (`openssl rand -base64 32`)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `RESEND_API_KEY` + `EMAIL_FROM`
- `TERMII_API_KEY` + `TERMII_SENDER_ID`

### 3. Set up the database

```bash
npm run db:push       # dev / quick setup
npm run db:migrate    # production (creates migration files)
```

### 4. Seed demo data

```bash
npm run db:seed
```

**Demo credentials after seeding:**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@lifexclinic.com | Admin@12345 |
| Doctor | dr.yusuf@lifexclinic.com | Doctor@12345 |
| Front Desk | frontdesk@lifexclinic.com | FrontDesk@12345 |
| Patient | emeka@example.com | Patient@12345 |
| Patient | fatima@example.com | Patient@12345 |

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Login, Register
│   ├── (patient)/         # Patient portal
│   │   ├── dashboard/
│   │   ├── book/          # Appointment booking wizard
│   │   ├── appointments/
│   │   ├── payment/[id]/  # Bank transfer + proof upload
│   │   ├── records/       # Consultation notes & documents
│   │   ├── vitals/        # Vitals history + charts
│   │   ├── requests/      # Home visits, hospital assist, medical tourism
│   │   ├── messages/
│   │   └── profile/
│   ├── (desk)/            # Front Desk portal
│   │   ├── dashboard/
│   │   ├── payments/      # Payment verification queue
│   │   ├── schedule/      # Daily appointment schedule
│   │   ├── patients/      # Patient search
│   │   ├── book/          # Staff-initiated booking
│   │   ├── requests/
│   │   └── messages/
│   ├── (doctor)/          # Doctor portal
│   │   ├── dashboard/
│   │   ├── queue/         # Patient queue
│   │   ├── patient/[id]/  # Full patient file + consultation form
│   │   ├── followups/
│   │   └── messages/
│   ├── (admin)/           # Admin portal
│   │   ├── dashboard/     # Revenue chart + stats
│   │   ├── staff/
│   │   ├── services/
│   │   ├── reports/       # CSV export
│   │   └── settings/
│   └── api/               # All API routes
├── components/
│   ├── layout/            # Sidebar, Topbar
│   ├── shared/            # ChatPanel
│   └── ui/                # Button, Input, Card, Badge, Modal, Spinner
└── lib/
    ├── auth.ts            # JWT, session, RBAC
    ├── db.ts              # Prisma client
    ├── notifications.ts   # In-app, email, SMS
    ├── utils.ts           # Formatting helpers
    └── validations.ts     # Zod schemas
```

---

## Patient Journey (Payment Gate)

```
Patient books appointment  →  status: PENDING_PAYMENT
Patient uploads bank transfer proof  →  status: VERIFYING
Front Desk verifies payment  →  status: CONFIRMED  ← Doctor sees this
Doctor writes consultation note  →  status: COMPLETED
```

Doctor only ever sees CONFIRMED and COMPLETED appointments. Raw payment data is never exposed to clinical staff.

---

## Useful Commands

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run db:push      # Push schema (no migration)
npm run db:migrate   # Create & apply migration
npm run db:seed      # Seed demo data
npm run db:studio    # Prisma Studio GUI
```

---

## Deployment

- Set all env vars from `.env.example` on your hosting platform (Vercel, Railway, etc.)
- Use `db:migrate` not `db:push` for production schema changes
- Cloudinary free tier covers initial launch volume
- Resend free: 3,000 emails/month
- Termii: pay-as-you-go SMS (Nigeria)

---

Built by **Tamarcom Technologies** for LIFEX Mobile Clinic © 2026
