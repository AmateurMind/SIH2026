# 🎓 Campus Buddy


A comprehensive campus internship and placement portal designed to streamline the recruitment process for universities, students, mentors, and recruiters.

---

## 🔗 Links
- **Live Demo:** https://campusbuddy-0qnu.onrender.com/  
- **Video Demo:** https://www.youtube.com/watch?v=A15PEUzelfs  

---

## 📖 Overview

Campus Buddy is a unified digital platform that bridges the gap between students, academic mentors, placement cells, and corporate recruiters.

It replaces scattered WhatsApp groups, emails, and spreadsheets with a structured, transparent, and automated placement workflow — from resume creation and internship discovery to evaluations, offers, and final placement records.

The system is designed for **real-world institutional use**, with role-based access control, analytics, and automation built into every step.

---

##  Key Features

### 👨‍🎓 For Students
- Smart dashboard with live application status and recommendations  
- AI-powered resume builder with ATS-friendly formatting  
- Skill gap analysis with personalized learning suggestions  
- AI mock interviews with performance feedback  
- Interview & placement calendar  
- Internship and application tracking  
- Secure academic and document profile  

### 👩‍🏫 For Mentors & Faculty
- Application review and approval workflow  
- Mentee progress and placement tracking  
- Academic and interview calendar  
- Bulk approvals and evaluations  

### 🏢 For Recruiters
- Internship and job posting  
- Candidate discovery & filtering  
- Secure resume and profile review  
- Application status management  

### ⚙️ For Administrators
- Centralized user and role management  
- Placement and internship analytics  
- Institutional event calendar  
- System activity monitoring  

---

## 🛠️ Technology Stack

### Frontend
- **React 18** – Component-based UI  
- **Tailwind CSS** – Responsive styling  
- **Framer Motion** – UI animations  
- **Lucide React** – Icon system  

### Backend & Data
- **Node.js & Express.js** – API & business logic  
- **MongoDB** – Primary database for users, internships, applications, and records  
- **Firebase** – Real-time data & session storage for AI mock interviews  

### Authentication
- **Clerk** – Secure authentication for users, roles, and session management  

### Media & Files
- **Cloudinary** – Secure storage and delivery for resumes, certificates, and user uploads  

### AI & Smart Services
- **AI (Gemini / LLMs)** – Resume building, interviews, recommendations  
- **Speech & Vision** – Interactive mock interviews and behavioral analysis  

### Automation & Workflow
- **n8n** – Event-driven automation for approvals, notifications, and workflow orchestration  

---

## 🤖 Smart Automation (Mentors & Recruiters)

Campus Buddy uses **event-driven automation** powered by **n8n** to keep all stakeholders in sync.

Mentors and recruiters receive real-time notifications when:
- A student applies  
- An application is approved or rejected  
- An internship is completed  
- A student becomes eligible for certification  

These automations ensure that:
- No student misses deadlines  
- No application is lost  
- Every action is recorded and auditable  

> For security and intellectual property protection, internal workflow logic, automation rules, and third-party credentials are not included in this repository.

---


### Local Setup (Developers)

```bash
git clone https://github.com/AmateurMind/STROTAS-IEEE-RANCHI.git
cd STROTAS-IEEE-RANCHI
npm run install:all
npm run dev
