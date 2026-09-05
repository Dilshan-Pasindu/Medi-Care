# 🏥 Intelligent Channeling, E-Prescription & Pharmacy Management System
### SE3090 Group Project — Master Prompt

---

## 🧭 Project Overview

Build one integrated AI-powered healthcare channeling and pharmacy management system as a four-member SE3090 group project.

The system is a single coherent full-stack product consisting of:

- **ASP.NET Core Web API** — authoritative backend
- **PostgreSQL** — single shared relational database
- **Entity Framework Core** — ORM and migrations
- **React + Vite** — web frontend for staff/admin workflows
- **Flutter / Dart** — mobile app for patient-facing workflows
- **Python AI Services** — agentic AI subsystem (called by ASP.NET Core only)
- **JWT + RBAC** — authentication and role-based authorization
- **GitHub Actions** — CI/CD pipeline

React and Flutter must communicate **only** through the ASP.NET Core Web API and must use the same PostgreSQL database, identity, permissions, and business rules. If a Python service is used for AI, it must be an **internal service called by ASP.NET Core**, never directly by React or Flutter.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| 🌐 Web Frontend | React + Vite |
| 🎨 Web Styling | Tailwind CSS + shadcn/ui |
| 📱 Mobile App | Flutter / Dart |
| ⚙️ Backend | C# + ASP.NET Core Web API |
| 🗄️ Database | PostgreSQL |
| 🔄 ORM / Data Access | Entity Framework Core |
| 🔐 Authentication | JWT + Role-Based Access Control (RBAC) |
| 📑 API Documentation | Swagger / OpenAPI |
| 🤖 AI Agents | Python + AI/LLM services |
| 🧠 Agent Backend Integration | ASP.NET Core ↔ Python AI service |
| 🧪 Backend Testing | xUnit |
| 🔗 API Testing | Swagger / Postman |
| 📦 Version Control | Git + GitHub |
| 🔄 CI/CD | GitHub Actions |

---

## 🎯 Project Objective

Create an intelligent healthcare ecosystem where:

1. A **patient** enters symptoms → AI recommends a suitable medical specialty and ranks doctors
2. Patient **books an appointment** → receptionist verifies payment
3. **Doctor** conducts the consultation → AI assists with clinical decision support
4. Doctor selects medicines → AI checks medicine availability → **e-prescription** is created
5. Patient and pharmacist receive the prescription → pharmacist processes the medicine order
6. **Pharmacy inventory** is monitored → AI predicts demand and recommends restocking
7. **Supplier** receives the restock request

> **Core principle:** AI assists users and professionals — it does not autonomously make high-impact medical decisions. Human approval is required at critical points.

---

## 👤 User Roles

| Role | Description |
|---|---|
| **Patient** | Books appointments, views prescriptions and orders |
| **Doctor** | Conducts consultations, creates prescriptions |
| **Receptionist** | Verifies payments, confirms appointments |
| **Pharmacist** | Processes medicine orders, manages dispensing |
| **Pharmacy Owner** | Manages inventory, approves restocking |
| **Supplier** | Receives and fulfils restock requests |
| **Administrator** | Full system access, user management |

Each role must have: authentication, authorization, protected APIs, role-specific dashboard, and appropriate permissions.

---

## 🤖 Four Agentic AI Components

| Agent | Member | Responsibility |
|---|---|---|
| 🩺 **Specialist & Doctor Recommendation Agent** | Member 1 | Symptom analysis → specialty recommendation → doctor ranking |
| 🧠 **Clinical Decision Support Agent** | Member 2 | Diagnosis suggestions → confidence scoring → test recommendations |
| 💊 **Medication Intelligence Agent** | Member 3 | Medicine availability checking → alternative suggestions |
| 📦 **Pharmacy & Inventory Intelligence Agent** | Member 4 | Demand forecasting → stockout prediction → restock recommendations |

These must **not** be four disconnected prompts. They must be coordinated through an **Agentic Orchestrator**.

---

## 🏗️ Implementation Order

