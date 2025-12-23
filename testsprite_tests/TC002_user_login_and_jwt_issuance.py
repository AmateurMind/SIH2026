import requests

BASE_URL = "http://localhost:5000"
LOGIN_ENDPOINT = "/api/auth/login"
TIMEOUT = 30

def test_user_login_and_jwt_issuance():
    headers = {"Content-Type": "application/json"}

    valid_credentials = {
        "email": "testuser@example.com",
        "password": "ValidPass123!"
    }

    invalid_credentials = {
        "email": "testuser@example.com",
        "password": "WrongPassword"
    }

    try:
        # Test valid login
        response_valid = requests.post(
            BASE_URL + LOGIN_ENDPOINT,
            json=valid_credentials,
            headers=headers,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Valid login request failed: {e}"

    assert response_valid.status_code == 200, f"Expected 200 but got {response_valid.status_code} for valid credentials"
    try:
        json_resp = response_valid.json()
    except ValueError:
        assert False, "Response to valid login is not valid JSON"
    assert "token" in json_resp or "jwt" in json_resp, "JWT token not found in response for valid login"

    try:
        # Test invalid login
        response_invalid = requests.post(
            BASE_URL + LOGIN_ENDPOINT,
            json=invalid_credentials,
            headers=headers,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Invalid login request failed: {e}"

    assert response_invalid.status_code == 401, f"Expected 401 but got {response_invalid.status_code} for invalid credentials"

test_user_login_and_jwt_issuance()