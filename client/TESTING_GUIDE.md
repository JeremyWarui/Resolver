# Quick Testing Guide — Priority Order

**Backend**: `http://localhost:8000/api`  
**Frontend**: `http://localhost:5173`  
**Test Duration**: ~15 minutes for P0 items

---

## P0 CRITICAL (Do These First)

### 1. Wizard 5-Step Flow (2 min)

**Login as**: user (sarah.wilson / password)

1. Click "New Ticket" → Wizard opens
2. **Step 1**: Select "Information & Communication Technology" → click Next
3. **Step 2**: Select a category (e.g., "Network Issues") → click Next
4. **Step 3**: Select a service item → click Next
5. **Step 4**: Enter title (e.g., "Printer not working"), description, select facility, click Next
6. **Step 5**: Review shows 5 items — click Submit
7. ✅ **Expected**: Success toast shows ticket number (e.g., "Ticket NRB-ICT-00001 created")
8. ✅ **Expected**: Wizard closes, no console errors

### 2. User Dashboard Stats Cards (2 min)

Still logged in as user (sarah.wilson):

1. Navigate to Dashboard tab
2. Check stat cards show:
   - **My Tickets**: total count (should match table below)
   - **Open**: > 0 if user has open tickets
   - **In Progress**: actual count (NOT hardcoded 0) ← **CRITICAL FIX**
   - **On Hold**: actual count
   - **Resolved**: actual count (NOT hardcoded 0) ← **CRITICAL FIX**
3. ✅ **Check DevTools Console** (F12 → Console) — no errors about "undefined properties"
4. ✅ **Expected**: All stat cards match the ticket table counts below

### 3. Manager Dashboard (3 min)

**Login as**: manager / password

1. Dashboard loads immediately
2. Check stat cards display: Total, Open, Escalated, Avg Resolution
3. Check sections below:
   - **Campus Breakdown**: list of campuses with SLA progress bars ← **NEW COMPONENT**
   - **Section Performance**: list of sections with tech counts ← **NEW COMPONENT**
   - **Technician Workload**: ranked list ← **NEW COMPONENT**
   - **Status Distribution**: bar chart ← **NEW COMPONENT**
4. ✅ **Check DevTools Console** — NO errors about `undefined` (e.g., "Cannot read property 'sla_24h_pct'")
5. ✅ **Expected**: All four new components render without crashing

### 4. HOD Dashboard (3 min)

**Login as**: hod / password

1. Dashboard loads immediately
2. Check campus header shows campus name + location
3. Check stat cards: Total, Open, Resolved, Overdue, Escalated
4. Check sections:
   - **Campus Tickets**: ticket table visible
   - **Section Performance**: card visible
   - **Technician Performance**: card visible
5. **Click "Sections" in sidebar** ← **NEW PAGE**
   - Table loads with columns: Name, Code, Type, Head, Tech Count, Tickets
   - Data displays (no loading state persists)
6. ✅ **Check DevTools Console** — NO errors about undefined fields
7. ✅ **Expected**: Sections page renders with data, no field name crashes

### 5. Technician Dashboard (2 min)

**Login as**: technician / password

1. Navigate to "Assigned Tickets" tab
2. Check stat cards visible: New Work, Active Jobs, On Hold, Finished
3. Navigate to "Section Tickets" tab
4. Check stat cards displayed at top
5. Check table has:
   - Standard columns + **"Assigned To" column** ← **NEW COLUMN**
   - **NO action buttons** (no Edit/Assign/Escalate icons) ← **VIEW-ONLY MODE**
6. ✅ **Expected**: Section tickets are read-only, Assigned To column shows assignment

---

## Console Error Checklist (30 seconds)

For each role tested, open DevTools (F12) and check Console tab:

- [ ] No `TypeError: Cannot read property 'X' of undefined`
- [ ] No `Uncaught ReferenceError`
- [ ] No `404 errors` for assets
- [ ] No `CORS errors`

---

## Network Tab Verification (1 min)

Open DevTools → Network tab, clear, then navigate to each dashboard:

| Role | Expected endpoint(s) |
|------|---|
| User | `/api/user/me/dashboard/` |
| Manager | `/api/manager/me/dashboard/` |
| HOD | `/api/hod/me/dashboard/` |
| Technician | `/api/technicians/me/dashboard/` |

✅ **Expected**: Single request per dashboard (no repeated fetches on tab navigation).

---

## Pass Criteria

If **all 5 P0 items** pass with no console errors → **Ready for user testing.**

If any P0 item fails:
1. Take screenshot
2. Record error from Console
3. Note exact step where it failed
4. Check the backend is running at http://localhost:8000/api
5. Verify fixture data exists (hod, technician users, sample tickets)

---

## Quick Reference: Test Credentials

```
Admin:       admin / password
User:        sarah.wilson / password
Manager:     manager / password
HOD:         hod / password
Technician:  technician / password
```

All should be in the backend fixture data (`python manage.py loaddata fixture.json`).

---

## What to Record If Failures Occur

- **Screenshot** of the error/broken UI
- **Console error message** (full stack if available)
- **Network tab** — which endpoint failed or what status code returned
- **Role** that was logged in
- **Exact steps** to reproduce
- **Backend logs** (if endpoint returned 5xx)

---

**Estimated Total Time**: 12 minutes for all P0 tests  
**Success Threshold**: 0 console errors, all stat cards/components display correctly
