import requests
import uuid

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

# Authentication credentials for testing
TEST_USER = {
    "name": "Test Student",
    "email": "student_test@example.com",
    "password": "TestPass123!",
    "department": "Computer Science",
    "semester": 6,
    "cgpa": 8.5
}

def register_user():
    # Register the test user if not already registered
    resp = requests.post(
        f"{BASE_URL}/api/auth/register",
        json=TEST_USER,
        timeout=TIMEOUT
    )
    # If user exists, 400 may be returned; ignore to allow login
    assert resp.status_code in (201, 400), f"Unexpected status code on register: {resp.status_code}"


def get_auth_token():
    register_user()
    # Login to get JWT token
    resp = requests.post(
        f"{BASE_URL}/api/auth/login",
        json={"email": TEST_USER["email"], "password": TEST_USER["password"]},
        timeout=TIMEOUT,
    )
    assert resp.status_code == 200, "Login failed, cannot get token"
    json_resp = resp.json()
    token = json_resp.get("token") or json_resp.get("accessToken") or json_resp.get("jwt")
    assert token, "JWT token missing in login response"
    return token


def test_application_submission_and_status_update():
    token = get_auth_token()
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
    }

    created_application_id = None

    # Test POST /api/applications - valid submission (expect 201)
    application_payload_valid = {
        "internshipId": str(uuid.uuid4()),
        "coverLetter": "I am excited to apply for this internship.",
        "skills": ["Python", "Machine Learning"],
        "cgpa": 9.1,
        "semester": 6,
    }
    try:
        # Submit application with valid data
        resp = requests.post(
            f"{BASE_URL}/api/applications",
            json=application_payload_valid,
            headers=headers,
            timeout=TIMEOUT,
        )
        assert resp.status_code == 201, f"Expected 201 for valid submission, got {resp.status_code}"
        json_resp = resp.json()
        created_application_id = json_resp.get("id") or json_resp.get("_id") or json_resp.get("applicationId")
        assert created_application_id, "No application ID returned after creation"

        # Test PUT /api/applications/{id}/status - update status with authorization (expect 200)
        status_update_payload = {
            "status": "Reviewed"
        }

        resp_status_update = requests.put(
            f"{BASE_URL}/api/applications/{created_application_id}/status",
            json=status_update_payload,
            headers=headers,
            timeout=TIMEOUT,
        )
        assert (
            resp_status_update.status_code == 200
        ), f"Expected 200 on authorized status update, got {resp_status_update.status_code}"

        # Test PUT /api/applications/{id}/status - update status without authorization (expect 403)
        resp_forbidden = requests.put(
            f"{BASE_URL}/api/applications/{created_application_id}/status",
            json=status_update_payload,
            timeout=TIMEOUT,
        )
        assert (
            resp_forbidden.status_code == 403
        ), f"Expected 403 on unauthorized status update, got {resp_forbidden.status_code}"

        # Test POST /api/applications - invalid submission (expect 400)
        application_payload_invalid = {
            "coverLetter": "",
        }
        resp_invalid = requests.post(
            f"{BASE_URL}/api/applications",
            json=application_payload_invalid,
            headers=headers,
            timeout=TIMEOUT,
        )
        assert resp_invalid.status_code == 400, f"Expected 400 for invalid submission, got {resp_invalid.status_code}"

    finally:
        # Cleanup - delete created application if possible (assuming such endpoint exists)
        if created_application_id:
            try:
                requests.delete(
                    f"{BASE_URL}/api/applications/{created_application_id}",
                    headers=headers,
                    timeout=TIMEOUT,
                )
            except Exception:
                pass


test_application_submission_and_status_update()
