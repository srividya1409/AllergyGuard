# Allergy Guard

A unified mobile platform for personal allergen safety. Allergy Guard consolidates
allergy profile management, product verification, and emergency response into a
single application, built around one persistent allergy profile that is checked
automatically rather than recalled manually.

## Team

| Name | Registration No. | Role |
|---|---|---|
| Jessica Jacob | 23MIS1054 | Product Owner |
| Muhammad Talha | 23MIS1075 | Scrum Master |
| Srividya Rajagopalan | 23MIS1037 | Developer |

## Project Structure

```
AllergyGuard/
├── frontend/          # React Native (Expo) mobile app
│   └── src/
│       ├── screens/       # Sign up, Login, Onboarding, Profile, Scanner, Emergency
│       ├── components/    # Reusable UI components
│       └── services/      # API client, auth token storage
├── backend/           # Node.js / Express API
│   └── src/
│       ├── routes/        # /auth, /profile, /scan endpoints
│       ├── models/        # Data models
│       └── middleware/    # Auth middleware
├── database/           # Schema definition
├── api/                 # Shared allergen-matching logic (F7, used by barcode & OCR scans)
├── documentation/        # PRD, SPEC, and sprint deliverables
├── testcases/            # Test cases for core flows
├── .gitignore
└── README.md
```

## Sprint 1 Scope (this initial commit)

This initial codebase covers the six Sprint 1 user stories selected during Sprint 3
planning:

| Story | Feature | Branch |
|---|---|---|
| US-01 | Sign up with email & password | `feature/user-signup` |
| US-02 | Log in securely | `feature/user-login` |
| US-03 | Onboarding wizard | `feature/onboarding-wizard` |
| US-07 | Select allergy categories | `feature/select-allergy-categories` |
| US-09 | Edit profile | `feature/edit-profile` |
| US-11 | Scan barcode → verdict | `feature/barcode-scan-verdict` |

## Getting Started

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npx expo start
```

## Tech Stack

- **Frontend:** React Native (Expo), expo-camera, expo-secure-store
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (schema in `/database`)
- **External APIs:** Open Food Facts (barcode lookup)

## Branching Strategy

- `main` — stable, integrated, demonstrable code only
- `feature/*` — one branch per user story; merged into `main` via reviewed Pull Request

See `documentation/AllergyGuard_Sprint4.pdf` for the full Git workflow, commit
history, and Pull Request records for this sprint.
