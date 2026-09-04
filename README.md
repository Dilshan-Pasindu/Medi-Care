# MediCare — Smart Channeling & E-Prescription Management System

A production-grade, AI-powered healthcare platform that connects **Patients**, **Doctors**, and **Pharmacists** through a seamless channeling and e-prescription workflow.

## 🚀 Features

- **🤖 Google Gemini AI Medical Assistant**: Natural language clinical triage that analyzes patient symptoms and recommends the optimal medical specialist.
- **🔐 JWT Authentication & Registration**: Secure token-based authentication with patient self-registration and role-based access control.
- **📅 Smart Channeling & Appointments**: Real-time appointment booking with double-booking prevention and past-date validation.
- **👨‍⚕️ Doctor Consultation Portal**: Full visibility into booked patients, clinical symptom history, and digital consultation queue.
- **💊 Interactive E-Prescription Creator**: Prescribe medicines with real-time stock indicators, dosage/frequency/duration presets, and stock warnings.
- **🏪 Pharmacist Dispensing Queue**: Transactional dispensing with automatic inventory deduction and low-stock alerts.
- **☁️ Supabase PostgreSQL Cloud Database**: Production database connected via connection pooler with full SQL migrations and seed data.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express, TypeScript, node-pg |
| **Database** | PostgreSQL (Supabase Cloud Database with Connection Pooler) |
| **AI Integration** | Google Gemini AI (`gemini-flash-latest`) via `@google/genai` |
| **Security** | 256-bit Cryptographic JWT, Bcrypt password hashing, CORS |

---

## 📁 Project Structure

```
Medi-Project/
├── frontend/          # React SPA (Vite + TypeScript + Tailwind CSS)
├── backend/           # Express REST API (TypeScript + pg + Gemini AI)
├── database/          # PostgreSQL migrations & seed data
│   ├── migration.sql  # Schema definitions
│   └── seed.sql       # Initial seed data
└── README.md
```

---

## ⚡ Quick Start

### 1. Database Setup
1. Create a project at [supabase.com](https://supabase.com).
2. Navigate to the SQL Editor and execute:
   - `database/migration.sql` — Creates tables, constraints, and indexes.
   - `database/seed.sql` — Populates specialists, doctors, medicines, and initial users.

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Fill in your DATABASE_URL, JWT_SECRET, and GEMINI_API_KEY
npm install
npm run build
npm start
```
The API starts on `http://localhost:3001`.

### 3. Frontend Setup
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```
The application opens on `http://localhost:5173` (or `5174`).

---

## 👥 Pre-Seeded Accounts

| Role | Email | Password |
|------|-------|----------|
| Patient | kasun@medicare.com | password123 |
| Doctor | nimal@medicare.com | password123 |
| Pharmacist | amal@medicare.com | password123 |

*You can also register a new patient account directly from the Sign Up tab on the home page!*

---

## 🔄 End-to-End Workflow

```
Patient signs up / logs in 
  → Chats with Gemini AI or enters symptoms 
  → AI recommends specialist (e.g., Cardiologist) 
  → Patient chooses doctor & books appointment 
  → Doctor logs in, sees patient in consultation queue 
  → Doctor reviews symptoms & creates E-Prescription with live stock validation 
  → Pharmacist receives prescription in dispensing queue 
  → Pharmacist dispenses with 1-click atomic inventory deduction 
  → Patient views dispensed prescription in their portal
```

---

## 🛡️ License

MIT License. Built for Smart Healthcare & Channeling Management.
