# Comfort Stay PG — Business Logic & UX Audit
**Date:** 2026-09-27 | **Scope:** All 44 pages · 55 API routes · 14 data models · 3 utility libraries

---

## Application overview

Comfort Stay PG is a full-stack PG (hostel) management system with three roles:
- **Admin** — full access to residents, rooms, payments, dues, expenses, notices, complaints, registrations, reports
- **Manager** — expenses and complaints only (currently broken — see P0)
- **Resident** — dashboard with rent status, complaints, notices, checkout

The core data cycle is: **Registration → Room Assignment → Monthly Due Generation → Payment Recording → Due Reconciliation → Checkout / Archive**.

---

## 🔴 P0 — Broken today / data integrity / security

### 1. Three competing due-calculation engines overwrite each other

**The single biggest architecture problem in the whole app.**

Three separate code paths write to the same `UserDue` fields with different formulas and different assumptions:

| Engine | Where | Handles credit? | Handles settlements? | Proration rounding |
|---|---|---|---|---|
| `recalculateUserDuesAfterPayment` | `POST /api/payments` | ❌ | ❌ | Math.ceil |
| `calculateTotalDueWithCredit` | `POST/PUT /api/user-dues` | ✅ | ❌ | toFixed(2) |
| `calculateTotalDue` | `POST /api/user-dues/recalculate` | ❌ | ❌ | toFixed(2) |

The final stored value depends on which endpoint ran last. After any payment is recorded, credit is wiped from the due record. After any recalculation, carry-forward arrears can drift. The settlement layer (applied by `/api/users/with-dues`) is never written back into `UserDue`, so the amount shown on screen silently diverges from the amount stored.

**Additionally:** `recalculateUserDuesAfterPayment` completely ignores the `months` array on the payment it was just handed — it pools all payments ever and re-allocates from the oldest arrear. A prepayment for a future month is silently consumed by old debt.

**Fix needed:** One canonical due-calculation function (uses credit + settlements), called everywhere. The `months` on each payment must be respected.

---

### 2. Any resident dashboard can crash for everyone

`src/app/dashboard/page.tsx:907` renders `{notice.createdBy.name}` with no null guard. When the admin posts a notice through the UI, `src/app/api/notices/route.ts` mints a throwaway `ObjectId` as `createdBy` instead of the real admin ID, so `populate()` returns `null`. Result: every resident who opens their dashboard gets a TypeError crash. The admin notices page handles this defensively; the resident page does not.

---

### 3. Three unauthenticated public-facing API endpoints

`GET /api/visit-requests`, `GET /api/contact-inquiries`, and `GET /api/subscribers` have no auth check at all. Anyone on the internet can page through every prospective resident's name, phone, email, and message, plus the full subscriber list. These endpoints need `isAuthenticated` + `isAdmin` immediately.

---

### 4. The Manager role is fully broken

`User.role` enum is `["admin", "user"]` — `"manager"` does not exist in the database schema. The auth layer's `isAdmin` check is `role === "admin"`, so managers have no elevated access. The manager complaints page fetches the manager's own complaints (zero results) and every `PUT /api/complaints/:id` returns 403. There is also no `manager` layout/nav — the manager dashboard is a dead static page with no auth guard. Either the `manager` role needs to be implemented end-to-end, or the pages need to be removed.

---

### 5. Admin dashboard privacy mode is inverted + hardcoded password in the browser

