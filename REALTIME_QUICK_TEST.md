# Real-Time Sync - Quick Test Checklist

## 🧪 5-Minute Real-Time Test

### Setup
1. Open your app in **2 browser windows** side-by-side
2. Log in as **Lecturer** in Window 1, **Lecturer** in Window 2 (same account)
3. Go to **Dashboard** in Window 1
4. Go to **Courses Page** in Window 2
5. Open **DevTools Console** in Window 1 (F12 → Console)

### Test 1: Create Course Real-Time Update ✅

**Window 2** (Courses Page):
- Click "Add Course"
- Enter: Code `CS401` | Title `Advanced Algorithms`
- Click Submit
- You should be auto-routed to Dashboard

**Window 1** (Dashboard):
- Watch console for: `✅ [lecturer_xxx_classes_0] Received change: INSERT`
- Watch console for: `📊 [Lecturer] Fetching dashboard data...`
- **Without refreshing**, the Total Courses stat should increase by 1
- **Expected time**: <1 second

✅ **If it updates without manual refresh** = REAL-TIME WORKING!
❌ **If you have to click Refresh** = Subscriptions not connected

### Test 2: Create Session Real-Time Update ✅

**Window 1** (Dashboard):
- Click "Create Session" tab
- Select a course
- Set expiry time
- Click "Create Session"
- Watch the console

**Check Console**:
```
✅ [lecturer_xxx_sessions_1] Received change: INSERT
📨 [lecturer_xxx_sessions_1] Data changed, refreshing...
📊 [Lecturer] Fetching dashboard data...
✅ [Lecturer] Dashboard data loaded
```

**Check UI**:
- Recent Sessions section should show new session
- Session Performance card should update
- **No manual refresh needed**

### Test 3: Cross-Device Sync ✅

**Window 1** (Dashboard):
- Watch the Recent Sessions list

**Window 2** (Courses Page):
- Go to Dashboard in same window
- Click "Create Session" tab
- Create another session
- Watch Window 1

**Expected**:
- Window 1 updates instantly
- New session appears in Recent Sessions
- No refresh needed
- Console shows change logs

### Test 4: Student Real-Time Attendance ✅

As **Lecturer**:
1. Go to Dashboard
2. Create a Session
3. Note the Session ID

As **Student** (different browser/account):
1. Go to Attendance Portal
2. Enter OTP
3. Mark attendance

Back to **Lecturer Dashboard**:
- Watch for: `✅ [lecturer_xxx_attendance_logs_2] Received change: INSERT`
- Session Performance card should update with new attendance count
- **Without clicking Refresh**

✅ **If attendance appears instantly** = FULL SYNC WORKING!

---

## 🔍 Console Validation

### Expected on Page Load:

```
📡 [lecturer_XXX] Setting up real-time subscriptions for lecturer-XXX
📡 [lecturer_XXX_classes_0] Setting up subscription for classes
✅ [lecturer_XXX_classes_0] Successfully subscribed
📡 [lecturer_XXX_sessions_1] Setting up subscription for sessions
✅ [lecturer_XXX_sessions_1] Successfully subscribed
📡 [lecturer_XXX_attendance_logs_2] Setting up subscription for attendance_logs
✅ [lecturer_XXX_attendance_logs_2] Successfully subscribed
📊 [Lecturer] Fetching dashboard data...
✅ [Lecturer] Dashboard data loaded
```

All 3 subscriptions should show ✅ **Successfully subscribed**

### Expected When Making Changes:

```
✅ [lecturer_XXX_classes_0] Received change: INSERT
✅ [lecturer_XXX_classes_0] Received change: UPDATE
✅ [lecturer_XXX_classes_0] Received change: DELETE
```

