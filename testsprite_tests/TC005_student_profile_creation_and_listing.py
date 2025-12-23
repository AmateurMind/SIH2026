import requests
import uuid

BASE_URL = "http://localhost:5000/f:/2nd-psnewmain-main - Copy"
REGISTER_URL = f"{BASE_URL}/api/auth/register"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
STUDENTS_URL = f"{BASE_URL}/api/students"
DELETE_STUDENT_URL = f"{BASE_URL}/api/students"

TIMEOUT = 30

def test_student_profile_creation_and_listing():
    # Generate unique user data for registration
    unique_suffix = str(uuid.uuid4())[:8]
    student_registration_data = {
        "name": f"Test Student {unique_suffix}",
        "email": f"teststudent{unique_suffix}@example.com",
        "password": "TestPass123!",
        "department": "Computer Science",
        "semester": 5,
        "cgpa": 8.5
    }

    # Register new student
    reg_resp = requests.post(
        REGISTER_URL,
        json=student_registration_data,
        timeout=TIMEOUT
    )
    assert reg_resp.status_code == 201, f"Expected 201 on registration, got {reg_resp.status_code}"

    try:
        # Login the registered student to get JWT token
        login_data = {
            "email": student_registration_data["email"],
            "password": student_registration_data["password"]
        }
        login_resp = requests.post(
            LOGIN_URL,
            json=login_data,
            timeout=TIMEOUT
        )
        assert login_resp.status_code == 200, f"Expected 200 on login, got {login_resp.status_code}"
        login_json = login_resp.json()
        token = login_json.get("token") or login_json.get("accessToken") or login_json.get("jwt")
        assert token and isinstance(token, str), "JWT token missing or invalid in login response"

        headers = {"Authorization": f"Bearer {token}"}

        # Create student profile using POST /api/students
        # Assuming student profile payload requires similar fields as registration minus password
        student_profile_payload = {
            "name": student_registration_data["name"],
            "email": student_registration_data["email"],
            "department": student_registration_data["department"],
            "semester": student_registration_data["semester"],
            "cgpa": student_registration_data["cgpa"]
        }
        create_resp = requests.post(
            STUDENTS_URL,
            json=student_profile_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert create_resp.status_code == 201, f"Expected 201 on creating student profile, got {create_resp.status_code}"
        created_student = create_resp.json()
        created_student_id = created_student.get("_id") or created_student.get("id")
        assert created_student_id, "Created student profile missing id"

        # List students with GET /api/students using same token (role-based access)
        list_resp = requests.get(
            STUDENTS_URL,
            headers=headers,
            timeout=TIMEOUT
        )
        assert list_resp.status_code == 200, f"Expected 200 on listing students, got {list_resp.status_code}"
        students_list = list_resp.json()
        assert isinstance(students_list, list), "Listing students response is not a list"

        # Check that created student is in the list by ID
        found = any(
            (student.get("_id") == created_student_id or student.get("id") == created_student_id)
            for student in students_list
        )
        assert found, "Created student profile not found in students list"

    finally:
        # Cleanup: delete created student profile if possible
        if 'created_student_id' in locals():
            # Assuming delete requires admin role and token, 
            # so trying to login as admin is out of scope, so skip delete if no admin available.
            # If admin credentials were available, handle deletion here.
            pass

test_student_profile_creation_and_listing()