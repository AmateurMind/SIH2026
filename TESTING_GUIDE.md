# 🧪 Testing Guide - Verifying New Features

## 🚀 How to Check if Changes are Working

### **Step 1: Restart Your Application**

```bash
# Navigate to your project directory
cd your-project-folder

# Stop any running servers (Ctrl+C if running)

# Install any new dependencies
npm run install:all

# Start the application
npm run dev
```

---

## 🔍 **Feature Testing Checklist**

### ✅ **1. Notification System Testing**

#### **Check Backend Notification Service:**
1. **Open your browser developer tools** (F12)
2. **Go to Network tab**
3. **Visit**: `http://localhost:5000/health`
4. **Look for console message**: `"✅ Notification service started"`

#### **Test Notification API (Admin Only):**
```bash
# Test notification status endpoint
curl http://localhost:5000/api/notifications/status
```

**Expected Response:**
```json
{
  "isRunning": true,
  "processingInterval": 60000,
  "stats": {
    "total": 0,
    "pending": 0,
    "sent": 0,
    "failed": 0
  }
}
```

---

### ✅ **2. Real-Time Dashboard Testing**

#### **For Students:**
1. **Login as a student**
2. **Go to Student Dashboard**
3. **Look for**:
   - Auto-refresh every 30 seconds (watch "Last updated" time)
   - Application status cards (Applications, In Review, Approved)
   - Upcoming deadlines section (if any internships with deadlines exist)

#### **For Mentors:**
1. **Login as a mentor**
2. **Go to Mentor Dashboard** 
3. **Look for**:
   - Red alert box if pending approvals exist
   - Real-time updates of application counts

#### **For Admins:**
1. **Login as an admin**
2. **Go to Admin Dashboard**
3. **Look for**:
   - KPI cards with trend indicators (+12%, +5%, etc.)
   - Yellow alert for pending internship approvals
   - Recent activities section
   - Auto-refresh functionality

---

### ✅ **3. Automated Notification Testing**

#### **Test Deadline Reminders:**
1. **Login as Admin**
2. **Create a new internship** with:
   - **Application Deadline**: Set to 2 days from now
   - **Status**: Active
   - **Eligible Departments**: Include CS/IT students
3. **Check console logs** for: `"Scheduled deadline reminders for X eligible students"`

#### **Test Mentor Approval Reminders:**
1. **Login as Student**
2. **Apply to an internship**
3. **Check console logs** for: `"Scheduled mentor approval reminders for application XXX"`

#### **View Scheduled Notifications (Admin):**
```bash
# Check scheduled notifications
curl http://localhost:5000/api/notifications/scheduled
```

---

### ✅ **4. One-Click Application Testing**

1. **Login as Student**
2. **Go to Available Internships**
3. **Look for**:
   - Green "Apply Now" buttons for eligible internships
   - Recommendation scores (XX% Match)
   - Cover letter modal on click
   - Success message after application

---

### ✅ **5. Digital Approval Testing**

1. **Login as Mentor**
2. **Go to Mentor Dashboard**
3. **Look for**:
   - Pending approvals section
   - Approve/Reject buttons
   - Feedback textarea
   - Email notification after approval

---

## 🐛 **Troubleshooting Common Issues**

### **Issue 1: "Cannot find module" errors**
```bash
# Solution: Install new dependencies
npm install
cd backend && npm install
cd ../frontend && npm install
```

### **Issue 2: Notification service not starting**
**Check:** 
- Browser console for error messages
- Backend console for `"✅ Notification service started"`
- File exists: `backend/services/notificationService.js`

### **Issue 3: Real-time dashboard not loading**
**Check:**
- Network tab for API calls to `/analytics/dashboard`
- Component exists: `frontend/src/components/RealTimeDashboard.jsx`
- No JavaScript errors in browser console

### **Issue 4: Notifications not being sent**
**Check:**
- `WEB3FORMS_KEY` is set in `backend/.env`
- File exists: `backend/data/scheduled_notifications.json`
- Console logs for notification processing

---

## 📱 **Browser Testing Steps**

### **Open Multiple Browser Tabs:**

1. **Tab 1**: `http://localhost:3000` (Frontend)
2. **Tab 2**: `http://localhost:5000/health` (Backend Health Check)
3. **Tab 3**: Browser Developer Tools (F12 → Console)

### **Watch for These Console Messages:**
```
[Backend Console]:
✅ Notification service started
🚀 Server running on port 5000
[NotificationService] Processed X notifications

[Browser Console]:
✅ Dashboard data refreshed
✅ Application submitted successfully
✅ Auto-refresh in 30 seconds
```

---

## 🎯 **Quick Feature Verification**

### **✅ Feature Working Signs:**

| Feature | ✅ Working Signs |
|---------|-----------------|
| **Notification System** | Console: "Notification service started" |
| **Real-time Dashboard** | Auto-refresh timer, live data updates |
| **One-click Applications** | Modal opens, success messages |
| **Digital Approvals** | Mentor can approve/reject with feedback |
| **Deadline Tracking** | Upcoming deadlines widget appears |

### **❌ Not Working Signs:**

| Problem | ❌ Error Signs |
|---------|---------------|
| **Missing Dependencies** | "Module not found" errors |
| **Service Not Running** | No "Notification service started" message |
| **API Errors** | 404/500 errors in Network tab |
| **Component Missing** | White screen, React errors |

---

## 🔧 **Manual Testing Scenarios**

### **Test 1: Complete Application Flow**
1. Admin creates internship → Check for deadline reminders scheduled
2. Student applies → Check for mentor approval reminders
3. Mentor approves → Check for email notifications
4. Admin schedules interview → Check for interview reminders

### **Test 2: Dashboard Real-time Updates**
1. Keep dashboard open
2. Create new application in another tab
3. Watch dashboard update automatically
4. Verify "Last updated" timestamp changes

### **Test 3: Notification Processing**
1. Check scheduled notifications: `GET /api/notifications/scheduled`
2. Wait 1 minute
3. Check again to see if any processed
4. Look for status changes: `pending` → `sent`

---

## 📞 **If Something's Not Working:**

1. **Check the browser console** (F12) for any red error messages
2. **Check the backend terminal** for error logs
3. **Verify file structure** - ensure all new files exist:
   - `backend/services/notificationService.js`
   - `backend/utils/notificationScheduler.js`
   - `backend/routes/notifications.js`
   - `frontend/src/components/RealTimeDashboard.jsx`
   - `backend/data/scheduled_notifications.json`

4. **Restart the application** completely:
   ```bash
   # Stop both frontend and backend (Ctrl+C)
   npm run dev
   ```

---

**Let me know what you see when you test these features! I can help debug any issues you encounter.** 🚀