> **Implement in this sequence to ensure every feature builds on a stable foundation.**

### Phase 1 — Foundation (Week 1–2)
- [ ] Initialize GitHub repository with branch strategy
- [ ] Create ASP.NET Core Web API project structure (Controllers, Services, DTOs, Repositories)
- [ ] Set up PostgreSQL database and connect via Entity Framework Core
- [ ] Design and run initial EF Core migrations (all core tables)
- [ ] Implement JWT authentication (`POST /api/auth/register`, `POST /api/auth/login`)
- [ ] Implement role-based authorization middleware
- [ ] Configure Swagger/OpenAPI
- [ ] Configure CORS, global exception handling, structured logging
- [ ] Set up GitHub Actions CI (build + test on push/PR)
- [ ] Seed database with realistic test data

### Phase 2 — Core Backend APIs (Week 3–5)

**Member 1 — Patient & Appointment APIs**
- [ ] Patient profile CRUD
- [ ] Doctor listing, search, filtering
- [ ] Doctor availability management
- [ ] Appointment creation, status, history
- [ ] Doctor ratings

**Member 2 — Doctor Consultation APIs**
- [ ] Doctor dashboard APIs
- [ ] Clinical record management
- [ ] Examination and lab result APIs
- [ ] Consultation record CRUD

**Member 3 — Prescription & Medicine APIs**
- [ ] Medicine catalogue CRUD
- [ ] Prescription creation and management
- [ ] Prescription item APIs
- [ ] Medicine order APIs
- [ ] Price calculation logic

**Member 4 — Inventory & Supplier APIs**
- [ ] Pharmacy and inventory management
- [ ] Low-stock detection
- [ ] Supplier management
- [ ] Restock request workflow

### Phase 3 — React Web Application (Week 4–6)
- [ ] Project scaffold: React + Vite + Tailwind CSS + shadcn/ui
- [ ] Authentication pages (Login, Register)
- [ ] Protected routes and role-based navigation
- [ ] Shared layout with sidebar
- [ ] Member 1: Patient dashboard, appointment booking, doctor listing
- [ ] Member 2: Doctor dashboard, consultation screen, clinical record forms
- [ ] Member 3: Pharmacist dashboard, prescription management, order processing
- [ ] Member 4: Pharmacy owner dashboard, inventory management, supplier portal

### Phase 4 — Flutter Mobile Application (Week 5–7)
- [ ] Flutter project setup, shared API service layer
- [ ] Authentication (login, registration)
- [ ] Member 1: Patient symptom entry, doctor recommendations, appointment booking, tracking
- [ ] Member 2: Doctor appointment status, patient consultation info
- [ ] Member 3: Patient e-prescription viewing, medicine order tracking, order history
- [ ] Member 4: Pharmacist stock checking, low-stock notifications, restock status
- [ ] At least one meaningful device feature (GPS/maps, push notifications, date/time picker)

### Phase 5 — Agentic AI Subsystem (Week 6–8)
- [ ] Python AI service project setup
- [ ] Implement Agentic Orchestrator
- [ ] Agent 1: Specialist & Doctor Recommendation Agent
- [ ] Agent 2: Clinical Decision Support Agent
- [ ] Agent 3: Medication Intelligence Agent
- [ ] Agent 4: Pharmacy & Inventory Intelligence Agent
- [ ] ASP.NET Core integration layer (HTTP calls to Python AI service)
- [ ] Implement agent tool allow-lists
- [ ] Implement workflow state persistence
- [ ] Implement human-in-the-loop approval endpoints

### Phase 6 — Integration & Testing (Week 7–9)
- [ ] End-to-end workflow integration testing
- [ ] xUnit backend unit and integration tests
- [ ] React component tests and form validation tests
- [ ] Flutter widget and unit tests
- [ ] Agent golden-case tests, schema validation tests
- [ ] Performance and load testing
- [ ] Security testing (auth, RBAC, injection)

