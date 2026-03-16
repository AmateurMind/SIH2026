# Campus Buddy

Campus Buddy is a full-stack internship and placement platform for students, mentors, recruiters, and placement cells.

It replaces fragmented communication (WhatsApp, email chains, spreadsheets) with a single workflow for profile management, resume quality analysis, interview practice, application tracking, and automation.

---

## Links
- Live Demo: https://campusbuddy-0qnu.onrender.com/
- Video Demo: https://www.youtube.com/watch?v=A15PEUzelfs

---

## What Is Improved

### 1) AI Resume Checker (ATS) - Improved
- ATS score out of 100 with transparent score breakdown:
- Experience (0-30)
- AI Candidate Evaluation (0-30)
- Achievements/Hackathons (0-20)
- Resume Quality (0-10)
- Keyword Match (0-10)
- Deep resume analysis includes:
- Section detection (experience, education, skills, contact)
- Contact validation (email/phone presence)
- Action verbs and quantifiable metrics count
- Word count and formatting checks
- AI-generated insights include:
- Executive summary
- Priority fixes
- Rewritten resume bullets
- Faculty/Admin views for score tracking and comparative analysis

### 2) AI Mock Interview - Improved
- Real-time focus/proctoring monitor during interview sessions
- FaceMesh-based face and gaze signals
- Tab-switch detection using browser visibility events
- Multiple-face detection alerts
- No-face and head-away signals with suspicion scoring
- Event log for interview integrity signals
- Post-interview feedback flow for candidate improvement

---

## Key Features

### For Students
- Profile and document management
- Resume Builder with templates, color themes, save/public toggle, and PDF export
- ATS Resume Checker with AI insights
- AI Mock Interview with monitoring and feedback
- Skill gap analysis with recommended focus areas
- Internship discovery and application tracking
- Calendar and deadline notifications

### For Mentors and Faculty
- Student application review and approval workflow
- Progress visibility and tracking dashboards
- ATS score monitoring for mentees

### For Recruiters
- Internship/job posting and application management
- Candidate profile and resume review
- Status updates across hiring stages

### For Admins
- Role-based control and platform governance
- Institution-level analytics and monitoring
- Placement process visibility

---

## Technology Stack

### Frontend
- React 18
- Tailwind CSS
- Framer Motion
- Lucide React

### Backend and Data
- Node.js and Express
- MongoDB
- Firebase (AI interview session data/workflows)

### Authentication and Files
- Clerk (role-based authentication)
- Cloudinary (file storage and delivery)

### AI and Intelligence
- LLM-based resume analysis and insight generation
- Computer Vision with MediaPipe FaceMesh for mock interview monitoring
- Skill-gap AI analysis services

### Automation
- n8n for event-driven notifications and workflow orchestration
- Telegram-integrated mentor/HR automation flows

---

## Automation Summary

Campus Buddy uses n8n-powered automations to keep mentors, recruiters, and placement teams in sync through notifications and action workflows.

Typical automated events:
- Student applies
- Mentor/recruiter status update
- Approval/rejection flow updates
- Deadline-oriented reminders

---

## Local Setup (Developers)

```bash
git clone https://github.com/AmateurMind/STROTAS-IEEE-RANCHI.git
cd STROTAS-IEEE-RANCHI
npm run install:all
npm run dev
```
