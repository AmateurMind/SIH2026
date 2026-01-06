# 🎓 Campus Buddy

A comprehensive campus internship and placement portal designed to streamline the recruitment process for universities, students, and recruiters.

## 🔗 Live Demo
- **Website:** [https://campusbuddy-0qnu.onrender.com/](https://campusbuddy-0qnu.onrender.com/)

---

## 📖 Overview
Campus Buddy is a unified platform that bridges the gap between students, academic mentors, placement cells, and corporate recruiters. It automates and optimizes the entire placement lifecycle—from resume building and internship discovery to application tracking and final recruitment.

Built with a modern tech stack, it features role-based access control, real-time analytics, and AI-powered tools to enhance the employability of students.

## ✨ Key Features

### 👨‍🎓 For Students
- **Smart Dashboard:** Real-time overview of application status, recommended opportunities, and performance analytics.
- **AI Resume Builder:** Create ATS-friendly professional resumes with AI-assisted content generation and automated skill extraction from uploaded documents.
- **Skill Gap Analysis:** AI-powered identification of missing skills for desired job roles with personalized learning recommendations.
- **AI Mock Interview:** Real-time AI-powered technical and HR mock interviews with behavioral analysis and feedback.
- **Calendar Integration:** Integrated event scheduling and management for interviews, tasks, and placement activities.
- **Intelligent Discovery:** Personalized internship recommendations based on skills, academic performance, and preferences.
- **Application Tracking:** Visual status indicators for applied, pending, approved, and rejected applications.
- **Secure Profile:** Comprehensive profile management for academic details and secure document access.

### 👩‍🏫 For Mentors & Faculty
- **Streamlined Approval:** Efficient workflow for reviewing and approving student applications.
- **Progress Monitoring:** Track mentee performance and placement success rates in real-time.
- **Calendar Management:** Oversee interview schedules and academic deadlines for mentees.
- **Bulk Actions:** Manage multiple applications and evaluations simultaneously with ease.

### 🏢 For Recruiters
- **Internship Posting:** Create and manage internship listings with detailed requirements.
- **Talent Discovery:** Advanced filtering to find candidates matching specific criteria.
- **Application Management:** Review candidate profiles and resumes securely.

### ⚙️ For Administrators
- **Centralized Control:** Manage users, roles, and platform settings from a unified command center.
- **Advanced Analytics:** In-depth data on placement trends, department performance, and recruiter engagement.
- **Institutional Calendar:** Organize campus-wide recruitment events and institutional deadlines.
- **System Logs:** Monitor platform activity and ensure secure role-based access.

---

## 🛠️ Technology Stack

**Frontend:**
- **React 18**: Component-based UI architecture.
- **Tailwind CSS**: Utility-first styling for a modern, responsive design.
- **Framer Motion**: Smooth animations and transitions.
- **Lucide React**: Clean and consistent iconography.

**Backend:**
- **Node.js & Express.js**: Robust and scalable server-side runtime.
- **Firebase**: Real-time database and secure authentication.
- **JWT**: Stateless authentication for secure API access.

**AI & Advanced Integration:**
- **AI Integration**: (Gemini/Llama) for content generation and recommendations.
- **Speech & Vision**: `react-hook-speech-to-text` and `react-webcam` for interactive features.

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/AmateurMind/STROTAS-IEEE-RANCHI.git
    cd STROTAS-IEEE-RANCHI
    ```

2.  **Install Dependencies**
    ```bash
    npm run install:all
    ```

3.  **Environment Setup**
    Create a `.env` file in the `backend` directory and configuring the necessary variables (Port, Database URL, JWT Secret, Firebase Config).

4.  **Run Locally**
    Start both frontend and backend servers concurrently:
    ```bash
    npm run dev
    ```

    - Frontend running on: `http://localhost:5173` (or similar)
    - Backend running on: `http://localhost:5000`

---

## 🤖 N8n Telegram Automation (HR & Mentor Workflow)

Campus Buddy integrates with **N8n** and **Telegram** for automated application status updates. HR/Recruiters and Mentors can approve, reject, or hire students directly via Telegram commands.

### How It Works
1. **Student applies** → Mentor gets Telegram notification
2. **Mentor replies** `Jon approved` or `Jon rejected` → Application status updated
3. **HR replies** `Priya hired` → Student marked as completed, can initialize IPP

### Supported Commands
| Command | Action | Who Uses |
|---------|--------|----------|
| `Name approved` | Approve application | Mentor |
| `Name rejected` | Reject application | Mentor |
| `Name hired` | Mark as completed | HR/Recruiter |
| `Name offered` | Mark as offered | HR/Recruiter |
| `Name shortlisted` | Mark as shortlisted | HR/Recruiter |

### Setup Instructions

#### Prerequisites
- Docker Desktop installed
- ngrok account (free tier works)
- Telegram Bot Token (from @BotFather)

#### Step 1: Start ngrok
```bash
ngrok http 5678
```
Copy the HTTPS URL (e.g., `https://xxxx-xx-xx.ngrok-free.app`)

#### Step 2: Run N8n with Docker
```bash
docker run -it --rm --name n8n -p 5678:5678 -e WEBHOOK_URL=https://YOUR-NGROK-URL -v n8n_data:/home/node/.n8n docker.n8n.io/n8nio/n8n
```
Replace `YOUR-NGROK-URL` with your actual ngrok URL.

#### Step 3: Configure N8n
1. Open `http://localhost:5678` in browser
2. Import workflow from `backend/n8n_telegram_workflow.json`
3. Add Telegram credentials (Bot Token from @BotFather)
4. Activate the workflow

#### Step 4: Set Telegram Webhook
```bash
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://YOUR-NGROK-URL/webhook/telegram-trigger"
```

#### Backend Environment Variables
Add to `backend/.env`:
```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_MENTOR_CHAT_ID=your_chat_id
EXTERNAL_API_KEY=n8n-secret-key-123
```

### Workflow Files
- `backend/n8n_telegram_workflow.json` - N8n workflow to import
- `N8N_SETUP_GUIDE.md` - Detailed setup documentation

---

## 👥 Contributors
- Mohammad Suhail
- Rohan Pawar
- Nirmal Pawar