### Phase 7 — Polish & Deployment (Week 9–10)
- [ ] Third-party integration (Maps API or other)
- [ ] Final UI/UX polish (React + Flutter)
- [ ] Deployment configuration
- [ ] Complete API documentation
- [ ] ER diagram and architecture diagrams
- [ ] Individual and group reports
- [ ] AI usage logs

---

## 📋 Member 1 — Patient & Appointment Management

### A. SE Responsibility

**ASP.NET Core APIs:**
```
POST   /api/patients/symptoms
GET    /api/doctors
GET    /api/doctors/{id}
GET    /api/doctors/{id}/availability
POST   /api/appointments
GET    /api/appointments/my
GET    /api/appointments/{id}
POST   /api/doctors/{id}/ratings
```

**PostgreSQL Entities:**
- `Patient`, `Doctor`, `Specialty`, `DoctorSpecialty`
- `DoctorAvailability`, `DoctorRating`
- `Appointment`, `AppointmentPayment`

**React Workflows:**
- Patient dashboard
- Symptom input form
- Doctor listing with search/filter/sort
- Doctor profile and availability
- Appointment booking, history, and status
- Payment status
- AI recommendation results display

**Flutter Workflows:**
- Patient login/registration
- Symptom entry
- AI doctor recommendations
- Doctor details
- Appointment booking (with date/time picker)
- Appointment tracking and history

**Testing:**
- Backend unit + API tests, validation tests
- React component/form tests
- Flutter widget and integration tests
- Agent evaluation tests

### B. AI Responsibility — 🩺 Specialist & Doctor Recommendation Agent

**Workflow:**
```
Patient Symptoms → Symptom Analysis → Specialty Recommendation
→ Retrieve Matching Doctors → Calculate Score → Rank Doctors
→ Explain Recommendation → Patient Selects Doctor
```

**Ranking factors:** Specialty match, doctor rating, experience, reviews, availability, location.

**Agent Tools:**
- `searchSpecialties(symptoms)`
- `searchDoctors(specialtyId)`
- `getDoctorRating(doctorId)`
- `getDoctorAvailability(doctorId)`
- `calculateDoctorScore(doctor, factors)`

> The agent must clearly state this is a specialty/doctor **recommendation, not a diagnosis**.

---

## 📋 Member 2 — Doctor Consultation & Clinical Management

### A. SE Responsibility

**ASP.NET Core APIs:**
```
GET    /api/doctors/appointments
GET    /api/appointments/{id}/clinical-record
POST   /api/consultations
PUT    /api/consultations/{id}
POST   /api/clinical-analysis
POST   /api/diagnosis/{id}/decision
```

**PostgreSQL Entities:**
- `ClinicalRecord`, `Consultation`, `PatientHistory`
- `Allergy`, `Examination`, `LabResult`
- `DiagnosisSuggestion`, `DoctorDecision`

**React Workflows:**
- Doctor dashboard (verified appointments only)
- Patient consultation screen
- Clinical information and examination forms
- Lab result view
- AI suggestion display with Accept / Modify / Reject controls
- Consultation history

**Flutter Workflows:**
- Doctor login, appointment status
- Patient consultation information
- AI result review, consultation status updates

**Testing:**
- Clinical API tests, authorization tests
- React component tests, Flutter tests
- AI golden-case tests, validation and integration tests

### B. AI Responsibility — 🧠 Clinical Decision Support Agent

**Workflow:**
```
Clinical Information → Analyze Symptoms → Retrieve Relevant Cases
→ Generate Possible Diagnoses → Rank Suggestions
→ Generate Confidence / Evidence → Suggest Tests → Doctor Review
```

**Example output:**
```
Possible Diagnoses:
  Condition A — 92%
  Condition B — 68%
  Condition C — 32%

Supporting factors: Symptom X, Finding Y, Lab result Z
```

**Doctor options:** ACCEPT / MODIFY / REJECT

**Agent Tools:**
- `getPatientClinicalData(patientId)`
- `searchClinicalKnowledge(symptoms, findings)`
- `retrieveSimilarCases(clinicalProfile)`
- `validateDiagnosisOutput(suggestions)`

