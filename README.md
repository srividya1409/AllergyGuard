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
├── src/
│   ├── app/               # Routes and pages (Next.js App Router)
│   ├── components/        # UI components
│   └── lib/
│       ├── allergen/      # checkAllergens() — pure matching logic, no UI/network
│       ├── offline/        # Dexie database and offline helpers
│       └── supabase/       # Supabase clients (browser and server)
├── supabase/migrations/    # SQL migrations
├── docs/                   # Build plan and notes (see docs/legacy-notes.md)
├── legacy/                 # Retired Sprint 1 mobile/Express stack — see docs/legacy-notes.md
├── documentation/          # PRD, SPEC, and sprint deliverables
├── testcases/              # Test cases for core flows
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

```bash
npm install
cp .env.example .env.local   # fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

## Tech Stack

- **Framework:** Next.js (App Router), TypeScript (strict), Tailwind CSS
- **Backend:** Supabase — Postgres, Auth, Storage, Edge Functions, pg_cron
- **Offline:** Serwist (service worker) + Dexie (IndexedDB)
- **Scanning:** @zxing/browser (barcode), Tesseract.js (label OCR)
- **External APIs:** Open Food Facts (product and ingredient data)
- **Testing:** Vitest
- **Deployment:** Vercel

## Branching Strategy

- `main` — stable, integrated, demonstrable code only
- `feature/*` — one branch per user story; merged into `main` via reviewed Pull Request

See `documentation/AllergyGuard_Sprint4.pdf` for the full Git workflow, commit
history, and Pull Request records for this sprint.
