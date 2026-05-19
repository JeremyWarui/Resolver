# End-to-End Testing Checklist

**Dev Server:** http://localhost:5173  
**Backend:** http://localhost:8000/api

---

## 🔑 Test Fixtures

Use these credentials (or whatever fixture users exist in your backend):
- **Admin**: admin / password
- **User (Sarah Wilson)**: sarah.wilson / password
- **Manager**: manager / password
- **HOD**: hod / password
- **Technician**: technician / password

---

## 1. Wizard Testing (5-Step Flow) ✨

**Location:** User Dashboard → "New Ticket" button

### Test: Department → Category → Service Item → Details → Review (5 Steps)

- [ ] Step 1: Department selection shows all departments
- [ ] Step 2: Category shows categories for selected department (no section picker!)
- [ ] Step 3: Service Item shows items for selected category
- [ ] Step 4: Details form captures title, description, location, dynamic form fields
- [ ] Step 5: Review shows summary of selections
- [ ] Submit button creates ticket successfully
- [ ] Success toast shows ticket number (e.g., "Ticket NRB-ICT-00042 created")
- [ ] Verify no section step exists (wizard went from 6 → 5 steps)

**Expected:** Seamless flow through 5 steps without section selection.

---

## 2. User Dashboard Testing 👤

**Login as:** User (e.g., sarah.wilson)

### Test: Stats Cards Show Correct Data

- [ ] Navigate to Dashboard tab
- [ ] Verify stat cards show:
  - My Tickets: correct total count
  - Open: shows count > 0 if user has open tickets
  - In Progress: shows actual count (NOT hardcoded 0)
  - On Hold: shows actual count
  - Resolved: shows actual count (NOT hardcoded 0)
- [ ] Stats match the tickets displayed in the table below

### Test: Cache Warming

- [ ] Navigate to Dashboard → view stat cards + table
- [ ] Click on "My Tickets" tab
- [ ] **No network request should fire** (table loads instantly from cache)
- [ ] Table displays the same tickets as before
- [ ] Go back to Dashboard, then to My Tickets again
- [ ] **Still no new network request**

**Expected:** Dashboard fetches once, MyTickets tab uses cached data.

### Test: Quick Filters

- [ ] Click filter pill "Open"
- [ ] Table updates to show only open tickets
- [ ] Stat card count matches filtered results
- [ ] Click "All" to clear filter
- [ ] Table resets to all tickets

**Expected:** Filters work smoothly with visual feedback.

---

## 3. Manager Dashboard Testing 👔

**Login as:** Manager

### Test: Field Mappings (No Crashes)

- [ ] Dashboard loads without errors (check browser console)
- [ ] Stat cards display: Total, Open, Escalated, Avg Resolution
- [ ] **Campus Breakdown** card visible with list of campuses
  - Shows: Campus name, Total, Open, Escalated, SLA % (progress bar)
- [ ] **Section Performance** card visible with sections
  - Shows: Section name, campus, tech count, open/total tickets
- [ ] **Technician Workload** list visible
  - Shows ranked technicians with assigned/resolved/avg resolution
- [ ] **Status Distribution** chart visible
  - Bar chart showing tickets by status
- [ ] No console errors about `undefined` fields

### Test: Manager Tickets Page

- [ ] Click "Department Tickets" or equivalent nav item
- [ ] **Stat cards displayed above table** (Total, Open, Escalated, Avg Resolution)
- [ ] Stat values match dashboard overview
- [ ] Ticket table loads with filtering
- [ ] Click a ticket → detail modal opens
- [ ] Can view ticket details, see assigned_to, comments

**Expected:** All data displays without field name errors, new components render.

---

## 4. HOD Dashboard Testing 🏛️

**Login as:** HOD

### Test: Field Mappings (No Crashes)

- [ ] Dashboard loads without errors (check browser console)
- [ ] Campus header shows: Campus name and location
  - Uses `data.campus_department.campus` (nested path)
- [ ] Stat cards display: Total, Open, Resolved, Overdue, Escalated
- [ ] **Campus Tickets** section visible below stat cards
- [ ] **Section Performance** card visible
  - Shows: Section name, open/total tickets, tech count
- [ ] **Technician Performance** card visible
  - Shows: Technician name, assigned/resolved counts
- [ ] **Charts/Analytics** section renders without errors
- [ ] No console errors about `undefined` fields

### Test: New Sections Page

- [ ] Click "Sections" in sidebar (should be new nav item)
- [ ] **Sections table loads** with columns:
  - Section name & code
  - Type
  - Head of Section
  - Technician count
  - Open / Total tickets
- [ ] Data displays from `by_section` array
- [ ] No loading state persists (data loads quickly)
- [ ] Empty state message if no sections
- [ ] Click a section row → can view details (if modal added)

### Test: Campus Tickets Navigation

- [ ] Click "Campus Tickets"
- [ ] Stat cards load (no zeros)
- [ ] Ticket table loads
- [ ] Quick filters work (status pills)
- [ ] Navigate away → back to Campus Tickets
- [ ] **Ticket table does NOT re-fetch** (instant load)