> The AI must **not** independently finalize a diagnosis. The human doctor retains full control.

---

## 🔄 Receptionist Workflow

```
Patient Books Appointment → Payment → Receptionist
→ Verify Payment → Confirm Appointment
→ Generate Appointment Number → Doctor Portal
```

> **Only verified appointments appear in the doctor's portal.**

---

## 📋 Member 3 — E-Prescription & Medicine Ordering

### A. SE Responsibility

**ASP.NET Core APIs:**
```
GET    /api/medicines
GET    /api/medicines/{id}
GET    /api/pharmacies/{id}/medicine-availability
POST   /api/prescriptions
GET    /api/prescriptions/{id}
POST   /api/orders
GET    /api/orders/{id}
POST   /api/orders/{id}/payment
PUT    /api/orders/{id}/status
```

**PostgreSQL Entities:**
- `Medicine`, `MedicineCategory`, `PharmacyMedicine`
- `Prescription`, `PrescriptionItem`
- `MedicineOrder`, `OrderItem`, `OrderPayment`

**React Workflows:**
- Pharmacist dashboard
- Prescription list and details
- Medicine order processing with auto price calculation
- Payment and order status, order history

**Flutter Workflows:**
- Patient e-prescription viewing
- Medicine order viewing, price display
- Order tracking, history, notifications

**Testing:**
- Prescription and order API tests
- Price calculation unit tests
- React component tests, Flutter tests, agent tests, integration tests

### B. AI Responsibility — 💊 Medication Intelligence Agent

**Workflow:**
```
Doctor Selects Medicine → Medication Agent → Check Pharmacy Inventory
→ Check Quantity → YES: Continue | NO: Find Alternatives → Doctor Decision
```

**Agent Tools:**
- `searchMedicine(name, dosage)`
- `checkInventory(medicineId, pharmacyId)`
- `checkMedicineQuantity(medicineId, required)`
- `findPotentialAlternatives(medicineId)`
- `validatePrescription(prescriptionData)`

> The AI must **not** automatically replace the prescribed medicine. The doctor makes the final decision.

---

## 🔄 E-Prescription Workflow

```
Doctor confirms medicines → Generate E-Prescription
→ Patient Portal + Pharmacist Portal
```

**Prescription contains:** Prescription ID, appointment number, patient/doctor ID, date, medicines with dosage/quantity/frequency/duration, status.

**Pharmacist Order Calculation Example:**
```
Amoxicillin × 20 @ Rs. 25 = Rs. 500
Paracetamol × 10 @ Rs. 10 = Rs. 100
                   TOTAL   = Rs. 600
```

---

## 📋 Member 4 — Pharmacy Inventory & Supplier Management

### A. SE Responsibility

**ASP.NET Core APIs:**
```
GET    /api/pharmacies/{id}/inventory
POST   /api/pharmacies/{id}/inventory
PUT    /api/inventory/{id}
GET    /api/inventory/low-stock
POST   /api/restock-requests
GET    /api/restock-requests
PUT    /api/restock-requests/{id}
POST   /api/suppliers/{id}/approve
```

**PostgreSQL Entities:**
- `Pharmacy`, `PharmacyInventory`, `InventoryHistory`
- `Supplier`, `SupplierMedicine`
- `RestockRequest`, `RestockRequestItem`

**React Workflows:**
- Pharmacy owner dashboard, inventory management
- Low-stock alert dashboard
- Demand analytics, restock recommendations with approval controls
- Supplier dashboard, request management
- Pharmacy ratings and feedback dashboard

**Flutter Workflows:**
- Pharmacist stock checking, stock updates
- Low-stock notifications, restock status, supplier request status

**Testing:**
- Inventory API tests, restocking business-rule tests
- React and Flutter tests, forecasting/AI tests
- Integration and performance tests

### B. AI Responsibility — 📦 Pharmacy & Inventory Intelligence Agent

