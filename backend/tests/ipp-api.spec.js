import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

# Test data
TEST_USERS = {
    "student": {
        "id": "TEST_STU_001",
        "email": "test.student@college.edu",
        "name": "Test Student"
    },
    "admin": {
        "id": "TEST_ADM_001",
        "email": "test.admin@college.edu",
        "name": "Test Admin"
    }
}

TEST_INTERNSHIP = {
    "id": "TEST_INT_001",
    "title": "Software Engineer Intern",
    "company": "Test Corp"
}

def get_auth_token(email, password="test123"):
    """Helper to get JWT token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": email,
        "password": password
    }, timeout=TIMEOUT)
    if response.status_code == 200:
        return response.json().get("token")
    return None

def test_ipp_api_endpoints():
    """Test IPP API endpoints comprehensively"""

    # Get auth tokens
    student_token = get_auth_token(TEST_USERS["student"]["email"])
    admin_token = get_auth_token(TEST_USERS["admin"]["email"])

    assert student_token, "Failed to get student auth token"
    assert admin_token, "Failed to get admin auth token"

    headers = {"Content-Type": "application/json"}

    # Test 1: Create IPP
    create_payload = {
        "studentId": TEST_USERS["student"]["id"],
        "internshipId": TEST_INTERNSHIP["id"],
        "applicationId": "TEST_APP_001"
    }

    response = requests.post(
        f"{BASE_URL}/api/ipp/create",
        json=create_payload,
        headers={**headers, "Authorization": f"Bearer {admin_token}"},
        timeout=TIMEOUT
    )

    assert response.status_code == 201, f"Expected 201 for IPP creation, got {response.status_code}"
    ipp_data = response.json()
    assert ipp_data["success"] == True, "IPP creation should succeed"
    ipp_id = ipp_data["ippId"]
    assert ipp_id.startswith("IPP-"), "IPP ID should start with IPP-"

    # Test 2: Get IPP by ID
    response = requests.get(
        f"{BASE_URL}/api/ipp/{ipp_id}",
        headers={**headers, "Authorization": f"Bearer {student_token}"},
        timeout=TIMEOUT
    )

    assert response.status_code == 200, f"Expected 200 for IPP fetch, got {response.status_code}"
    ipp_data = response.json()
    assert ipp_data["success"] == True, "IPP fetch should succeed"
    assert ipp_data["data"]["ippId"] == ipp_id, "IPP ID should match"

    # Test 3: Send evaluation request
    eval_request_payload = {
        "mentorEmail": "mentor@company.com",
        "mentorName": "Test Mentor"
    }

    response = requests.post(
        f"{BASE_URL}/api/ipp/{ipp_id}/send-evaluation-request",
        json=eval_request_payload,
        headers={**headers, "Authorization": f"Bearer {admin_token}"},
        timeout=TIMEOUT
    )

    assert response.status_code == 200, f"Expected 200 for evaluation request, got {response.status_code}"
    eval_data = response.json()
    assert eval_data["success"] == True, "Evaluation request should succeed"
    assert "magicLink" in eval_data, "Magic link should be returned"

    # Test 4: Submit company evaluation (get token first)
    # First get the IPP to retrieve the token
    response = requests.get(
        f"{BASE_URL}/api/ipp/{ipp_id}",
        headers={**headers, "Authorization": f"Bearer {admin_token}"},
        timeout=TIMEOUT
    )
    ipp_with_token = response.json()["data"]
    mentor_token = ipp_with_token.get("mentorAccessToken")

    assert mentor_token, "Mentor access token should be set"

    evaluation_payload = {
        "token": mentor_token,
        "evaluation": {
            "mentorName": "Test Mentor",
            "mentorEmail": "mentor@company.com",
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
            "strengths": ["Quick learner", "Great problem solver"],
            "areasForImprovement": ["Could improve documentation"],
            "keyAchievements": ["Completed 3 major features"],
            "wouldRehire": True,
            "recommendationLevel": "Highly Recommended",
            "detailedFeedback": "Outstanding intern who exceeded expectations"
        }
    }

    response = requests.put(
        f"{BASE_URL}/api/ipp/{ipp_id}/company-evaluation",
        json=evaluation_payload,
        headers=headers,
        timeout=TIMEOUT
    )

    assert response.status_code == 200, f"Expected 200 for company evaluation, got {response.status_code}"
    eval_submit_data = response.json()
    assert eval_submit_data["success"] == True, "Company evaluation should succeed"
    assert eval_submit_data["data"]["verification"]["companyVerified"] == True, "Company should be verified"

    # Test 5: Student submission
    submission_payload = {
        "submission": {
            "studentReflection": {
                "keyLearnings": ["Learned React", "Improved problem solving", "Better teamwork"],
                "challenges": ["Initially struggled with async programming"],
                "achievements": ["Built 3 full-stack features", "Optimized performance"],
                "futureGoals": "Want to become a full-stack developer"
            }
        }
    }

    response = requests.put(
        f"{BASE_URL}/api/ipp/{ipp_id}/student-submission",
        json=submission_payload,
        headers={**headers, "Authorization": f"Bearer {student_token}"},
        timeout=TIMEOUT
    )

    assert response.status_code == 200, f"Expected 200 for student submission, got {response.status_code}"
    submit_data = response.json()
    assert submit_data["success"] == True, "Student submission should succeed"
    assert submit_data["data"]["status"] == "pending_faculty_approval", "Status should be pending faculty approval"

    # Test 6: Faculty assessment
    assessment_payload = {
        "assessment": {
            "mentorName": "Dr. Faculty Mentor",
            "learningOutcomes": {
                "objectivesMet": True,
                "skillsAcquired": ["React", "Node.js", "MongoDB"],
                "industryExposure": 9,
                "professionalGrowth": 8
            },
            "academicAlignment": {
                "relevanceToCurriculum": 9,
                "practicalApplicationOfTheory": 8,
                "careerReadiness": 9
            },
            "facultyRemarks": "Excellent internship experience with significant learning",
            "creditsAwarded": 4,
            "grade": "A",
            "approvalStatus": "approved"
        }
    }

    response = requests.put(
        f"{BASE_URL}/api/ipp/{ipp_id}/faculty-assessment",
        json=assessment_payload,
        headers={**headers, "Authorization": f"Bearer {admin_token}"},
        timeout=TIMEOUT
    )

    assert response.status_code == 200, f"Expected 200 for faculty assessment, got {response.status_code}"
    assess_data = response.json()
    assert assess_data["success"] == True, "Faculty assessment should succeed"
    assert assess_data["data"]["verification"]["facultyApproved"] == True, "Faculty should be approved"
    assert assess_data["data"]["status"] == "verified", "Status should be verified"

    # Test 7: Verify and publish IPP
    response = requests.post(
        f"{BASE_URL}/api/ipp/{ipp_id}/verify",
        headers={**headers, "Authorization": f"Bearer {admin_token}"},
        timeout=TIMEOUT
    )

    assert response.status_code == 200, f"Expected 200 for IPP verification, got {response.status_code}"
    verify_data = response.json()
    assert verify_data["success"] == True, "IPP verification should succeed"
    assert verify_data["data"]["status"] == "published", "Status should be published"
    assert "overallRating" in verify_data["data"]["summary"], "Overall rating should be calculated"
    assert verify_data["data"]["sharing"]["isPublic"] == True, "IPP should be public"

    # Test 8: Public view (no auth required)
    response = requests.get(
        f"{BASE_URL}/api/ipp/public/{ipp_id}",
        timeout=TIMEOUT
    )

    assert response.status_code == 200, f"Expected 200 for public IPP view, got {response.status_code}"
    public_data = response.json()
    assert public_data["success"] == True, "Public IPP view should succeed"
    assert public_data["data"]["sharing"]["isPublic"] == True, "IPP should be public"

    # Test 9: Invalid IPP access
    response = requests.get(
        f"{BASE_URL}/api/ipp/public/INVALID_IPP",
        timeout=TIMEOUT
    )

    assert response.status_code == 404, f"Expected 404 for invalid IPP, got {response.status_code}"

    print("✅ All IPP API tests passed!")

# Run the test
if __name__ == "__main__":
    test_ipp_api_endpoints()