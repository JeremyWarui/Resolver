# Backend Alignment - Required Fixes

## 🚨 CRITICAL FIXES (Do These First)

### 1. Fix Missing `/users/me/` Endpoint

**Option A: Add endpoint to backend (RECOMMENDED)**
```python
# In tickets/api/views/resource_views.py or create user_views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
def current_user(request):
    """Get current authenticated user"""
    if request.user.is_authenticated:
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    return Response({'detail': 'Not authenticated'}, status=401)

# In tickets/api/urls.py
urlpatterns = [
    # ... existing patterns
    path('users/me/', current_user, name='current-user'),
]
```

**Option B: Change frontend to use stored user ID**
- Store user ID during login
- Use `/users/{id}/` endpoint instead

---

### 2. Connect TechnicianDashboard to Real API

**File:** `src/components/TechnicianDashboard/TechDashboard.tsx`

**Replace this:**
```tsx
import { sampleTickets, currentTechnician } from './data/sampleData';

const ticketStats = useMemo(() => {
  const openCount = sampleTickets.filter(t => t.status === 'open').length;
  // ...
}, []);
```

**With this:**
```tsx
import useStats from '@/hooks/analytics/useStats';
import useUserData from '@/hooks/users/useUserData';

const TechnicianDashboard = () => {
  const { userData } = useUserData();
  const { ticketStats, loading } = useStats({ 
    user: userData?.id,
    fetchTicketStats: true,
    fetchTechnicianStats: false
  });
  
  // Use real data from API
  return (
    // ... use ticketStats from API
  );
};
```

---

### 3. Fix Status String Inconsistency

**File:** `src/components/AdminDashboard/Dashboard/RecentTickets.tsx`

**Line 63 - Change from:**
```tsx
const allStatuses = ["open", "assigned", "in progress", "pending", "resolved"];
```

**To:**
```tsx
const allStatuses = ["open", "assigned", "in_progress", "pending", "resolved", "closed"];
```

Also update any display labels to show "In Progress" (with space) but use `in_progress` for API calls.

---

### 4. Add `resolved_at` Field to Ticket Type

**File:** `src/types/ticket.types.ts`

**Add this field:**
```typescript
export interface Ticket {
  id: number;
  ticket_no: string;
  title: string;
  description: string;
  status: 'open' | 'assigned' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  section_id?: number;
  section: string;
  facility_id?: number;
  facility: string;
  raised_by: string;
  assigned_to_id?: number | null;
  assigned_to: AssignedUser | null;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;  // ⬅️ ADD THIS
  comments?: Comment[];
  feedback?: Feedback;
}
```

---

## ⚠️ MEDIUM PRIORITY FIXES

### 5. Implement TicketLog Support

**Create:** `src/types/ticketLog.types.ts`
```typescript
export interface TicketLog {
  id: number;
  ticket: number;
  action: string;
  performed_by: string | null;
  timestamp: string;
}

export interface TicketLogsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: TicketLog[];
}
```

**Update:** `src/api/services/ticketsService.ts`
```typescript
// Add this method
getTicketLogs: async (ticketId: number): Promise<TicketLogsResponse> => {
  const response = await apiClient.get(`/tickets/${ticketId}/logs/`);
  return response.data;
},
```

**Backend needs endpoint:**
```python
# Add to tickets/api/urls.py
path('tickets/<int:ticket_id>/logs/', 
     TicketLogListView.as_view(), name='ticket-logs'),
```

---

### 6. Verify Analytics Response Structure

**Test these endpoints:**
```bash
curl http://localhost:8000/api/analytics/tickets/
curl http://localhost:8000/api/analytics/technicians/
curl http://localhost:8000/api/analytics/admin-dashboard/
```

**Check if response includes:**
- `in_progress_tickets` count
- `closed_tickets` count
- Any additional fields

**Update types accordingly in:** `src/types/analytics.types.ts`

---

### 7. Add Error Handling for Missing User

**File:** `src/components/UserDashboard/UserDashboard.tsx`

Add error state:
```tsx
const { userData, loading, error } = useUserData();

if (error) {
  return <div>Error loading user data: {error.message}</div>;
}
```

---

## 📝 IMPLEMENTATION ORDER

1. **First:** Fix status string inconsistency (easiest, 2 min)
2. **Second:** Add `resolved_at` field (easy, 2 min)
3. **Third:** Implement `/users/me/` endpoint (medium, 15 min)
4. **Fourth:** Connect TechnicianDashboard to API (medium, 30 min)
5. **Fifth:** Verify analytics structure (testing, 15 min)
6. **Sixth:** Add TicketLog support (complex, 1 hour)

---

## ✅ TESTING CHECKLIST

After making fixes, test:

- [ ] User can login and see their data
- [ ] TechnicianDashboard shows real ticket counts
- [ ] Status filtering works with all statuses
- [ ] Ticket detail shows `resolved_at` timestamp
- [ ] Admin dashboard analytics load correctly
- [ ] User dashboard shows correct stats
- [ ] All pagination works correctly
- [ ] Ticket assignment updates properly
- [ ] Comments can be added to tickets
- [ ] Feedback can be submitted

---

## 🔍 FILES TO MODIFY

### Frontend Files
1. `src/types/ticket.types.ts` - Add `resolved_at`
2. `src/types/ticketLog.types.ts` - CREATE NEW
3. `src/components/AdminDashboard/Dashboard/RecentTickets.tsx` - Fix status
4. `src/components/TechnicianDashboard/TechDashboard.tsx` - Connect to API
5. `src/api/services/ticketsService.ts` - Add logs method
6. `src/types/analytics.types.ts` - Verify structure

### Backend Files (if adding /users/me/)
1. `tickets/api/views/resource_views.py` - Add current_user view
2. `tickets/api/urls.py` - Add users/me/ route
3. `tickets/api/views/ticket_log_view.py` - CREATE NEW (for logs)

---

## 📊 ESTIMATED TIME

- **Critical Fixes:** 1-2 hours
- **Medium Priority:** 2-3 hours
- **Testing:** 1-2 hours
- **Total:** 4-7 hours

---

## 🎯 SUCCESS CRITERIA

✅ All dashboards display real data from backend
✅ No sample/mock data in production code
✅ All status values consistent between frontend/backend
✅ User authentication works correctly
✅ All TypeScript types match backend serializers
✅ Ticket history/logs visible in UI
✅ All tests pass