**Workflow:**
```
Historical Orders → Demand Analysis → Demand Forecast
→ Inventory Analysis → Stockout Prediction
→ Restocking Recommendation → Pharmacist Approval → Supplier Request
```

**Agent Tools:**
- `getInventory(pharmacyId)`
- `getHistoricalOrders(medicineId, period)`
- `calculateDemand(historicalData)`
- `forecastDemand(medicineId, horizon)`
- `predictStockout(currentStock, forecastedDemand)`
- `generateRestockRecommendation(stockoutPrediction)`

> The pharmacist/pharmacy owner must **approve** before a supplier request is created.

---

## 🔄 Supplier Portal

The supplier can: register/login, manage profile, view medicines supplied, view restock requests, approve/reject, update supply status, view supply history.

---

## 💬 Pharmacy Feedback & Rating

After a completed medicine order, patients can rate the pharmacy (1–5 stars) and submit feedback. The system calculates average rating, distribution, and recent feedback. Only completed transactions allow feedback.

---

## 🤖 Agentic Orchestrator

The orchestrator must:
1. Receive a domain objective
2. Create a structured execution plan
3. Select and delegate tasks to appropriate agents
4. Allow agents to call allow-listed tools only
5. Validate inputs and outputs at each step
6. Persist workflow state
7. Apply business-rule validation
8. **Pause high-impact actions for human approval**
9. Continue or revise the workflow based on approval
10. Produce an auditable result or safe failure

