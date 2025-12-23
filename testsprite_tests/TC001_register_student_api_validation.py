import requests

BASE_URL = "http://localhost:5000"
REGISTER_ENDPOINT = "/api/auth/register"
TIMEOUT = 30


def test_register_student_api_validation():
    url = BASE_URL + REGISTER_ENDPOINT
    headers = {
        "Content-Type": "application/json"
    }

    # Valid student registration data
    valid_payload = {
        "name": "John Doe",
        "email": "johndoe.test@example.com",
        "password": "StrongPass!123",
        "department": "Computer Science",
        "semester": 5,
        "cgpa": 8.5
    }

    # Send valid registration request
    try:
        response = requests.post(url, json=valid_payload, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to register student failed: {e}"

    # Assert status code 201 for successful registration
    assert response.status_code == 201, f"Expected 201 for valid registration, got {response.status_code}"

    # Invalid registration data (missing required fields and invalid types)
    invalid_payloads = [
        {},  # empty payload
        {"name": "", "email": "invalid", "password": "123", "department": "", "semester": "five", "cgpa": "nine"},
        {"name": "Jane Doe", "email": "invalid-email-format", "password": "pwd", "department": "CS", "semester": 0, "cgpa": -1},
        {"name": "A", "email": "a@b.c", "password": "", "department": "Math", "semester": 3},
        {"email": "missingname@example.com", "password": "pass123", "department": "Physics", "semester": 4, "cgpa": 7.0}
    ]

    for invalid_payload in invalid_payloads:
        try:
            resp = requests.post(url, json=invalid_payload, headers=headers, timeout=TIMEOUT)
        except requests.RequestException as e:
            assert False, f"Request to register student with invalid data failed: {e}"
        assert resp.status_code == 400, (
            f"Expected 400 status for invalid registration data {invalid_payload}, got {resp.status_code}"
        )


test_register_student_api_validation()