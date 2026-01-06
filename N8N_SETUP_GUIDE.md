# N8n Telegram Bot Setup Guide - CampusBuddy

## Quick Start (5 Minutes)

### Step 1: Start Your Backend
```bash
cd "F:\IEEE Mega Project 8.O(BITS RANCHI)\backend"
npm start
```
Backend runs on: `http://localhost:5000`

---

### Step 2: Start N8n with Docker

```bash
docker run -it --rm --name n8n -p 5678:5678 -v n8n_data:/home/node/.n8n n8nio/n8n
```

N8n opens at: `http://localhost:5678`

---

### Step 3: Start ngrok (for Telegram webhook)

```bash
ngrok http 5678
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

---

### Step 4: Import Workflow

1. Open `http://localhost:5678`
2. Click **Workflows** → **Add Workflow** → **Import from File**
3. Select: `backend/n8n_telegram_workflow.json`

---

### Step 5: Add Telegram Credentials

1. In N8n, go to **Credentials** → **Add Credential**
2. Search for **Telegram API**
3. Paste your **Bot Token**
4. Save

---

### Step 6: Connect Credentials to Nodes

Click on each of these nodes and select your Telegram credential:
- **Telegram Trigger**
- **Send Success Message**
- **Send Parse Error**
- **Send API Error**

---

### Step 7: Set Telegram Webhook

Replace `YOUR_BOT_TOKEN` and `YOUR_NGROK_URL`:

```bash
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=YOUR_NGROK_URL/webhook-test/telegram"
```

Example:
```bash
curl "https://api.telegram.org/bot7123456789:AAHxxxxxxxxxx/setWebhook?url=https://abc123.ngrok-free.app/webhook-test/telegram"
```

---

### Step 8: Activate Workflow

1. In N8n, toggle **Active** (top right)
2. The workflow is now listening!

---

## Test It!

Send these messages to your Telegram bot:

```
Priya hired
```

```
Jon Snow offered
```

```
priya patel completed
```

**Expected Response:**
```
✅ Status Updated Successfully!

👤 Student: Priya Patel
🏢 Internship: Developer
📋 New Status: HIRED

The student can now initialize their IPP.
```

---

## Workflow Overview

```
┌─────────────────────┐
│  Telegram Trigger   │  ← HR sends "Priya hired"
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│   Parse Message     │  ← Extracts name & status
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│ Check Parse Success │
└────┬───────────┬────┘
     ▼           ▼
  SUCCESS     FAILURE
     ▼           ▼
┌──────────┐ ┌──────────────┐
│ Call API │ │ Send Error   │
└────┬─────┘ └──────────────┘
     ▼
┌─────────────────────┐
│ Send Confirmation   │  → "✅ Status Updated!"
└─────────────────────┘
```

---

## API Details

### Endpoint
```
POST http://localhost:5000/api/integrations/update-status
```

### Headers
```
x-api-key: n8n-secret-key-123
Content-Type: application/json
```

### Body
```json
{
  "studentName": "Priya",
  "status": "hired"
}
```

### Valid Statuses
- `offered`
- `hired`
- `rejected`
- `shortlisted`
- `completed`

### Valid Message Formats
| Message | Parsed As |
|---------|-----------|
| `Priya hired` | name: "Priya", status: "hired" |
| `Jon Snow offered` | name: "Jon Snow", status: "offered" |
| `PRIYA HIRED` | name: "PRIYA", status: "hired" |

---

## Important URLs

| If N8n runs with | Use this URL in workflow |
|------------------|--------------------------|
| Docker | `http://host.docker.internal:5000/api/integrations/update-status` |
| Without Docker | `http://localhost:5000/api/integrations/update-status` |

To change: Edit the **Update Application Status** node → URL field

---

## Troubleshooting

### "Student not found"
- Check spelling matches a student in MongoDB
- Try full name: "Priya Patel" instead of just "Priya"

### "Application not found"
- Student must have at least one application
- Check: `db.applications.find({studentId: "STU001"})`

### "Invalid API Key"
- Ensure header `x-api-key: n8n-secret-key-123` is set
- Or update in `.env`: `EXTERNAL_API_KEY=your-key`

### Telegram not receiving messages
```bash
# Check webhook status
curl "https://api.telegram.org/botYOUR_TOKEN/getWebhookInfo"

# Re-set webhook
curl "https://api.telegram.org/botYOUR_TOKEN/setWebhook?url=YOUR_NGROK_URL/webhook-test/telegram"
```

### Can't reach localhost from Docker
- Use `http://host.docker.internal:5000` instead of `localhost`
- On Linux: `http://172.17.0.1:5000`

---

## What Happens After "hired"

1. Student's application status → `"hired"` in MongoDB
2. Student receives email notification
3. Student sees **"Initialize IPP"** button on dashboard
4. Student creates Internship Performance Passport

---

## Files Modified

| File | Change |
|------|--------|
| `backend/models/Application.js` | Added `'hired'` to status enum |
| `backend/routes/integrations.js` | MongoDB-only API, fuzzy name search |
| `frontend/src/pages/student/StudentIPPDashboard.jsx` | Shows IPP button for `'hired'` |

---

## Security (Production)

1. **Change API Key** in `.env`:
   ```
   EXTERNAL_API_KEY=super-secret-production-key
   ```

2. **Restrict Telegram Users** - Add check in Parse Message:
   ```javascript
   const allowedUsers = [123456789]; // Telegram user IDs
   if (!allowedUsers.includes($input.first().json.message.from.id)) {
     return { json: { success: false, error: "Unauthorized" }};
   }
   ```

3. **Use HTTPS** in production with proper SSL

---

## Done!

Your automation is ready:
- HR sends "StudentName hired" in Telegram
- N8n updates MongoDB
- Student sees IPP button on dashboard
