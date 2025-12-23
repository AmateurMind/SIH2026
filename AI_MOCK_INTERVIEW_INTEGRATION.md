# AI Mock Interview Integration

## Overview

Successfully integrated AI-powered mock interview feature into the student portal. This feature allows students to practice technical interviews with AI-generated questions and receive feedback.

## Features

- **AI-Generated Questions**: Creates 5 custom interview questions based on job role, tech stack, and experience level using Meta Llama 3.3 70B (free via OpenRouter)
- **Speech-to-Text Recording**: Records answers using browser speech recognition
- **AI Feedback**: Provides detailed feedback with 1-10 ratings on each answer
- **Interview History**: Stores all interviews in Firebase Firestore
- **Offline Support**: Firebase configured with offline persistence

## Files Added

### Components (`frontend/src/components/ai-interview/`)

- `form-mock-interview.tsx` - Form to create/edit interview configurations
- `generate.tsx` - AI question generation component
- `question-section.tsx` - Displays interview questions
- `record-answer.tsx` - Speech-to-text answer recording
- `save-modal.tsx` - Save interview modal
- `modal.tsx` - Reusable modal component
- `pin.tsx` - PIN input component
- `container.tsx` - Layout container
- `custom-bread-crumb.tsx` - Breadcrumb navigation
- `headings.tsx` - Heading components
- `tooltip-button.tsx` - Button with tooltip
- `ui/` - Shadcn UI components (accordion, alert, badge, button, card, dialog, form, input, label, separator, sheet, skeleton, tabs, textarea, tooltip)

### Pages (`frontend/src/pages/student/ai-interview/`)

- `create-edit-page.tsx` - Create/edit interview configuration
- `mock-interview-page.tsx` - Take the interview
- `feedback.tsx` - View results and AI feedback
- `mock-load-page.tsx` - Loading state for interviews

### Configuration & Support

- `frontend/src/config/firebase.config.ts` - Firebase setup with Firestore
- `frontend/src/types/index.ts` - TypeScript interfaces for Interview and UserAnswer
- `frontend/src/lib/utils.ts` - Utility functions (cn for className merging)
- `frontend/src/lib/helpers.ts` - Helper functions
- `frontend/src/handlers/auth-handler.tsx` - Clerk authentication handler
- `frontend/src/layouts/` - Auth layouts and protected routes
- `frontend/src/provider/toast-provider.tsx` - Toast notifications (Sonner)

## Routes Added

### Student Routes

| Route                                         | Component           | Description                        |
| --------------------------------------------- | ------------------- | ---------------------------------- |
| `/student/ai-interview/create`                | `CreateEditPage`    | Create new interview configuration |
| `/student/ai-interview/edit/:interviewId`     | `CreateEditPage`    | Edit existing interview            |
| `/student/ai-interview/start/:interviewId`    | `MockInterviewPage` | Take the interview                 |
| `/student/ai-interview/feedback/:interviewId` | `FeedbackPage`      | View results and feedback          |

## Navigation

Added "AI Mock Interview" link in student navigation menu with BrainCircuit icon.

## Environment Variables

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_pub_key

# OpenRouter API (Meta Llama 3.3 70B - Free)
VITE_OPENROUTER_API_KEY=your_openrouter_key
VITE_OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
VITE_OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct:free
```

## Dependencies Installed

```json
{
  "dependencies": {
    "firebase": "^12.6.0",
    "@clerk/clerk-react": "^5.56.2",
    "react-hook-speech-to-text": "^0.8.0",
    "react-webcam": "^7.2.0",
    "zod": "^4.1.12",
    "react-hook-form": "^7.66.1",
    "@hookform/resolvers": "^5.2.2",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.4.0"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "@types/react": "^19.2.6",
    "@types/react-dom": "^19.2.3"
  }
}
```

## Configuration Files

- **tsconfig.json** - TypeScript configuration with path aliases
- **tsconfig.node.json** - Node/Vite TypeScript config
- **vite.config.mjs** - Updated to support TypeScript and path aliases

## Setup Required

### 1. Firebase Firestore Setup

Enable Firestore database in Firebase Console:

1. Go to https://console.firebase.google.com/project/mock-ef6f2
2. Navigate to Firestore Database
3. Click "Create database"
4. Choose production mode
5. Select your preferred region

### 2. Firestore Structure

The app will automatically create the following collections:

- `interviews` - Stores interview configurations
  - Fields: position, techStack, yearsOfExperience, questions[], createdAt, userId
- `userAnswers` - Stores user responses and feedback
  - Fields: interviewId, questionId, answer, feedback, rating, createdAt, userId

## How It Works

### 1. Create Interview

Students navigate to "AI Mock Interview" and fill out:

- Job Position (e.g., "Full Stack Developer")
- Tech Stack (e.g., "React, Node.js, MongoDB")
- Years of Experience (e.g., "2")

### 2. Generate Questions

The app calls OpenRouter API with Meta Llama 3.3 70B to generate 5 relevant interview questions based on the input.

### 3. Take Interview

- Students see questions one by one
- Click record button to answer using speech-to-text
- Can re-record answers
- Submit when finished

### 4. Get Feedback

- AI analyzes each answer
- Provides rating (1-10)
- Gives detailed feedback on strengths and areas for improvement
- Stores results for future reference

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Database**: Firebase Firestore (NoSQL, real-time)
- **Authentication**: Clerk (integrated with existing auth)
- **AI Model**: Meta Llama 3.3 70B Instruct (via OpenRouter API - FREE)
- **Speech**: Web Speech API (browser native)
- **UI Framework**: Tailwind CSS + Shadcn/UI components
- **Form Validation**: Zod + React Hook Form

## Security Notes

⚠️ **API Keys**: The environment variables contain sensitive keys. In production:

1. Use environment-specific .env files
2. Never commit .env to version control
3. Use Firebase Security Rules to protect data
4. Implement rate limiting on OpenRouter API calls
5. Consider using Clerk's user ID for data isolation

## Deployment Checklist

- [ ] Update Firebase Security Rules to restrict access by userId
- [ ] Set up environment variables in deployment platform
- [ ] Test speech recognition in production environment
- [ ] Monitor OpenRouter API usage (free tier has limits)
- [ ] Enable Firestore offline persistence in production
- [ ] Add error boundaries for better error handling
- [ ] Implement analytics to track feature usage

## User Flow

1. Student logs in → Sees "AI Mock Interview" in navigation
2. Clicks "AI Mock Interview" → Redirected to create interview page
3. Fills form with job details → AI generates 5 questions
4. Clicks "Start Interview" → Answers questions with speech
5. Submits interview → Receives AI feedback and ratings
6. Can view past interviews and improve

## Future Enhancements

- Video recording for presentation practice
- Interview sharing with mentors
- Custom question banks
- Mock interview scheduling with peers
- Performance analytics over time
- Industry-specific question templates
