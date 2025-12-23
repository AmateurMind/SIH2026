# 📡 IPP API Reference Guide

Quick reference for all IPP API endpoints with examples

---

## Base URL
```
http://localhost:5000/api/ipp
```

---

## Authentication

Most endpoints require JWT authentication:
```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN',
  'Content-Type': 'application/json'
}
```

**Exception:** `/company-evaluation` and `/public/:ippId` use magic link or no auth

---

## 1. Create IPP

**Endpoint:** `POST /api/ipp/create`  
**Auth:** Required  
**Who can call:** Student, Admin

**Request:**
```json
{
  "studentId": "STU001",
  "internshipId": "INT123",
  "applicationId": "APP456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "IPP created successfully",
  "ippId": "IPP-STU001-INT123-2025",
  "data": { /* IPP object */ }
}
```

---

## 2. Get IPP by ID

**Endpoint:** `GET /api/ipp/:ippId`  
**Auth:** Required  
**Who can call:** Student (own), Faculty, Admin

**Example:**
```javascript
GET /api/ipp/IPP-STU001-INT123-2025
```

**Response:**
```json
{
  "success": true,
  "data": { /* Complete IPP object */ }
}
```

---

## 3. Get All Student IPPs

**Endpoint:** `GET /api/ipp/student/:studentId`  
**Auth:** Required  
**Who can call:** Student (own), Faculty, Admin

**Example:**
```javascript
GET /api/ipp/student/STU001
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    { /* IPP 1 */ },
    { /* IPP 2 */ },
    { /* IPP 3 */ }
  ]
}
```

---

## 4. Send Evaluation Request

**Endpoint:** `POST /api/ipp/:ippId/send-evaluation-request`  
**Auth:** Required  
**Who can call:** Admin, Faculty

**Request:**
```json
{
  "mentorEmail": "john.smith@company.com",
  "mentorName": "John Smith"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Evaluation request sent",
  "magicLink": "http://localhost:5173/mentor/evaluate/IPP-STU001-INT123-2025?token=abc123..."
}
```

**What happens:**
- Generates secure token (valid for 7 days)
- Sends email to company mentor
- Returns magic link for testing

---

## 5. Submit Company Evaluation

**Endpoint:** `PUT /api/ipp/:ippId/company-evaluation`  
**Auth:** Magic Link Token (no JWT needed)  
**Who can call:** Company Mentor (via magic link)

**Request:**
```json
{
  "token": "abc123xyz789...",
  "evaluation": {
    "mentorName": "John Smith",
    "mentorEmail": "john@company.com",
    "mentorDesignation": "Senior Developer",
    
    "technicalSkills": {
      "domainKnowledge": 8,
      "problemSolving": 9,
      "codeQuality": 8,
      "learningAgility": 9,
      "toolProficiency": 7
    },
    
    "softSkills": {
      "punctuality": 9,
      "teamwork": 8,
      "communication": 9,
      "leadership": 7,
      "adaptability": 8,
      "workEthic": 9
    },
    
    "overallPerformance": "Excellent",
    "strengths": ["Quick learner", "Great communicator"],
    "areasForImprovement": ["Code documentation"],
    "keyAchievements": ["Built 3 features", "Optimized queries"],
    "projectsWorkedOn": [
      {
        "projectName": "User Dashboard",
        "description": "Built responsive dashboard",
        "technologiesUsed": ["React", "Node.js"],
        "role": "Full-stack Developer",
        "impact": "Improved UX by 40%"
      }
    ],
    "wouldRehire": true,
    "recommendationLevel": "Highly Recommended",
    "detailedFeedback": "Outstanding intern who exceeded expectations..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Evaluation submitted successfully",
  "data": { /* Updated IPP */ }
}
```

---

## 6. Submit Student Documentation

**Endpoint:** `PUT /api/ipp/:ippId/student-submission`  
**Auth:** Required  
**Who can call:** Student (own), Admin

**Request:**
```json
{
  "submission": {
    "internshipReport": {
      "fileUrl": "https://cloudinary.com/.../report.pdf",
      "fileName": "internship_report.pdf"
    },
    
    "projectDocumentation": [
      {
        "title": "E-commerce Dashboard",
        "description": "Built admin dashboard",
        "fileUrl": "https://cloudinary.com/.../project.pdf",
        "githubLink": "https://github.com/user/project",
        "liveDemo": "https://demo.example.com"
      }
    ],
    
    "certificateUrl": "https://cloudinary.com/.../cert.pdf",
    "offerLetterUrl": "https://cloudinary.com/.../offer.pdf",
    
    "studentReflection": {
      "keyLearnings": [
        "Learned React and Node.js",
        "Improved problem-solving skills",
        "Better teamwork and communication"
      ],
      "challenges": [
        "Initially struggled with async programming",
        "Learning curve for new framework"
      ],
      "achievements": [
        "Completed 3 major features",
        "Optimized database performance by 30%"
      ],
      "futureGoals": "Want to become a full-stack developer specializing in MERN stack"
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Submission successful",
  "data": { /* Updated IPP */ }
}
```

---

## 7. Submit Faculty Assessment

**Endpoint:** `PUT /api/ipp/:ippId/faculty-assessment`  
**Auth:** Required  
**Who can call:** Faculty, Admin