**Expected:** All field names resolve correctly, Sections page renders, caching works.

---

## 5. Technician Dashboard Testing 🔧

**Login as:** Technician

### Test: Assigned Tickets

- [ ] Navigate to "Assigned Tickets" tab
- [ ] **Stat cards visible at top:**
  - New Work (assigned count)
  - Active Jobs (in_progress count)
  - On Hold (pending count)
  - Finished (resolved count)
- [ ] Stat values are > 0 if technician has tickets
- [ ] Ticket table displays with standard columns
- [ ] Can click a ticket → modal opens with details

### Test: Section Tickets (View-Only)

- [ ] Click "Section Tickets" tab
- [ ] **Stat cards visible at top** (same as assigned tickets)
  - These show **section-level** unassigned queue stats
- [ ] Ticket table shows:
  - Standard columns (Title, Status, Priority, Section)
  - **"Assigned To" column** showing who each ticket is assigned to
  - **NO action buttons** (no Edit, Assign, Escalate icons)
- [ ] Tickets are read-only (can click to view, but no edits)
- [ ] Verify table is view-only (no dropdown menus on rows)

### Test: Stat Card Clickability

- [ ] In Assigned Tickets, click "Active Jobs" card
- [ ] Filter applies (shows only in_progress tickets)
- [ ] Click "All Work" to clear filter
- [ ] Table resets to all assigned tickets

**Expected:** Stat cards display, section tickets are view-only with assigned_to column.

---

## 6. Browser Console Checks 🖥️

For **each dashboard** tested:

- [ ] **Open DevTools → Console tab**
- [ ] No `TypeError: Cannot read property 'X' of undefined`
- [ ] No `Uncaught ReferenceError`
- [ ] No `404 errors` for missing assets
- [ ] No `CORS errors`
- [ ] Network tab: Verify API calls match expected endpoints
  - `/api/user/me/dashboard/`
  - `/api/manager/me/dashboard/`
  - `/api/hod/me/dashboard/`
  - `/api/technicians/me/dashboard/`

**Expected:** Clean console, no JavaScript errors.

---

## 7. Responsive Design Check 📱

- [ ] Test on Desktop (full width)
- [ ] Test on Tablet (medium width) — check if grid wraps properly
- [ ] Test on Mobile (narrow width) — verify tables are scrollable
- [ ] Stat cards stack vertically on mobile
- [ ] Charts/tables don't overflow

---

## 8. Performance Check ⚡

- [ ] Dashboard loads in < 2 seconds
- [ ] Navigation between tabs is instant (cached data)
- [ ] Filter changes complete in < 500ms
- [ ] No janky animations or slow transitions
- [ ] Open DevTools → Network tab, throttle to "Slow 3G"
- [ ] Dashboard still loads (gracefully, with spinners)

---

## 9. Data Integrity Check ✓

### User Dashboard

- [ ] Stat card counts = sum of filtered table rows
- [ ] Opening a ticket from table → detail modal shows same ticket
- [ ] Created ticket appears in list within seconds

### Manager Dashboard

- [ ] Total tickets = sum of by_campus totals
- [ ] Open tickets = sum of by_campus opens
- [ ] SLA % values are 0-100 and display as progress bar

### HOD Dashboard

- [ ] Campus stats match individual section stats
- [ ] Technician workload totals match section workload
- [ ] Overdue count matches tickets with is_overdue=true

### Technician Dashboard

- [ ] Assigned ticket count = count in "Assigned Tickets" table
- [ ] Section queue count = count in "Section Tickets" table

---

## 10. Navigation & State Check 🔄

- [ ] **Dashboard → MyTickets → Dashboard:** Stat cards load instantly (cache works)
- [ ] **Manager Dashboard → Tickets → Dashboard:** Same cache behavior
- [ ] **HOD Dashboard → Sections → Dashboard → Sections:** Sections data loads instantly
- [ ] **Logout → Login as different role:** New dashboard appears correctly
- [ ] **Browser back/forward buttons:** Work without errors

---

## Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Wizard (5-step) | ⬜ | Test new flow |
| User Dashboard | ⬜ | Test stats + cache |
| Manager Dashboard | ⬜ | Test field mappings + new components |
| Manager Tickets | ⬜ | Test stat cards |
| HOD Dashboard | ⬜ | Test field mappings |
| HOD Sections | ⬜ | Test new page |
| Technician Dashboard | ⬜ | Test stat cards + view-only |
| Console Errors | ⬜ | Verify clean |
| Network Calls | ⬜ | Verify correct endpoints |
| Responsive Design | ⬜ | Test mobile/tablet |

---

## Notes

- **Backend must be running** at `http://localhost:8000` with fixture data
- **Dev server** running at `http://localhost:5173`
- **Test each role separately** — different dashboards require different logins
- **Check DevTools Console** after every major action
- **Document any failures** with: dashboard name, action taken, error message, screenshot if possible

---

**Testing Time Estimate:** 30-45 minutes for full coverage  
**Priority:** P0 > P1 > P2 > P3 tests
