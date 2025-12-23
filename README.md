# 🎓 Campus Placement Portal (CPP)
### *Bridging the gap between Education and Industry*

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.x-blue?logo=react)
![Node](https://img.shields.io/badge/Node-v18+-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-success?logo=mongodb)

---

## 🌟 Overview
The **Campus Placement Portal** is an enterprise-grade solution designed to streamline the end-to-end recruitment lifecycle for universities. It provides a seamless, unified platform for **Students**, **Faculty Mentors**, **Placement Officers**, and **Corporate Recruiters**.

Built with a focus on **AI-driven career development**, the platform doesn't just manage applications—it prepares students for success through advanced mock interviews and intelligent resume engineering.

---

## 🚀 Key Modules & AI Features

### 🤖 AI Mock Interview Suite
*   **Real-time Intelligence**: Powered by **OpenRouter (Llama 3.3 70B)** and **Gemini 1.5 Flash**.
*   **Video & Voice Interaction**: Practice interviews with real-time video feeds and speech-to-text integration.
*   **Deep Performance Analysis**: Get instant feedback on your answers with specific ratings and improvement suggestions.

### 📝 Resume Engineering Hub
*   **AI Content Generation**: Stop struggling with bullet points. Our AI generates professional experience descriptions and summaries.
*   **Multiple Modern Templates**: Choose from professional, sleek, and creative templates optimized for ATS.
*   **Live Preview**: Real-time visual feedback as you build your professional profile.

### 🛂 Internship Passport
*   **Unified Tracking**: A central hub to manage all job roles, statuses, and upcoming deadlines.
*   **Role-Based Dashboards**: Tailored views for Super-Admins, Recruiter-Admins, and Student users.
*   **Passport Status**: Visual indicators for placement eligibility and progress.

---

## 🛠 Tech Stack

| Frontend | Backend | Infrastructure |
| :--- | :--- | :--- |
| **React 18** (Vite) | **Node.js** & Express | **MongoDB Atlas** (Database) |
| **Tailwind CSS** | **JWT** & Clerk Auth | **Cloudinary** (Media) |
| **Framer Motion** | **Google Gemini AI** | **Firebase** (Real-time) |
| **Lucide Icons** | **OpenRouter** (LLMs) | **N8N** (Workflows) |

---

## 🏗️ Architecture & Roles

- **Student**: Dashboard, Internship Discovery, AI Resume Builder, AI Mock Interview, Passport Tracking.
- **Mentor**: Student progress monitoring, Application review, Evaluation & Feedback.
- **Recruiter**: Job posting, Student directory access, Application processing, Recruitment analytics.
- **Admin**: System-wide configuration, User management, Multi-campus placement reports.

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18.0.0+)
- MongoDB Atlas Account
- Clerk Account (Authentication)
- Cloudinary Account (Media Storage)

### Setup & Installation

1. **Clone the Repo**
   ```bash
   git clone https://github.com/AmateurMind/STROTAS-IEEE-RANCHI.git
   cd STROTAS-IEEE-RANCHI
   ```

2. **Install Workspace Dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment Setup**
   *   Create `.env` in the `frontend/` directory based on `.env.example`.
   *   Create `.env` in the `backend/` directory based on `.env.example`.

4. **Launch Development**
   ```bash
   # Starts both Backend (Port 5000) and Frontend (Port 5173)
   npm run dev
   ```

---

## ⚡ Quick Navigation

| URL | Path | Description |
| :--- | :--- | :--- |
| `localhost:5173/` | Landing | Main landing page |
| `localhost:5173/student/dashboard` | Dashboard | Main Student Hub |
| `localhost:5173/student/career` | Career Hub | Access to AI Tools |
| `localhost:5173/admin/dashboard` | Admin Portal | System Management |

---

## 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ by the Campus Buddy Team**
##   S T R O T A S - I E E E - R A N C H I