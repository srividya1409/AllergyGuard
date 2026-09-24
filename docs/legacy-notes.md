# Legacy notes

Notes on what's worth porting from `legacy/` (the retired Sprint 1
React Native/Expo + Express codebase) into the current Next.js/Supabase
build, and where the old approach falls short of the rules in `CLAUDE.md`.

## `legacy/api/allergenMatcher.js` → Phase 3 (`checkAllergens()`)

Worth reusing: the `ALLERGEN_ALIASES` map is a solid starting point for the
synonyms map — peanuts, tree nuts, milk, eggs, wheat, soy, fish, shellfish,
and sesame each already have a reasonable synonym list (e.g. milk: casein,
whey, lactose, butter). The longest-alias-wins matching approach (sorting
aliases by length before testing) is also a sound idea worth keeping.

Gaps versus CLAUDE.md's verdict rules — all three need fixing in Phase 3,
not carried over as-is:
- No "may contain" / "traces of" handling at all, so there's no path to
  Caution for shared-facility or precautionary warnings.
- The result (`{ status, flagged }`) has no plain-language explanation and
  no raw scanned/extracted text — CLAUDE.md requires both on every verdict.
- `"safe"` falls out as the default whenever nothing matches, with no check
  that ingredient text was actually obtained. Missing or empty input should
  never resolve to Safe.
- Category keys use plurals/underscores (`peanuts`, `tree_nuts`) that don't
  exactly match CLAUDE.md's naming (`peanut`, `tree nuts`) — reconcile
  before reusing the map directly.

## `legacy/database/schema.sql` → Phase 1 migration

Worth reusing: the general shape (users, a profile-ish table, scan history,
reactions) maps roughly onto the new domain, and `scan_history` /
`reactions` are a reasonable reference for those later tables.

Gaps versus CLAUDE.md's data model — Phase 1 should not copy this schema
directly:
- No `profiles` / `owner_id` split — `allergy_profiles` hangs directly off
  `users`, so there's no way to support multiple profiles per owner
  (family/caregiver use case) later.
- No Row Level Security anywhere in the schema.
- Emergency contact and medication are flat columns on `allergy_profiles`
  (`emergency_medication`, `emergency_contact_name`, `emergency_contact_phone`)
  rather than their own tables — there's no medication table at all, and
  therefore no expiry date field for the Phase 7 reminder work.

## `legacy/backend` and `legacy/frontend`

Kept for reference only, not intended to be ported as code — both are fully
superseded by Supabase Auth and Next.js per CLAUDE.md's stack.

- `legacy/backend`: Express routes for `/auth`, `/profile`, `/scan` — useful
  as a checklist of what the old API surface covered when checking feature
  parity, nothing more.
- `legacy/frontend`: Expo screens (SignUp, Login, Onboarding, Profile,
  Scanner, Result) — same, useful as a UX/flow reference, not as source to
  reuse.
