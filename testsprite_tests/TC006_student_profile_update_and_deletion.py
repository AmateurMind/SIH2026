import requests
import uuid

BASE_URL = "http://localhost:5000/f:/2nd-psnewmain-main - Copy"
TIMEOUT = 30

# Test users credentials (assumed existing in system for testing)
ADMIN_EMAIL = "admin@example.com"
ADMIN_PASSWORD = "adminpass123"

STUDENT_EMAIL = f"teststudent_{uuid.uuid4().hex[:8]}@example.com"
STUDENT_PASSWORD = "StudentPass123!"

def authenticate(email, password):
    login_url = f"{BASE_URL}/api/auth/login"
    try:
        resp = requests.post(login_url, json={"email": email, "password": password}, timeout=TIMEOUT)
        resp.raise_for_status()
        token = resp.json().get("token") or resp.json().get("accessToken")
        assert token, "Token missing in login response"
        return token
    except Exception as e:
        raise RuntimeError(f"Authentication failed for {email}: {e}")

def register_student(name, email, password, department="CSE", semester=4, cgpa=8.5):
    url = f"{BASE_URL}/api/auth/register"
    payload = {
        "name": name,
        "email": email,
        "password": password,
        "department": department,
        "semester": semester,
        "cgpa": cgpa
    }
    resp = requests.post(url, json=payload, timeout=TIMEOUT)
    resp.raise_for_status()
    assert resp.status_code == 201
    return

def create_student_profile(token, name, email, department="CSE", semester=4, cgpa=8.5):
    url = f"{BASE_URL}/api/students"
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "name": name,
        "email": email,
        "department": department,
        "semester": semester,
        "cgpa": cgpa
    }
    resp = requests.post(url, headers=headers, json=payload, timeout=TIMEOUT)
    resp.raise_for_status()
    assert resp.status_code == 201
    student = resp.json()
    student_id = student.get("id") or student.get("_id")
    assert student_id, "Created student profile ID not found"
    return student_id

def delete_student(token, student_id):
    url = f"{BASE_URL}/api/students/{student_id}"
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.delete(url, headers=headers, timeout=TIMEOUT)
    if resp.status_code != 204:
        # Try to get error message for debug, but do not raise to allow finally to continue
        try:
            err = resp.json()
        except Exception:
            err = resp.text
        print(f"Warning: Unable to delete student {student_id}, status: {resp.status_code}, response: {err}")

def update_student_profile(token, student_id, update_data):
    url = f"{BASE_URL}/api/students/{student_id}"
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.put(url, headers=headers, json=update_data, timeout=TIMEOUT)
    resp.raise_for_status()
    assert resp.status_code == 200
    updated = resp.json()
    return updated

def test_student_profile_update_and_deletion():
    # Register a new student user
    register_student("Update Delete Test", STUDENT_EMAIL, STUDENT_PASSWORD)

    # Authenticate as student user to create profile (if needed)
    student_token = authenticate(STUDENT_EMAIL, STUDENT_PASSWORD)

    # Create student profile using student token
    student_id = None
    try:
        student_id = create_student_profile(student_token, "Update Delete Test", STUDENT_EMAIL)

        # Prepare update data
        updated_data = {
            "name": "Updated Name",
            "department": "ECE",
            "semester": 5,
            "cgpa": 9.0
        }

        # Attempt update without admin token - expect failure or unauthorized (not defined if student can update self)
        try:
            update_student_profile(student_token, student_id, updated_data)
        except requests.HTTPError as e:
            assert e.response.status_code in (401, 403)

        # Authenticate as admin
        admin_token = authenticate(ADMIN_EMAIL, ADMIN_PASSWORD)

        # Admin attempts to update student profile - expect success 200
        updated_profile = update_student_profile(admin_token, student_id, updated_data)
        assert updated_profile.get("name") == updated_data["name"] or updated_profile.get("department") == updated_data["department"]

        # Attempt unauthorized deletion by student - expect failure 401 or 403
        url = f"{BASE_URL}/api/students/{student_id}"
        headers_student = {"Authorization": f"Bearer {student_token}"}
        resp = requests.delete(url, headers=headers_student, timeout=TIMEOUT)
        assert resp.status_code in (401, 403)

        # Admin deletes student profile - expect 204 No Content
        delete_student(admin_token, student_id)

        # Verify deletion by fetching the profile - expect 404
        resp_get = requests.get(url, headers={"Authorization": f"Bearer {admin_token}"}, timeout=TIMEOUT)
        assert resp_get.status_code == 404

    finally:
        # Cleanup if still exists
        if student_id:
            try:
                admin_token = authenticate(ADMIN_EMAIL, ADMIN_PASSWORD)
                delete_student(admin_token, student_id)
            except Exception:
                pass

test_student_profile_update_and_deletion()