### Shared Workflow State Schema
```json
{
  "workflowId": "uuid",
  "objective": "string",
  "plan": ["step1", "step2"],
  "currentStep": "string",
  "completedSteps": ["step1"],
  "agentResults": {},
  "toolResults": {},
  "validationResults": {},
  "approvalStatus": "PENDING | APPROVED | REJECTED",
  "errors": [],
  "retries": 0,
  "finalOutcome": "string",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

> Do **not** store: chain-of-thought reasoning, passwords, tokens, or unnecessary sensitive information.

---

## ✋ Human-in-the-Loop Approval Points

| Trigger | Approver | Options |
|---|---|---|
| AI clinical diagnosis suggestion | Doctor | ACCEPT / MODIFY / REJECT |
| AI restock recommendation | Pharmacist / Owner | APPROVE / REJECT |
| Appointment payment verification | Receptionist | CONFIRM / REJECT |
| Medicine alternative suggestion | Doctor | SELECT / REJECT |

---

## 🛡️ Validation & Safety

- Schema validation (DTO-level)
- Business-rule validation (service layer)
- Input sanitization (prompt-injection resistance)
- Output validation (agent responses)
- Role-based authorization on every endpoint
- Tool allow-lists (agents cannot call arbitrary functions)
- Timeouts and retry limits
- Safe failure with structured error responses
- Error logging and audit logging

---

## 🌐 React Web Application Requirements

**Primary audience:** Staff and administrative workflows.

- Functional components + React Hooks
- React Router with protected routes + role-based navigation
- Reusable component library (shadcn/ui)
- Search, filtering, sorting, pagination
- Loading states and error states
- Form validation
- Agent monitoring dashboard, human approval interfaces
- Execution history views

---

## 📱 Flutter Mobile Application Requirements

**Primary audience:** Patients and operational mobile workflows.

- Shared API service layer communicating with ASP.NET Core only
- Secure JWT storage
- At least one meaningful device feature:
  - GPS/Maps for nearby doctors/pharmacies
  - Push notifications
  - Date/time picker for appointment booking

**Patient flows:** Registration → Login → Symptom Entry → AI Recommendations → Doctor Search → Appointment Booking → Appointment Tracking → E-Prescription Viewing → Medicine Order Tracking → Order History → Pharmacy Rating

---

## 🏛️ Backend Architecture

```
ASP.NET Core Web API → Controllers → DTOs
→ Application / Service Layer → Data Access Layer
→ Entity Framework Core → PostgreSQL
```

The backend is the **authoritative** layer for all APIs, auth, validation, business rules, persistence, agent workflow initiation/approval, and audit logging.

---

## 🔐 Authentication & Security

- JWT Authentication + BCrypt password hashing
- Role-based authorization on every endpoint
- DTO validation (FluentValidation)
- CORS policy
- Global exception handling + structured logging
- Swagger/OpenAPI

| Role | Accessible APIs |
|---|---|
| Patient | Patient, Appointment, Prescription (own), Order (own) |
| Doctor | Clinical, Consultation, Prescription creation |
| Receptionist | Appointment verification |
| Pharmacist | Prescription processing, Order management |
| Pharmacy Owner | Inventory, Restock, Supplier |
| Supplier | Supplier, Restock requests |
| Admin | All APIs + User management |

---

## 🗄️ Database Requirements

- UUID primary keys, foreign key constraints, check constraints
- Indexes on foreign keys and frequently queried columns
- EF Core migrations (no manual SQL schema changes)
- Seed data for realistic testing
- Database transactions where required
- `CreatedAt` / `UpdatedAt` timestamps on all entities

**Deliver:** A complete ER diagram covering all entities.

---

## 🗺️ Third-Party Integration

Integrate at least **one** meaningful third-party service:

| Service | Use Case |
|---|---|
| Google Maps / Mapbox | Doctor/pharmacy locations, nearby providers, distance |
| Payment Gateway (sandbox) | Appointment and order payment simulation |
| Email / SMS | Appointment confirmation, prescription notifications |
| Firebase | Push notifications for Flutter app |

> External services must be accessed through ASP.NET Core. Credentials in environment variables/secrets — never committed to Git.

---

## 🧪 Testing Requirements

### Backend (xUnit)
- Unit tests for service layer
- Validation, authentication, authorization tests
- Controller/API integration tests
- Database constraint and migration tests

### React
- Component render tests, form validation tests
- Protected route tests, API integration tests, error state tests

### Flutter
- Unit tests, widget tests, validation, navigation, API integration tests

### Agentic AI
- Golden case tests (deterministic known inputs → expected outputs)
- Planning and delegation tests
- Tool selection validation, structured output schema tests
- Business-rule validation, human approval flow tests
- Prompt-injection resistance tests, failure recovery tests

> **LLM-as-a-judge cannot be the only evaluation method.** Use rule-based assertions, schema validation, golden cases, deterministic validators, and human review.

### Performance Testing
- API response time under load, concurrent request handling
- Database query response time, agent workflow latency
- End-to-end workflow completion time

---

## 🔁 GitHub Workflow

- One shared GitHub repository
- Feature branches per component (`feature/patient-appointment`, `feature/clinical`, etc.)
- Meaningful, atomic commits with clear messages
- GitHub Issues, pull requests with peer code review
- GitHub Project board, conflict resolution via PR process

> **Each member must have visible, regular technical contributions. Do not create artificial commits or bulk-upload at the end.**

---

## ⚙️ GitHub Actions CI

```yaml
on: [push, pull_request]

jobs:
  backend:
    steps:
      - Restore NuGet packages
      - Build ASP.NET Core solution
      - Run xUnit tests
      - Report pass / fail

  frontend:
    steps:
      - npm install
      - npm run build
      - Run React tests

  flutter:
    steps:
      - flutter pub get
      - flutter test