**Request:**
```json
{
  "assessment": {
    "mentorId": "MEN001",
    "mentorName": "Dr. Faculty Mentor",
    
    "learningOutcomes": {
      "objectivesMet": true,
      "skillsAcquired": ["React", "Node.js", "MongoDB", "Git"],
      "industryExposure": 9,
      "professionalGrowth": 8
    },
    
    "academicAlignment": {
      "relevanceToCurriculum": 9,
      "practicalApplicationOfTheory": 8,
      "careerReadiness": 9
    },
    
    "facultyRemarks": "Excellent internship experience with significant learning outcomes",
    "creditsAwarded": 4,
    "grade": "A",
    
    "approvalStatus": "approved",
    "approvalRemarks": "Well-structured learning experience"
  }
}
```

**approvalStatus options:**
- `approved` - Move to verified
- `needs_revision` - Send back to student
- `rejected` - Reject IPP

**Response:**
```json
{
  "success": true,
  "message": "Assessment submitted successfully",
  "data": { /* Updated IPP */ }
}
```

---

## 8. Verify & Publish IPP

**Endpoint:** `POST /api/ipp/:ippId/verify`  
**Auth:** Required  
**Who can call:** Admin only

**What it does:**
1. Calculates overall rating
2. Assigns performance grade
3. Calculates employability score
4. Generates certificate ID
5. Creates public URL
6. Updates student statistics
7. Marks IPP as published

**Request:**
```javascript
POST /api/ipp/IPP-STU001-INT123-2025/verify
// No body needed
```

**Response:**
```json
{
  "success": true,
  "message": "IPP verified and published",
  "publicUrl": "/ipp/view/IPP-STU001-INT123-2025",
  "data": {
    "ippId": "IPP-STU001-INT123-2025",
    "status": "published",
    "summary": {
      "overallRating": 8.33,
      "performanceGrade": "A",
      "skillGrowthScore": 0,
      "employabilityScore": 83.3,
      "recommendationStrength": "Strong"
    },
    "certificate": {
      "certificateId": "CERT-IPP-STU001-INT123-2025",
      "generatedAt": "2025-11-20T12:40:00.000Z"
    },
    "sharing": {
      "publicProfileUrl": "/ipp/view/IPP-STU001-INT123-2025",
      "isPublic": true,
      "viewCount": 0
    }
  }
}
```

---

## 9. Public View

**Endpoint:** `GET /api/ipp/public/:ippId`  
**Auth:** None (public endpoint)  
**Who can call:** Anyone with the link

**Example:**
```javascript
GET /api/ipp/public/IPP-STU001-INT123-2025
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ippId": "IPP-STU001-INT123-2025",
    "studentId": "STU001",
    "internshipDetails": { /* ... */ },
    "companyMentorEvaluation": { /* ... */ },
    "summary": { /* ... */ },
    "badges": [ /* ... */ ],
    // Note: Sensitive data like student email is not included
  }
}
```

**Note:** 
- Increments view count each time accessed
- Only shows public-safe data
- Student personal info (email, phone) is redacted

---

## Error Responses

All endpoints return error responses in this format:

```json
{
  "error": "Error message here",
  "details": "Detailed error description"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid token)
- `404` - Not Found
- `500` - Server Error

---

## Frontend Integration Examples

### React Axios Examples

```javascript
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/ipp';

// Create IPP
export const createIPP = async (data, token) => {
  try {
    const response = await axios.post(`${API_BASE}/create`, data, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating IPP:', error.response?.data);
    throw error;
  }
};

// Get student IPPs
export const getStudentIPPs = async (studentId, token) => {
  const response = await axios.get(`${API_BASE}/student/${studentId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.data;
};

// Submit company evaluation (no auth token needed, uses magic link)
export const submitCompanyEvaluation = async (ippId, token, evaluation) => {
  const response = await axios.put(
    `${API_BASE}/${ippId}/company-evaluation`,
    { token, evaluation }
  );
  return response.data;
};

// Public view (no auth)
export const getPublicIPP = async (ippId) => {
  const response = await axios.get(`${API_BASE}/public/${ippId}`);
  return response.data;
};
```

---

## Testing with cURL

### Create IPP
```bash
curl -X POST http://localhost:5000/api/ipp/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "studentId": "STU001",
    "internshipId": "INT123",
    "applicationId": "APP456"
  }'
```

### Get Public IPP
```bash
curl http://localhost:5000/api/ipp/public/IPP-STU001-INT123-2025
```

---

## Workflow States

IPP goes through these states:

1. `draft` - Just created
2. `pending_mentor_eval` - Waiting for company evaluation
3. `pending_student_submission` - Company done, waiting for student
4. `pending_faculty_approval` - Student done, waiting for faculty
5. `verified` - Faculty approved
6. `published` - Final state, publicly accessible

---

## Tips for Frontend Development

1. **Status Badge Colors:**
   - `draft` → Gray
   - `pending_mentor_eval` → Yellow
   - `pending_student_submission` → Blue
   - `pending_faculty_approval` → Orange
   - `verified` → Green
   - `published` → Purple

2. **Magic Link Handling:**
   ```javascript
   // Extract token from URL
   const { ippId } = useParams();
   const [token] = useSearchParams().get('token');
   
   // Use it in API call
   submitCompanyEvaluation(ippId, token, evaluationData);
   ```

3. **File Uploads:**
   - Use Cloudinary or similar
   - Store URL in IPP, not the file itself
   - Show upload progress for better UX

4. **Validation:**
   - All 1-10 ratings should have min/max validation
   - Required fields: check before submission
   - Show clear error messages

---

## Next: Build the UI!

Now that you understand the API, you can build:
- Company mentor evaluation form
- Student IPP dashboard
- Faculty review interface
- Public IPP viewer

Each endpoint has everything you need to create a complete workflow! 🚀
