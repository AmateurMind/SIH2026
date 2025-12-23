# 🤝 Setup Guide for Collaborators

This guide will help you set up the **CampusBuddy** project (Frontend + Backend) on your local machine.

## 📋 Prerequisites
- **Node.js** (v16 or higher)
- **Git**
- **MongoDB Atlas Connection String** (Ask the project lead if you don't have one)
- **Clerk Publishable Key** (Ask the project lead)

---

## 🚀 1. Clone the Repository
```bash
git clone <repository_url>
cd CampusBuddy
```

---

## 🛠️ 2. Backend Setup

### Install Dependencies
```bash
cd backend
npm install
```

### Configure Environment Variables
Create a file named `.env` in the `backend/` directory with the following content:

```env
# Database Connection
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/campus-placement?retryWrites=true&w=majority

# Server Config
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Security
JWT_SECRET=dev_secret_key_123

# Optional: Email Service
WEB3FORMS_KEY=your_key_here
```

### Start the Backend
Open a terminal and run:
```bash
npm run dev
```
You should see: `🚀 Server running on port 5000`

---

## 🎨 3. Frontend Setup

### Install Dependencies
Open a **new terminal** (keep backend running) and navigate to frontend:
```bash
cd frontend
npm install
```

### Configure Environment Variables
Create a file named `.env` in the `frontend/` directory:

```env
# Backend API URL
VITE_API_URL=http://localhost:5000/api

# Authentication (Clerk)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_... (Ask team for this key)

# AI Features (Optional)
VITE_GEMINI_API_KEY=your_gemini_key
```

### Start the Application (All Portals)
We run 4 separate portals simultaneously (Student, Admin, Recruiter, Mentor).

Run this command to start all of them:
```bash
npm run dev:all
```

This will open the following in your browser/terminal:
- **Student Portal**: [http://localhost:5173](http://localhost:5173)
- **Admin Portal**: [http://localhost:5174](http://localhost:5174)
- **Recruiter Portal**: [http://localhost:5175](http://localhost:5175)
- **Faculty/Mentor Portal**: [http://localhost:5176](http://localhost:5176)

---

## ⚡ Quick Run Command
Once everything is installed, you just need two terminals:

**Terminal 1 (Backend):**
```bash
cd backend && npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend && npm run dev:all
```

---

## 🐛 Troubleshooting

**1. "Port 5000 already in use"**
- Stop any other node processes or change `PORT` in backend `.env`.

**2. "Vite is not defined"**
- Make sure you ran `npm install` inside the `frontend` folder.

**3. Login page looks broken?**
- Ensure you are accessing the correct port (e.g., dont try to login as Admin on 5173).
- **Student**: 5173
- **Admin**: 5174
- **Recruiter**: 5175
- **Mentor**: 5176
