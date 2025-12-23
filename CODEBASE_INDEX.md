# 🏛️ Campus Placement Portal - Codebase Index

## 📋 Project Overview

**Campus Placement Portal** is a comprehensive full-stack web application designed for educational institutions to manage internships and placements with role-based access control.

### 🔧 Tech Stack
- **Frontend**: React 18 + Vite + Tailwind CSS + Lucide Icons
- **Backend**: Node.js + Express.js + MongoDB (Mongoose)
- **Authentication**: JWT + bcryptjs
- **File Handling**: Multer for uploads
- **Email Service**: Web3Forms integration
- **Testing**: TestSprite framework
- **Development**: Nodemon, Concurrently

### 🎯 Core Features
- Role-based authentication (Student, Mentor, Admin, Recruiter)
- Internship management and applications
- Resume builder with PDF generation
- Analytics dashboard
- Mentor approval system
- Placement tracking
- Email notifications

---

## 🗂️ Project Structure

```
📁 campus-placement-portal/
├── 📄 package.json           # Root workspace configuration
├── 📄 README.md             # Project documentation
├── 📄 HOW_TO_RUN.md         # Setup and running instructions
├── 🗂️ backend/             # Node.js/Express API server
├── 🗂️ frontend/            # React frontend application
├── 🗂️ testsprite_tests/    # TestSprite testing framework
└── 🗂️ .github/workflows/   # CI/CD pipelines
```

---

## 🔙 Backend Architecture

### 📁 Backend Structure
```
backend/
├── server.js                # Main server entry point
├── package.json             # Backend dependencies
├── config/
│   └── database.js          # MongoDB Atlas connection
├── models/                  # Mongoose data models
│   ├── index.js             # Admin, Mentor, Recruiter, Feedback schemas
│   ├── Student.js           # Student model with projects/placement
│   ├── Internship.js        # Internship opportunities model
│   └── Application.js       # Application tracking model
├── routes/                  # Express route handlers
│   ├── auth.js              # Authentication endpoints
│   ├── students.js          # Student management
│   ├── mentors.js           # Mentor operations
│   ├── admins.js            # Admin functions
│   ├── recruiters.js        # Recruiter management
│   ├── internships.js       # Internship CRUD
│   ├── applications.js      # Application workflow
│   ├── feedback.js          # Feedback system
│   ├── analytics.js         # Data analytics
│   ├── resume.js            # Resume builder API
│   └── resumes.js           # Resume viewing
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── utils/                   # Utility functions
│   ├── notify.js            # Email notifications
│   └── placementUpdater.js  # Placement status updates
├── scripts/                 # Database utilities
│   ├── migrate-to-mongodb.js # Migration scripts
│   └── update-routes.js     # Route updates
├── data/                    # Seed/mock data (JSON files)
├── uploads/                 # File upload storage
└── tests/                   # Testing framework
```

### 🎯 Key Backend Features

#### 🔐 Authentication System
- **JWT-based authentication** with role-based access
- **Password hashing** using bcryptjs
- **Token verification** middleware
- **Multi-role support**: Student, Mentor, Admin, Recruiter

#### 📊 Data Models

**Student Model** (`models/Student.js`):
- Personal info, academic details (CGPA, semester)
- Skills, projects with GitHub/live links
- Placement status tracking
- Resume management

**Internship Model** (`models/Internship.js`):
- Company details, requirements, benefits
- Eligibility criteria (CGPA, semester, departments)
- Application limits and deadlines
- Approval workflow (admin/recruiter)

**Application Model** (`models/Application.js`):
- Student-internship mapping
- Status tracking (applied → interview → offered → accepted)
- Mentor approval system
- Interview scheduling
- Offer management

**Admin/Mentor/Recruiter Models** (`models/index.js`):
- Role-specific permissions
- Company verification (recruiters)
- Student assignment (mentors)
- Audit logging (admins)

#### 🛠️ API Endpoints

**Authentication** (`/api/auth/`):
- `POST /login` - User authentication
- `POST /register` - User registration
- `GET /verify` - Token verification

**Students** (`/api/students/`):
- Profile management, skills updates
- Application history, placement tracking

**Internships** (`/api/internships/`):
- CRUD operations, search/filter
- Eligibility checking, application management

**Applications** (`/api/applications/`):
- Application workflow management
- Status updates, interview scheduling

---

## 🎨 Frontend Architecture

### 📁 Frontend Structure
```
frontend/
├── index.html               # HTML entry point
├── package.json            # Frontend dependencies
├── vite.config.mjs         # Vite configuration
├── tailwind.config.js      # Tailwind CSS setup
├── src/
│   ├── App.jsx             # Main app component with routing
│   ├── index.jsx           # React DOM entry point
│   ├── index.css           # Global styles
│   ├── components/         # Reusable UI components
│   │   ├── Navbar.jsx      # Navigation component
│   │   ├── LoadingScreen.jsx # Loading states
│   │   ├── LoadingSpinner.jsx # Spinner component
│   │   └── StatusBadge.jsx # Status indicators
│   ├── context/
│   │   └── AuthContext.jsx # Global authentication state
│   ├── pages/              # Page components
│   │   ├── LoginPage.jsx   # Authentication page
│   │   ├── student/        # Student role pages
│   │   ├── mentor/         # Mentor role pages
│   │   ├── admin/          # Admin role pages
│   │   └── recruiter/      # Recruiter role pages
│   └── utils/              # Utility functions
│       ├── resumeViewer.jsx # Resume viewing utilities
│       └── web3forms.jsx   # Email form utilities
└── public/                 # Static assets
```

### 🎯 Key Frontend Features