`const PRIVACY_PASSWORD = "Comfort@887"` is shipped to every browser (anyone can open DevTools and read it). The toggle itself has inverted logic: `formatRentAmount` returns `"****"` when privacy is **off** and real numbers when privacy is **on`. Turning privacy "on" reveals financials instead of hiding them. Also: the "Privacy Mode" gate only hides two stat cards; every table, chart, and payment row below is still fully visible.

---

### 6. Regex injection / ReDoS in payment and settlement searches

`GET /api/payments` and `GET /api/settlements` interpolate raw user-supplied search text directly into MongoDB `$regex`. An admin-level attacker can run catastrophic backtracking patterns against the database or extract arbitrary data. Must be escaped: `searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`.

---

### 7. Resident reactivation form sends wrong room field and wrong payment enums

`admin/users/checkouts/[id]/page.tsx` renders room options as `{room.roomType}` but the API returns `type` — every option shows "Room 101 — **undefined**". The payment method dropdown offers `Credit Card` / `Debit Card`, which do not exist in the `Payment` model enum (`Cash | UPI | Bank Transfer | Card | Other`) and will be rejected at validation. The reactivation flow is functionally broken.

---

### 8. Expense API has no role-based access control

`GET /api/expenses` only checks that the caller is authenticated — any resident can list every expense with creator names and emails. `POST /api/expenses` is open to any authenticated user. `PUT /api/expenses` (approve/reject) records no approver identity and no timestamp.

---

### 9. Resident payment CTA goes nowhere

The dashboard shows a red "Rent due — Pay now" alert. The button is `href="#"`. The Modes tile says "Cash Only". There is no online payment page, no upload-proof flow, nothing. Residents are shown urgency with no action to take.

---

### 10. `debugger;` statement in production code

`src/app/admin/users/page.tsx:214` contains a live `debugger;` inside the filter effect. Any admin using Chrome/Firefox DevTools has their browser paused every time a filter changes.

---

## 🟠 P1 — High-impact business logic bugs

### 11. Due generation bills residents for months before they moved in

`PUT /api/user-dues` (bulk generate) runs for every active user with no check that the target month is ≥ their `moveInDate`. Running "Generate Dues" for any past month creates a full-rent due for a user who wasn't there yet. Similarly, there is no move-out proration — a resident who left mid-month is billed the full month.

### 12. Arrears double-count inflates all "total due" figures

`UserDue.previousUnpaidDue` is the sum of every earlier month's `remainingDue`. It is added into this month's `totalDue` while the earlier records keep their own `remainingDue`. Any cross-month `SUM(totalDue)` — including the "Total Unpaid" stat the admin sees — is inflated. This is baked into the schema design.

### 13. Notice-period rule is unenforced and off-by-one

The UI states "Minimum 15 days". The date input `min` is today (so 1 day is accepted). The code tests `> 15` not `>= 15`, so an exactly-15-day notice is refused the ₹1500 refund the policy promises. The refund decision is made client-side and asserted in the UI — a resident who manipulates the request body can claim the refund without meeting the condition. The 15-day and ₹1500 figures are hardcoded in three separate places.

### 14. Payment editing creates unresolvable state

`dueDate` is required on the edit form but is never collected on create. Every payment created through the UI lacks a `dueDate`. Editing any such payment forces the admin to supply a date that was never captured. There is also no duplicate-month guard on the edit path — two payments can cover the same month via edit.

### 15. CSV exports ignore active filters / have column mismatches

- **Users page:** exports all loaded users, not the filtered set
- **Missing payments:** CSV header has 8 columns but each row pushes 9 values (unlabelled PG ID column shifts everything)
- **Archives:** exports the full unfiltered list at fetch time
- All three CSV writers use different (incomplete) escaping — embedded quotes and ₹ signs corrupt Excel imports

### 16. Floors hardcoded to [1–6] — rooms above floor 6 are invisible

`admin/rooms/page.tsx` iterates a literal `[1,2,3,4,5,6]` for the grouped view. Any room on floor 7+ is silently excluded from the page and from the floor filter. Buildings are correctly derived from data; floors are not.

### 17. Checkout analytics computed from unfiltered data

`admin/users/checkouts/page.tsx` computes all analytics once at fetch time. Applying the "Last Month" or "Last 3 Months" time filter narrows the table but leaves the analytics cards showing all-time numbers. The charts and averages actively mislead.

### 18. `keyIssued` semantics inverted in checkout list

`keyIssued === true` → "Not Returned", falsy → "Returned". A resident who was never issued a key appears to have "Returned" one. The same inversion appears in the CSV export.

### 19. Settings page can wipe PG record on fetch failure

If `GET /api/pg-details` fails, the form keeps its blank defaults. Clicking Save immediately overwrites the PG record with empty strings for name, contact, bank details, everything. There is no dirty-state check, no unsaved-changes guard, and "Refresh" discards edits without warning.

### 20. `totalUnpaidDues` and `unpaidUsersCount` measure different things on the same page

`admin/users/page.tsx` computes two "unpaid" stats from different definitions — one sums `dueAmount`, the other counts users whose `currentMonthRentStatus === "Unpaid"` — and shows both as if they're consistent. Both stat cards ignore all active filters and include inactive/deleted users.

---

## 🟡 P2 — UX / consistency / data-display problems

### 21. Two competing "Residents" data sources

`/admin/residents` (using `/api/residents`) and `/admin/users` (using `/api/users/with-dues`) show overlapping resident data from different APIs with different status vocabularies. `/admin/inactive-users` is a stub that redirects to checkouts. Two archive pages (`/admin/users/archives` and `/admin/users/checkouts`) pull from different APIs (`/api/admin/users/archives` vs `/api/user-archives`) with different fields. Strong candidates for consolidation.

### 22. Resident cannot see complaint outcomes

There is no complaint list or detail view for residents — only a "new complaint" form. The dashboard truncates 4 cards with no "view all". The `Complaint` model stores `resolution`, `assignedTo`, and `resolvedAt`, but residents never see them. No notification is sent when a complaint status changes. Complaints are a black hole from the resident's perspective.

### 23. Complaint form throws away the model's structure

The form captures only title and description. `category`, `priority`, and photo attachment are not offered. Every complaint is filed as Maintenance / Medium. The admin UI shows priority badges but has no control to change priority — every badge reads "Medium Priority" forever.

### 24. Notification system uses a sentinel string instead of a real reference

Eleven routes write `userId: "admin_id_123456789"` (a hardcoded string) into `Notification.userId` (a Mixed field). Four other routes fan out to real admin ObjectIds. `GET /api/notifications` papers over this with an `$in` that includes the sentinel. Per-admin read-state is impossible for half the notification types, and the `Notification.user` virtual can never resolve for sentinel notifications.

### 25. No PG ID shown on the user detail page

PG ID is the primary identifier used in every list, table, and receipt across the app — but it is absent from `admin/users/[id]/page.tsx`. Similarly, there is no balance summary (total outstanding, credit available) on the user detail page — dues exist only on the list.

### 26. Resident dashboard misleads with "0 months" for new joiners

"Stay Duration" counts whole calendar months. A resident who moved in 3 weeks ago sees "0 months". Month-to-month payment matching uses `toLocaleString("default", ...)` — a locale or timezone mismatch silently shows the wrong rent status.

### 27. Admin push-notification page is entirely non-functional

`/admin/notifications` POSTs to `/api/notifications/send` which does not exist (404). The page also has no link in the admin sidebar, so it is unreachable through the UI. Either implement the endpoint and add the nav link, or remove the page.

### 28. Three separate feedback/toast systems used inconsistently

- `window.alert` — dashboard, expenses
- `useToast` hook — users, user detail, notices, room-change
- `react-hot-toast` — checkouts pages

Multiple pages stack two or three feedback mechanisms on the same action.

### 29. Hardcoded personal phone number + emergency contacts in JSX

`admin/settings/page.tsx` defaults `contactPhone` to `"9922538989"`. The resident dashboard hardcodes warden phone `9922538989`, Ambulance `108`, Ruby Hall clinic name directly in JSX — these can only be changed by redeploying code, not through settings.

### 30. Registration PII stored in localStorage indefinitely

The full 2-step registration form — including permanent address, guardian phone, employee ID, and Cloudinary URLs of the Aadhaar/ID scan — is persisted to `localStorage` and only cleared on successful submit. An abandoned or timed-out registration leaves sensitive document links on the device.

---

## 🔵 P3 — Quality, scale, and future-readiness

### 31. No server-side pagination or filtering for users, rooms, or archives

Every large list fetches the full collection and slices in memory. The dashboard additionally fetches all payments (`limit=0`) and recomputes dues client-side. This will slow significantly with real-scale data.

### 32. Months stored as localized display strings

`Payment.months`, `UserDue.month`, and `DueSettlement.month` are stored as `"September 2025"`. Every filter and join is a string equality or regex against a value produced by `toLocaleString("default", ...)` on either the browser or the server. Any locale/timezone mismatch produces silent misses. Chronological sorting requires the separate `monthNumber` column. Consider storing `YYYY-MM` (ISO) and deriving the display string.

### 33. N+1 query loops in due generation — serverless timeout risk

`PUT /api/user-dues` and both recalculate paths run ≈5 queries per user in a sequential loop with no transaction. A partial run leaves a half-generated month with no way to detect which users succeeded. Batching + a transaction (or a background job) is needed before the resident count grows.

### 34. No audit trail for financially significant mutations

Payment edits, expense approve/reject, bulk due regeneration, and deposit-triggered registration approval are all silent — no record of who changed what. `DueSettlement` is the only model that records the acting admin. At minimum, `updatedBy` on Payment and Expense is needed.

### 35. Interface/schema drift — TypeScript types lie in several places

`src/app/api/interfaces/models.ts` is out of sync:
- `IUser.role` includes `"manager"` (not in schema enum)
- `IPayment` is stale (wrong paymentStatus values, has `isDeleted`)
- `IDueSettlement` lacks `isOverall`, marks `month` required
- `INotification.type` missing `"Visit"`
- `IUserArchive.userId` typed `string` vs ObjectId

### 36. Missing resident self-service capabilities

The resident portal has none of: room-change request, maintenance-visit scheduling, payment proof upload, profile edit, document re-upload, meal/laundry features, or visitor pass request. The "Events & Activities" section is a hardcoded empty placeholder.

### 37. Accessibility gaps throughout

Clickable `<tr>` and `<div>` rows with no keyboard support, `div`-based dropdowns with no focus management or Escape-close, modals without `role="dialog"` / `aria-modal` / focus trap, icon-only buttons without `aria-label`.

---

## Phased improvement roadmap

### Phase 1 — Fix what is broken today (1–2 sprints)

| # | What | Files |
|---|---|---|
| 1.1 | Fix `notice.createdBy?.name` null crash in resident dashboard + fix notices route to use real admin ID | `dashboard/page.tsx:907`, `api/notices/route.ts:80` |
| 1.2 | Add `isAuthenticated + isAdmin` to visit-requests, contact-inquiries, subscribers GET routes | 3 route files |
| 1.3 | Remove `debugger;` and all `console.log` PII leaks | `admin/users/page.tsx:214`, rooms page, dashboard |
| 1.4 | Move privacy password server-side, fix the inverted privacy-mode logic | `admin/page.tsx` |
| 1.5 | Fix `room.type` (not `roomType`) and remove Credit/Debit Card options in reactivation form | `checkouts/[id]/page.tsx` |
| 1.6 | Add regex escaping to payment and settlement search | `api/payments/route.ts`, `api/settlements/route.ts` |
| 1.7 | Guard Settings save against blank-default fetch failures | `admin/settings/page.tsx` |
| 1.8 | Add expense GET/POST auth — admin-only create and list-all; manager own-list only | `api/expenses/route.ts` |
| 1.9 | Decide on manager role: implement it or remove the pages | All `manager/` pages |
| 1.10 | Fix CSV column mismatch in missing-payments export | `admin/missing-payments/page.tsx` |

### Phase 2 — Consolidate the due-calculation engine (1 sprint, highest business value)

| # | What |
|---|---|
| 2.1 | Create one `calculateDue(userId, month)` function: prorated rent + previous unpaid + credit + settlements → `effectiveDue` |
| 2.2 | Replace `recalculateUserDuesAfterPayment` with calls to the single engine, and make it respect the `months` array |
| 2.3 | Replace the recalculate-route's `calculateTotalDue` (no credit) with the same engine |
| 2.4 | Fix arrears double-count: `previousUnpaidDue` should not be included in `totalDue` when summing across months |
| 2.5 | Add move-out proration to due generation: bill only days stayed in exit month, zero all future months |
| 2.6 | Add move-in guard: never generate a due for a month before `moveInDate` |

### Phase 3 — Close the resident experience gaps (2 sprints)

| # | What |
|---|---|
| 3.1 | Resident complaint list + detail view with `resolution` text, status timeline, and photo attachment on create |
| 3.2 | Push a `Notification` to the resident when their complaint status changes |
| 3.3 | Add `category` and `priority` fields to the new-complaint form |
| 3.4 | Enforce 15-day notice server-side (`>= 15` calendar days, date-only arithmetic), move refund decision to the API |
| 3.5 | Make emergency contacts and WiFi info editable from PG Settings (not hardcoded in JSX) |
| 3.6 | Clear registration `localStorage` on page unload / after a timeout |
| 3.7 | Add PG ID and balance summary (outstanding + credit) to the user detail page |

### Phase 4 — Admin UX consolidation (2 sprints)

| # | What |
|---|---|
| 4.1 | Merge `/admin/residents` + `/admin/users` into one screen (single data source) |
| 4.2 | Merge `/admin/users/archives` + `/admin/users/checkouts` into one screen |
| 4.3 | Move analytics in checkouts page to compute from the filtered set, not all-time |
| 4.4 | Fix `keyIssued` semantics (true = issued = needs to be returned, not "Not Returned") |
| 4.5 | Derive floor list from data in the rooms page (remove `[1,2,3,4,5,6]` hardcode) |
| 4.6 | Standardize on one toast system (`useToast` hook) across all pages |
| 4.7 | Standardize CSV export: one shared utility, RFC-4180 escaping, always from filtered data |
| 4.8 | Replace sentinel `"admin_id_123456789"` with real per-admin notification fan-out everywhere |
| 4.9 | Add complaint search, pagination, assignment UI, and SLA age indicator |
| 4.10 | Implement `/api/notifications/send` and link the notification page from the sidebar |

### Phase 5 — Scale & quality (1 sprint per item, ongoing)

| # | What |
|---|---|
| 5.1 | Add server-side pagination + filtering to users, rooms, and archives |
| 5.2 | Migrate `Payment.months` and `UserDue.month` to ISO `YYYY-MM` storage |
| 5.3 | Add `updatedBy` audit field to Payment and Expense |
| 5.4 | Batch due generation + wrap in a MongoDB transaction |
| 5.5 | Sync `src/app/api/interfaces/models.ts` to match actual schemas |
| 5.6 | Add a middleware auth guard for `/admin` and `/manager` routes |
| 5.7 | Add keyboard navigation + focus management to modals and dropdowns |

---

## Quick-win summary (can do in < 1 hour each)
- `notice.createdBy?.name` null guard → stops resident dashboard crash
- Remove `debugger;` on line 214 of users page
- Escape regex in payment search
- Fix `roomType` → `type` in reactivation form
- Add auth to 3 unauthenticated GET routes
- Fix privacy-mode boolean inversion in dashboard
- Guard Settings save when fetch fails

---

*This document covers 44 pages, 55 API routes, 14 models. Estimated total improvement effort: ~14 sprints if tackled sequentially; Phases 1–3 can run in parallel with ~3 developers.*
