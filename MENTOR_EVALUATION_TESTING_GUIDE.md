# How to Test the Mentor Evaluation Flow

## Overview
The mentor evaluation uses a **magic link** system - company mentors don't need accounts. They receive a secure, time-limited link to submit their evaluation.

## Step-by-Step Testing Guide

### 1. Access the IPP Review Dashboard
Navigate to the SuperAdmin portal:
```
http://localhost:5174/admin/ipp-reviews
```

### 2. Find an IPP with "Awaiting Mentor" Status
Look for IPPs with the yellow badge that says "Awaiting Mentor" (status: `pending_mentor_eval`)

### 3. Click "Send Link" Button
- Click the blue "Send Link" button next to the IPP
- A modal will pop up

### 4. Fill in Mentor Details
Enter the company mentor's information:
- **Mentor Name**: e.g., "John Smith"
- **Mentor Email**: e.g., "john@company.com"

### 5. Generate Magic Link
- Click "Generate Magic Link"
- The system will create a secure link valid for 7 days
- Example: `http://localhost:5173/mentor/evaluate/IPP-STU001-INT002-2025?token=abc123...`

### 6. Test the Evaluation Form
- Click "Copy" to copy the link
- Click "Open Link" to test it in a new tab
- OR paste the link in a new browser window

### 7. Fill Out the Evaluation
The mentor evaluation form includes:
- **Mentor Information** (name, email, designation)
- **Technical Skills** (10-point rating for 5 skills)
- **Soft Skills** (10-point rating for 6 skills)
- **Qualitative Feedback** (strengths, areas for improvement, detailed feedback)
- **Recommendation** (would rehire, recommendation level)

### 8. Submit Evaluation
- After submission, the IPP status changes to `pending_student_submission`
- The student can now submit their documentation

## Workflow Summary

```
1. IPP Created → pending_mentor_eval
   ↓ (Admin sends magic link)
2. Mentor Evaluates → pending_student_submission
   ↓ (Student submits docs)
3. Student Submits → pending_faculty_approval
   ↓ (Faculty reviews)
4. Faculty Approves → verified
   ↓ (Admin publishes)
5. Published → published
```

## Key Features

- ✅ **No Login Required**: Mentors use magic links
- ✅ **Secure**: Links expire after 7 days
- ✅ **One-Click Access**: Easy modal from dashboard
- ✅ **Copy to Clipboard**: Quick sharing
- ✅ **Direct Testing**: Open link button for testing

## Troubleshooting

**Q: I don't see any IPPs with "Awaiting Mentor" status**
A: You need to create an IPP first from the student portal. Go to the student dashboard and initialize an IPP from a completed internship.

**Q: The magic link doesn't work**
A: Check that:
- The backend is running on port 5000
- The frontend is running on port 5173
- The `FRONTEND_URL` in your `.env` file is set correctly

**Q: Where do I see the generated link?**
A: After clicking "Generate Magic Link", it appears in the modal. You can copy it or click "Open Link" to test it immediately.
