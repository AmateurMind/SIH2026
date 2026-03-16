# CampusBuddy - AI-Powered Campus Placement and Internship Platform

CampusBuddy is a full-stack platform that unifies internship and placement workflows for students, mentors, recruiters, and admins.

It replaces fragmented WhatsApp, email, and spreadsheet operations with one secure system for resume intelligence, mock interviews, skill-gap insights, application tracking, and automation.

---

## Live Links
- Live Demo: https://strotas-frontend.onrender.com/
- Video Demo: https://www.youtube.com/watch?v=A15PEUzelfs

---

## Hackathon Context (IGNISIA 2026)
- Host: MIT World Peace University, Pune
- Event: IGNISIA AI Hackathon 2026
- Format: Online qualifier (PPT) + on-campus grand finale
- Prize Pool: INR 1,00,000
- PPT Format: [Ignisia_PPT_Format.pptx](Ignisia_PPT_Format.pptx)

---

## Problem We Solve
Internship and placement processes are often scattered across WhatsApp groups, emails, and spreadsheets. This causes missed deadlines, delayed approvals, poor visibility, and heavy manual workload for placement cells.

CampusBuddy solves this with a single AI-enabled platform that is role-based, auditable, and automation-ready.

---

## Key Product Modules
- Unified dashboard for Students, Mentors, Recruiters, and Admins
- Resume Builder with templates, profile sync, and PDF export
- ATS Resume Checker with score breakdown and AI insights
- AI Mock Interview with integrity/focus monitoring
- Skill Gap AI with targeted recommendations
- Internship discovery, application tracking, and status workflows
- n8n automation for alerts, approvals, and integrations

---

## What Is Improved (Current Build)

### AI Resume Checker (ATS)
- Overall ATS score out of 100
- Score breakdown: Experience, AI Candidate Evaluation, Achievements, Resume Quality, Keyword Match
- AI Executive Summary and rewritten bullet recommendations
- Section/contact/content checks for actionable improvement

### AI Mock Interview
- Focus Monitor with live status and suspicion score
- Tab switching event logs
- Multiple face detection logs
- Head pose, gaze, and face visibility signals

---

## Screenshots

### 1) AI Mock Interview (Focus Monitor + Event Logs)
Tab switch logs and multiple-face detection logs are captured to support interview integrity and fair evaluation.

![AI Mock Interview - Focus Monitor](docs/images/ai-mock-interview.png)

### 2) AI Resume Analysis (ATS Breakdown + Executive Summary)
Detailed ATS scoring plus AI-generated summary helps students improve resume quality for internships and placements.

![AI Resume Analysis - ATS](docs/images/ai-resume-analysis.png)

Note: Place your screenshot files at:
- `docs/images/ai-mock-interview.png`
- `docs/images/ai-resume-analysis.png`

---

## Technology Stack

### Frontend
- React 18
- Tailwind CSS
- Framer Motion
- Lucide React

### Backend and Data
- Node.js
- Express.js
- MongoDB
- Firebase (interview workflow/session modules)

### Authentication and Storage
- Clerk (role-based auth)
- Cloudinary (file/media delivery)

### AI and Automation
- LLM-based resume intelligence and skill suggestions
- Computer Vision (MediaPipe FaceMesh) for mock interview monitoring
- n8n for workflow automation and external notifications

---

## Viability and Scalability
- Open-source-first stack with low licensing overhead
- Supports 4-role architecture in one deployment
- Modular AI layer (LLM provider can be swapped)
- Automation scales without equivalent headcount growth
- API-first design for ERP/email/calendar/integration expansion

---

## Local Setup

```bash
git clone https://github.com/AmateurMind/STROTAS.git
cd STROTAS
npm run install:all
npm run dev
```