#### 🔐 Authentication & Routing
- **Protected routes** with role-based access
- **JWT token management** in localStorage
- **Auto-redirect** to appropriate dashboards
- **Context-based state management**

#### 📱 Role-Based Pages

**Student Pages**:
- `StudentDashboard.jsx` - Overview, quick actions
- `StudentProfile.jsx` - Profile management, skills
- `StudentInternships.jsx` - Browse/search internships
- `StudentApplications.jsx` - Application tracking
- `ResumeBuilder.jsx` - PDF resume generation

**Admin Pages**:
- `AdminDashboard.jsx` - System overview
- `AdminInternships.jsx` - Internship approval
- `AdminApplications.jsx` - Application monitoring
- `AdminAnalytics.jsx` - Data visualization

**Mentor Pages**:
- `MentorDashboard.jsx` - Student management

**Recruiter Pages**:
- `RecruiterDashboard.jsx` - Company portal
- `RecruiterStudents.jsx` - Student browsing
- `RecruiterInternships.jsx` - Internship management

#### 🎨 UI/UX Features
- **Tailwind CSS** for responsive design
- **Lucide React** icons
- **React Hot Toast** for notifications
- **Loading states** and error handling
- **Recharts** for analytics visualization

---

## 🗃️ Database Schema

### MongoDB Collections

#### `students`
```javascript
{
  id: String (unique),
  name: String,
  email: String (unique),
  department: String,
  semester: Number,
  cgpa: Number,
  skills: [String],
  projects: [{
    title: String,
    description: String,
    technologies: [String],
    githubLink: String,
    liveLink: String
  }],
  isPlaced: Boolean,
  placedAt: {
    company: String,
    position: String,
    package: String,
    joinDate: Date
  }
}
```

#### `internships`
```javascript
{
  id: String (unique),
  title: String,
  company: String,
  description: String,
  requiredSkills: [String],
  eligibleDepartments: [String],
  minimumSemester: Number,
  minimumCGPA: Number,
  stipend: String,
  duration: String,
  location: String,
  workMode: String (Remote/On-site/Hybrid),
  applicationDeadline: Date,
  status: String (active/closed/draft/pending_approval)
}
```

#### `applications`
```javascript
{
  id: String (unique),
  studentId: String,
  internshipId: String,
  status: String (applied/under_review/approved/rejected/...),
  coverLetter: String,
  mentorApproval: String (pending/approved/rejected),
  interviewScheduled: {
    date: Date,
    interviewer: String,
    mode: String,
    meetingLink: String
  },
  offerDetails: {
    stipend: String,
    startDate: Date,
    duration: String,
    offerExpiry: Date
  }
}
```

---

## 🧪 Testing Framework

### TestSprite Configuration
- **Location**: `testsprite_tests/`
- **Config**: `backend/testsprite.config.js`
- **Test Types**: Functional, Security, UI, Resume Builder

### Test Commands
```bash
npm run test              # Run all tests
npm run test:functional   # Functional tests
npm run test:security     # Security tests
npm run test:ui          # UI tests
npm run test:resume      # Resume builder tests
```

---

## 🚀 Development Workflow

### Getting Started
1. **Install Dependencies**: `npm run install:all`
2. **Configure Environment**: Create `backend/.env`
3. **Start Development**: `npm run dev`

### Environment Variables
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
WEB3FORMS_KEY=email-service-key
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Development Scripts
```bash
npm run dev              # Start both frontend & backend
npm run dev:frontend     # Frontend only (Vite)
npm run dev:backend      # Backend only (Nodemon)
npm run build           # Production build
npm start               # Production mode
```

---

## 🔧 Integration Points

### Email Service (Web3Forms)
- **Location**: `backend/utils/notify.js`, `frontend/src/utils/web3forms.jsx`
- **Purpose**: Application notifications, status updates
- **Configuration**: `WEB3FORMS_KEY` in environment

### File Upload System
- **Storage**: `backend/uploads/`
- **Middleware**: Multer configuration
- **Types**: Profile pictures, resume files

### PDF Generation
- **Library**: PDFKit
- **Location**: Resume builder functionality
- **Features**: Dynamic resume creation

---

## 📈 Recent Updates & Fixes

### Completed Features
- ✅ MongoDB Atlas integration
- ✅ Web3Forms email service
- ✅ Role separation implementation
- ✅ Eligibility system fixes
- ✅ Frontend-backend connectivity
- ✅ Placement rate analysis

### Documentation Files
- `MONGODB_MIGRATION_GUIDE.md` - Database migration
- `WEB3FORMS_SETUP_GUIDE.md` - Email service setup
- `ROLE_SEPARATION_IMPLEMENTATION.md` - Role-based access
- `ERRORS_FIXED.md` - Bug fix history

---

## 🎯 Next Steps & TODO Items

### High Priority
- Resume flow completion (`TODO_RESUME_FLOW.md`)
- Advanced analytics features
- Mobile responsiveness improvements
- Performance optimization

### Integration Opportunities
- Real-time notifications (WebSocket)
- Advanced search with Elasticsearch
- Calendar integration for interviews
- Document verification system

---

## 🤝 Contributing

### Code Structure Guidelines
1. **Backend**: Follow Express.js best practices
2. **Frontend**: React functional components with hooks
3. **Database**: Mongoose schemas with validation
4. **Testing**: Comprehensive test coverage
5. **Documentation**: Keep this index updated

### Key Files to Monitor
- `server.js` - Main backend entry
- `App.jsx` - Frontend routing
- `models/` - Database schema changes
- `routes/` - API endpoint modifications

---

*This codebase index serves as a comprehensive guide to understanding the Campus Placement Portal architecture, features, and development workflow.*