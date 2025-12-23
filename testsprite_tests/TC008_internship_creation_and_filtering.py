import requests

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

# Replace with valid admin/recruiter credentials to obtain JWT token
ADMIN_RECRUITER_AUTH = {
    "email": "admin@example.com",
    "password": "adminpassword"
}


def test_internship_creation_and_filtering():
    # Authenticate as admin/recruiter to get JWT token
    login_url = f"{BASE_URL}/api/auth/login"
    login_payload = {
        "email": ADMIN_RECRUITER_AUTH["email"],
        "password": ADMIN_RECRUITER_AUTH["password"]
    }

    try:
        login_resp = requests.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
        token = login_resp.json().get("token") or login_resp.json().get("accessToken")
        assert token, "JWT token not found in login response"

        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }

        # Create a new internship (POST /api/internships)
        create_url = f"{BASE_URL}/api/internships"
        internship_data = {
            "title": "Test Internship for Automation",
            "description": "This internship is created during test execution.",
            "department": "Computer Science",
            "skills": ["Python", "REST APIs"],
            "location": "Remote",
            "duration": "3 months",
            "stipend": "1000 USD",
            "applyBy": "2026-01-31"
        }
        post_resp = requests.post(create_url, json=internship_data, headers=headers, timeout=TIMEOUT)
        assert post_resp.status_code == 201, f"Internship creation failed with status {post_resp.status_code}"
        created_internship = post_resp.json()
        internship_id = created_internship.get("id") or created_internship.get("_id")
        assert internship_id, "Created internship ID missing"

        # GET internships with query filters (e.g., department and skills)
        get_url = f"{BASE_URL}/api/internships"
        params = {
            "department": "Computer Science",
            "skills": "Python"
        }
        get_resp = requests.get(get_url, headers=headers, params=params, timeout=TIMEOUT)
        assert get_resp.status_code == 200, f"Internship listing failed with status {get_resp.status_code}"
        internships_list = get_resp.json()
        assert isinstance(internships_list, list), "Expected a list of internships in response"
        # At least one internship should match the filter (the one we created)
        matched = any(
            (internship.get("id") == internship_id or internship.get("_id") == internship_id)
            for internship in internships_list
        )
        assert matched, "Created internship not found in filtered internship listing"

    finally:
        # Clean up: delete the created internship
        if 'internship_id' in locals() and 'headers' in locals():
            delete_url = f"{BASE_URL}/api/internships/{internship_id}"
            requests.delete(delete_url, headers=headers, timeout=TIMEOUT)


test_internship_creation_and_filtering()
