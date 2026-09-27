# Phase 3 — Resident Experience Improvements
**Date:** 2026-09-27 | **Status:** Approved by user

---

## Sub-project 3A — Resident Complaint Experience

### New pages
- `src/app/dashboard/complaints/page.tsx` — paginated complaint list (10/page): category badge, priority badge (Low=grey/Medium=blue/High=orange/Urgent=red), title, truncated description, status pill, date, "View Details" link. "New Complaint" button.
- `src/app/dashboard/complaints/[id]/page.tsx` — read-only detail: status timeline (Open→In Progress→Resolved/Closed), full description, category, priority, assigned-to (if set), Resolution section (once resolved), all dates.
- Update `src/app/dashboard/page.tsx` complaints card: add "View All" link → `/dashboard/complaints`.

### Modified pages
- `src/app/dashboard/complaints/new/page.tsx` — add `category` select (Maintenance/Housekeeping/Food/Security/Billing/Other, default Maintenance) and `priority` select (Low/Medium/High/Urgent, default Medium). Both sent in POST body.

### API change
- `src/app/api/complaints/[id]/route.ts` PUT — after saving status change, create Notification for complaint owner:
  ```
  { userId: complaint.userId, type: "Complaint", title: "Complaint Update",
    message: `Your complaint "${complaint.title}" status changed to: ${newStatus}.`,
    relatedId: complaint._id, relatedModel: "Complaint", isRead: false, isActive: true }
  ```

---

## Sub-project 3B — Notice Period: Server-Side Enforcement + Configurable Policy

### Model change — `src/app/models/PGDetails.ts`
Add to schema:
```ts
noticePolicy: {
  minNoticeDays: { type: Number, default: 15 },
  refundAmount:  { type: Number, default: 1500 },
}
```

### Settings page — `src/app/admin/settings/page.tsx`
New "Notice Policy" section inside existing tabs:
- Min notice days (number input)
- Refund amount ₹ (number input)

### API rewrite — `src/app/api/users/notice-period/route.ts`
On POST (notice submission, not withdrawal):
1. Load `pgDetails.noticePolicy` (default to `{minNoticeDays:15, refundAmount:1500}` if not set)
2. Date-only arithmetic: strip time from both today and lastStayingDate before calculating daysDiff
3. Reject with 400 if `daysDiff < policy.minNoticeDays`
4. Server computes `isEligibleForRefund = daysDiff >= policy.minNoticeDays`
5. Return `{ isEligibleForRefund, refundAmount: policy.refundAmount, minNoticeDays: policy.minNoticeDays }` in success response
6. Never accept `isEligibleForRefund` from the client body

### Dashboard update — `src/app/dashboard/page.tsx`
- Fetch notice policy from `GET /api/pg-details` (already called; resident GET needs auth, add a separate `/api/pg-details/public` or open the GET to authenticated non-admins — see below)
- Set date input `min` dynamically from `policy.minNoticeDays`
- Show policy copy: "Minimum notice required: X days | Refund if met: ₹Y" from API response
- Remove client-side `isEligibleForRefund` computation; read from server response

**Note on pg-details auth:** Currently `GET /api/pg-details` requires admin. Add a separate `GET /api/pg-details/public` that returns only safe non-sensitive fields (name, contactPhone, emergencyContacts, wifiDetails.note, wifiDetails.name, noticePolicy — NOT paymentDetails/bankAccount).

---

## Sub-project 3C — Settings: Emergency Contacts + WiFi

### Model change — `src/app/models/PGDetails.ts`
Add:
```ts
emergencyContacts: [{ label: { type: String, default: "" }, phone: { type: String, default: "" } }],
wifiDetails: { name: { type: String, default: "" }, password: { type: String, default: "" }, note: { type: String, default: "" } },
```

### Settings page — `src/app/admin/settings/page.tsx`
New "Emergency & WiFi" tab:
- Emergency Contacts: list of {label, phone} rows with remove button; "Add Contact" appends blank row
- WiFi: name input, password input (type=password with show/hide toggle), note input

### API — `src/app/api/pg-details/public/route.ts` (new)
GET, auth=any authenticated user, returns safe subset:
`{ name, contactPhone, emergencyContacts, wifiDetails: { name, note } /* no password */, noticePolicy }`

### Dashboard update — `src/app/dashboard/page.tsx`
- Call `GET /api/pg-details/public` on mount
- Replace hardcoded emergency contacts block with `pgDetails.emergencyContacts.map(...)`
- Replace hardcoded WiFi placeholder with `pgDetails.wifiDetails.note || pgDetails.wifiDetails.name || "Contact reception for WiFi details"`

---

## Sub-project 3D — Registration localStorage Cleanup

File: `src/app/register/page.tsx`

1. **Exclude document URLs from persistence:** when writing `registrationFormData` to localStorage, omit `validIdPhoto` and `profileImage` from the saved object.
2. **24-hour expiry:** store `registrationTimestamp` alongside; on mount, if `Date.now() - ts > 86_400_000`, clear both keys.
3. **Clear on navigate away:** `window.addEventListener('beforeunload', clearFn)` that removes both keys.

---

## Sub-project 3E — User Detail: PG ID + Balance Summary

File: `src/app/admin/users/[id]/page.tsx`

1. **PG ID chip** in the profile header, next to name/role badges. Already in `user.pgId` from API response.
2. **Balance Summary card** (new card alongside Room Information):
   - Data: call `GET /api/user-dues?userId=:id&limit=3` on page load
   - Shows: Current Month Due, Previous Unpaid, Total Paid (from with-dues or user data), Net Remaining
   - Note label: "Based on stored dues — updates with each payment recording"

---

## Execution plan

| Agent | Sub-projects | Files |
|---|---|---|
| A | 3A | `dashboard/complaints/page.tsx` (new), `dashboard/complaints/[id]/page.tsx` (new), `dashboard/complaints/new/page.tsx`, `api/complaints/[id]/route.ts` |
| BC | 3B + 3C | `models/PGDetails.ts`, `admin/settings/page.tsx`, `api/users/notice-period/route.ts`, `api/pg-details/route.ts`, `api/pg-details/public/route.ts` (new), `dashboard/page.tsx` |
| D | 3D | `register/page.tsx` |
| E | 3E | `admin/users/[id]/page.tsx` |

Post-agents: I manually add the "View All" link in `dashboard/page.tsx` complaints card (avoids overlap with Agent BC's changes to the same file).
