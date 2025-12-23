import requests

BASE_URL = "http://localhost:5000"
VERIFY_ENDPOINT = "/api/auth/verify"
LOGIN_ENDPOINT = "/api/auth/login"
TIMEOUT = 30

def test_verify_jwt_token_validity():
    # Step 1: Login to get a valid JWT token
    login_payload = {
        "email": "testuser@example.com",
        "password": "TestPassword123!"
    }
    try:
        login_resp = requests.post(
            f"{BASE_URL}{LOGIN_ENDPOINT}",
            json=login_payload,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Login request failed: {e}"

    assert login_resp.status_code == 200, f"Expected 200 on login, got {login_resp.status_code}"
    login_json = login_resp.json()
    token = login_json.get("token") or login_json.get("access_token")
    assert token, "No JWT token returned on login"

    headers_valid = {"Authorization": f"Bearer {token}"}

    # Step 2: Verify endpoint with valid token should return 200
    try:
        verify_resp_valid = requests.get(
            f"{BASE_URL}{VERIFY_ENDPOINT}",
            headers=headers_valid,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Verify request with valid token failed: {e}"

    assert verify_resp_valid.status_code == 200, f"Expected 200 for valid token, got {verify_resp_valid.status_code}"

    # Step 3: Verify endpoint with invalid token should return 401
    invalid_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.invalid"
    headers_invalid = {"Authorization": f"Bearer {invalid_token}"}

    try:
        verify_resp_invalid = requests.get(
            f"{BASE_URL}{VERIFY_ENDPOINT}",
            headers=headers_invalid,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Verify request with invalid token failed: {e}"

    assert verify_resp_invalid.status_code == 401, f"Expected 401 for invalid token, got {verify_resp_invalid.status_code}"

    # Step 4: Verify endpoint without token should return 401
    try:
        verify_resp_no_token = requests.get(
            f"{BASE_URL}{VERIFY_ENDPOINT}",
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Verify request without token failed: {e}"

    assert verify_resp_no_token.status_code == 401, f"Expected 401 without token, got {verify_resp_no_token.status_code}"

test_verify_jwt_token_validity()