(Examples - you'll see whichever changes you make)

Then:
```
📨 [lecturer_XXX_classes_0] Data changed, refreshing... (may appear multiple times)
📊 [Lecturer] Fetching dashboard data... (appears once due to debounce)
✅ [Lecturer] Dashboard data loaded
```

### Issues to Look For:

```
❌ [lecturer_XXX_classes_0] Subscription setup failed
→ Real-time not working, check Supabase status

❌ [lecturer_XXX_classes_0] Channel error
→ Connection lost, check network

No console messages at all
→ Subscriptions not set up, refresh page
```

---

## ✅ Success Criteria

| Criteria | Expected | Status |
|----------|----------|--------|
| Dashboard loads | Shows all data | ✓ |
| Subscriptions connect | 3 ✅ messages in console | ✓ |
| Create course | Updates without refresh | ✓ |
| Create session | Updates without refresh | ✓ |
| Mark attendance | Appears instantly | ✓ |
| Multiple changes | Only 1 refresh (debounced) | ✓ |
| Cross-device sync | Window 2 syncs to Window 1 | ✓ |
| No memory leaks | Console calm after edits | ✓ |

---

## 🛠️ If It Doesn't Work

### Step 1: Check Subscriptions Connected

```javascript
// Paste in DevTools Console
// Search for lines like:
// ✅ [lecturer_XXX_classes_0] Successfully subscribed

// Should see 3 times (for classes, sessions, attendance_logs)
```

**If no subscriptions showing**:
1. Refresh page (Ctrl+R)
2. Check Supabase dashboard: realtime enabled?
3. Check `.env` file has correct SUPABASE_URL and KEY

### Step 2: Check Supabase RLS Policies

If subscriptions connect but data doesn't refresh, RLS policies might be blocking:

**Supabase Dashboard** → Table Editor → policies (lock icon)

For real-time to work:
- `select` policy must allow user to see data
- Policy should include `auth.uid()` checks

### Step 3: Check Network Tab

**DevTools** → Network → WS (WebSocket)

You should see:
```
wss://xxx.realtime.supabase.co/realtime/v1...
Status: 101 Switching Protocols ✅
```

If not or if it's red:
- Firewall blocking WebSockets?
- VPN interfering?
- Check Supabase status page

### Step 4: Manual Test

If automatic sync not working, manual refresh should work:

1. Create a course in Window 2
2. Click "Refresh" in Window 1 Dashboard
3. Does it show the new course?

**If YES** → Real-time subscriptions broken, but data access works
**If NO** → Permissions issue, check RLS policies

---

## 📞 Debugging Help

Add these logs to your browser console:

```javascript
// Check subscription status
console.log('Checking subscriptions...');

// Try manually refreshing data
document.querySelector('button[disabled]')?.click();
// Or find Refresh button and click it

// Check if real-time is enabled in Supabase
// Go to: https://supabase.com/dashboard → Project Settings → Realtime
```

---

## 🚀 Performance Notes

**Normal real-time performance:**
- Subscription setup: 100-200ms
- Change detection: <10ms (instant via WebSocket)
- Data refresh: 200-500ms (parallel queries)
- **Total**: <1 second from action to UI update

**If it's slower:**
1. Check network latency (DevTools → Network)
2. Check query performance (Supabase logs)
3. Check browser CPU usage (DevTools → Performance)

---

## 🎉 Celebration Moment

When you see this sequence in console:

```
✅ Successfully subscribed
[Create/edit something...]
✅ Received change
📨 Data changed, refreshing...
📊 Fetching dashboard data...
✅ Dashboard data loaded
```

**WITHOUT** clicking Refresh, and the UI updates...

🎊 **REAL-TIME IS WORKING!** 🎊

The system is now:
- ✅ Instantly detecting changes
- ✅ Refreshing data in background
- ✅ Updating UI in <1 second
- ✅ Syncing across all open tabs
- ✅ No manual refresh needed

---

## Questions?

Check [REALTIME_SYNC_DEBUG_GUIDE.md](./REALTIME_SYNC_DEBUG_GUIDE.md) for detailed troubleshooting