```

---

## 📄 Documentation Requirements

| Document | Owner |
|---|---|
| Consolidated Group Report | All members |
| Individual Report × 4 | Each member |
| Architecture Diagrams | All members |
| ER Diagram | All members |
| Swagger / OpenAPI Docs | Auto-generated + annotated |
| Agent Architecture & Workflow Diagrams | All members |
| Testing Report | All members |
| Performance Report | All members |
| Deployment Report | All members |
| ADR (Architecture Decision Records) | All members |
| AI Usage Log (individual) | Each member |
| Group AI Declaration | All members |

---

## 📝 AI Usage Log (Per Member)

| Date | Tool/Model | Task | What AI Produced | What Was Changed/Rejected | How Result Was Verified |
|---|---|---|---|---|---|
| YYYY-MM-DD | GPT-4 / Gemini / etc. | e.g., "Generate EF Core entity" | e.g., "Complete entity class" | e.g., "Added missing index" | e.g., "Ran migration + manual test" |

> Do **not** submit code or features that a member cannot explain, test, modify, or debug. External AI tools are **not** allowed during the final demonstration/viva.

---

## 👥 4-Member Responsibility Matrix

| Area | Member 1 | Member 2 | Member 3 | Member 4 |
|---|---|---|---|---|
| **Primary Component** | Patient & Appointment | Doctor & Clinical | Prescription & Orders | Inventory & Supplier |
| **ASP.NET Core** | Patient/Appointment APIs | Clinical APIs | Prescription/Order APIs | Inventory/Supplier APIs |
| **PostgreSQL** | Patient/Appointment data | Clinical data | Prescription/Order data | Inventory/Supplier data |
| **React** | Patient/Admin workflows | Doctor workflows | Pharmacist workflows | Pharmacy/Supplier workflows |
| **Flutter** | Patient mobile | Doctor/operational mobile | Patient/order mobile | Pharmacist/stock mobile |
| **AI Agent** | 🩺 Specialist & Doctor | 🧠 Clinical Decision Support | 💊 Medication Intelligence | 📦 Inventory Intelligence |
| **Testing** | Own component + agent | Own component + agent | Own component + agent | Own component + agent |
| **Git** | Regular contributions | Regular contributions | Regular contributions | Regular contributions |
| **Documentation** | Individual evidence | Individual evidence | Individual evidence | Individual evidence |

> **This table represents primary ownership, not isolated development.** Every student must demonstrate technical contribution across the full stack.

---

## 🔄 Final End-to-End Workflow

```
                       PATIENT
                          │
                          ▼
                  Enter Symptoms
                          │
                          ▼
      🩺 SPECIALIST & DOCTOR AGENT
                          │
               Specialty + Doctor Ranking
                          │
                          ▼
                   Select Doctor
                          │
                          ▼
                 Book Appointment
                          │
                          ▼
                      PAYMENT
                          │
                          ▼
                   RECEPTIONIST
                          │
               Verify Payment + Confirm
                          │
                          ▼
               Generate Appointment No.
                          │
                          ▼
                       DOCTOR
                          │
                          ▼
      🧠 CLINICAL DECISION SUPPORT AGENT
                          │
               AI Diagnosis Suggestions
                          │
                          ▼
           Doctor ACCEPT / MODIFY / REJECT
                          │
                          ▼
            Select Required Medicine(s)
                          │
                          ▼
         💊 MEDICATION INTELLIGENCE AGENT
                          │
               Check Pharmacy Availability
                          │
                          ▼
               Doctor Confirms Medicine(s)
                          │
                          ▼
                    E-PRESCRIPTION
                   ↙              ↘
               PATIENT         PHARMACIST
                                   │
                          Calculate Price
                                   │
                             PAYMENT
                                   │
                           Process Order
                                   │
                                   ▼
          📦 INVENTORY INTELLIGENCE AGENT
                                   │
                        Demand Prediction
                        Stock Prediction
                       Restock Suggestion
                                   │
                                   ▼
           ✋ HUMAN APPROVAL (Pharmacist/Owner)
                                   │
                                   ▼
                             SUPPLIER
                                   │
                                   ▼
                        Inventory Updated
```

---

## 🎯 Final Rule

> **Do not** present the project as:
> *"Member 1 does React, Member 2 does backend, Member 3 does AI..."*
>
> **Do** present it as:
> *"Each member owns one major business component and is responsible for its ASP.NET Core API, PostgreSQL model, React workflow, Flutter workflow, testing, documentation, Git evidence, and one distinct Agentic AI contribution."*

The assignment requires **at least one complete cross-platform workflow** passing through:

```
React/Flutter → ASP.NET Core → PostgreSQL → Agentic AI → Human Approval → Updated Result
```

The four components must be integrated — **not four separate mini-projects**.
