# N8n Telegram Bot Setup Guide - CampusBuddy

## Features

| Feature | Telegram Message | Result |
|---------|------------------|--------|
| **HR: Mark Hired** | `Priya hired` | Status → COMPLETED |
| **HR: Mark Offered** | `Priya offered` | Status → OFFERED |
| **Mentor: Approve** | `Jon approved` | Application approved |
| **Mentor: Reject** | `Jon rejected` | Application rejected |
| **Auto-Notify** | Student applies | Mentor gets Telegram alert |

---

## Quick Start (5 Minutes)

### Step 1: Add Environment Variables

Add to `backend/.env`:
```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_MENTOR_CHAT_ID=your_chat_id_here
```

**How to get Chat ID:**
1. Add your bot to a group (or use private chat)
2. Send a message to the bot
3. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Find `"chat":{"id":123456789}` - that's your chat ID

---

### Step 2: Start Your Backend
```bash
cd backend
npm start
```

---

### Step 3: Start N8n with Docker
```bash
docker run -it --rm --name n8n -p 5678:5678 -v n8n_data:/home/node/.n8n n8nio/n8n
```

---

### Step 4: Start ngrok
```bash
ngrok http 5678
```
Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

---

### Step 5: Import Updated Workflow

1. Open `http://localhost:5678`
2. **Delete** old workflow if exists
3. Click **Workflows** → **Add Workflow** → **Import from File**
4. Select: `backend/n8n_telegram_workflow.json`

---

### Step 6: Add Telegram Credentials

1. **Credentials** → **Add Credential** → **Telegram API**
2. Paste your Bot Token
3. Save

---

### Step 7: Connect Credentials to All Nodes

Click each node and select your Telegram credential:
- Telegram Trigger
- Send Success Message
- Send Parse Error
- Send API Error

---

### Step 8: Set Telegram Webhook

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=<YOUR_NGROK_URL>/webhook/telegram"
```

Example:
```bash
curl "https://api.telegram.org/bot7123456789:AAHxxx/setWebhook?url=https://abc123.ngrok-free.app/webhook/telegram"
```

---

### Step 9: Activate Workflow

Toggle **Active** in N8n (top right)

---

## Supported Commands

### HR Commands (Hiring)

| Command | Action | Result |
|---------|--------|--------|
| `Priya hired` | Mark as completed | Student can initialize IPP |
| `Priya completed` | Mark as completed | Same as hired |
| `Priya offered` | Mark as offered | Offer extended |
| `Priya shortlisted` | Mark as shortlisted | Shortlisted |

### Mentor Commands (Approval)

| Command | Action | Result |
|---------|--------|--------|
| `Jon approved` | Approve application | Application approved |
| `Jon rejected` | Reject application | Application rejected |

### Examples
```
Priya hired
jon snow approved
PRIYA PATEL rejected
Jon offered
```

---

## Auto-Notification Feature

When a student applies for an internship, the mentor automatically receives a Telegram message:

```
📋 New Application!

👤 Student: Jon Snow
📧 Email: jon@gmail.com
🎓 CGPA: 7.2 | Sem: 6
🏢 Internship: Backend Developer
🏭 Company: TechCorp

Reply with:
`Jon approved` or `Jon rejected`
```

The mentor can reply directly to approve or reject!

---

## Environment Variables

Add to `backend/.env`:

```env
# Required for Telegram notifications
TELEGRAM_BOT_TOKEN=7123456789:AAHxxxxxxxxxxxxxxxxx
TELEGRAM_MENTOR_CHAT_ID=123456789

# Optional: N8n webhook for custom flows
N8N_MENTOR_WEBHOOK_URL=https://your-n8n-url/webhook/mentor

# API Key for N8n
EXTERNAL_API_KEY=n8n-secret-key-123
```

---

## Workflow Diagram

```
┌─────────────────────┐
│  Telegram Trigger   │  ← "Jon approved" or "Priya hired"
└──────────┬──────────┘
           ▼
┌─────────────────────┐
│   Parse Message     │  ← Extracts name, action, determines type
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
│  Check API Success  │
└────┬───────────┬────┘
     ▼           ▼
  SUCCESS     FAILURE
     ▼           ▼
┌──────────┐ ┌──────────────┐
│ Success  │ │ API Error    │
│ Message  │ │ Message      │
└──────────┘ └──────────────┘
```

---

## API Endpoint

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
- `hired` → becomes `completed`
- `completed`
- `offered`
- `rejected`
- `approved`
- `shortlisted`

---

## Troubleshooting

### "Student not found"
- Check spelling matches database
- Try full name: "Jon Snow" instead of "Jon"

### "API Error: Unknown error"
- Backend not running - run `npm start`
- Duplicate webhook message - just ignore (first one worked)

### No notification when student applies
- Check `TELEGRAM_BOT_TOKEN` in `.env`
- Check `TELEGRAM_MENTOR_CHAT_ID` in `.env`
- Restart backend after adding env vars

### Telegram not receiving messages
```bash
# Check webhook
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"

# Re-set webhook
curl "https://api.telegram.org/bot<TOKEN>/setWebhook?url=<NGROK_URL>/webhook/telegram"
```

---

## Files Modified

| File | Change |
|------|--------|
| `backend/models/Application.js` | Added `'hired'` to status enum |
| `backend/routes/integrations.js` | MongoDB-only, mentor approval, auto-notify |
| `backend/routes/applications.js` | Calls mentor notification on new application |
| `frontend/src/pages/student/StudentIPPDashboard.jsx` | Shows IPP button for `'hired'` |

---

## Complete Flow

### Flow 1: HR Hiring
```
HR: "Priya hired" → Status: COMPLETED → Student sees IPP button
```

### Flow 2: Mentor Approval
```
Student applies → Mentor gets Telegram notification
Mentor: "Priya approved" → Application approved
```

### Flow 3: Full Cycle
```
1. Student applies for internship
2. Mentor receives: "📋 New Application! Reply: Priya approved"
3. Mentor replies: "Priya approved"
4. Application status → approved
5. HR reviews and replies: "Priya hired"
6. Status → completed
7. Student sees "Initialize IPP" button
```

---

## Security

1. **Change API Key** in `.env`:
   ```
   EXTERNAL_API_KEY=your-super-secret-key
   ```

2. **Use separate bot for mentors** (optional):
   - Create another bot via @BotFather
   - Configure separately

3. **Restrict to specific chat IDs** (optional):
   - Add user ID check in N8n Parse Message node

---

## Done!

Your complete automation is ready:
- HR can hire students via Telegram
- Mentors can approve/reject via Telegram
- Auto-notifications when students apply
- Everything updates in MongoDB
