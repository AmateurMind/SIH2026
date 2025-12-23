import requests

BASE_URL = "http://localhost:5000"
PROFILE_ENDPOINT = "/api/auth/profile"
LOGIN_ENDPOINT = "/api/auth/login"

TEST_USER = {
    "email": "testuser@example.com",
    "password": "TestPass123!"
}

def test_fetch_authenticated_user_profile():
    # Step 1: Attempt to fetch profile without token - expect 401 Unauthorized
    try:
        resp = requests.get(BASE_URL + PROFILE_ENDPOINT, timeout=30)
        assert resp.status_code == 401, f"Expected 401 Unauthorized, got {resp.status_code}"
    except requests.RequestException as e:
        assert False, f"Request failed unexpectedly: {e}"

    # Step 2: Authenticate user to obtain JWT token
    try:
        login_resp = requests.post(
            BASE_URL + LOGIN_ENDPOINT,
            json={"email": TEST_USER["email"], "password": TEST_USER["password"]},
            timeout=30
        )
    except requests.RequestException as e:
        assert False, f"Login request failed unexpectedly: {e}"

    assert login_resp.status_code == 200, f"Login failed with status {login_resp.status_code}"
    login_data = login_resp.json()
    token = login_data.get("token") or login_data.get("accessToken") or login_data.get("jwt")
    assert token, "JWT token not found in login response"

    headers = {"Authorization": f"Bearer {token}"}

    # Step 3: Fetch authenticated user's profile with valid token - expect 200 and profile data
    try:
        profile_resp = requests.get(BASE_URL + PROFILE_ENDPOINT, headers=headers, timeout=30)
    except requests.RequestException as e:
        assert False, f"Profile request failed unexpectedly: {e}"

    assert profile_resp.status_code == 200, f"Expected 200 OK, got {profile_resp.status_code}"
    profile_data = profile_resp.json()
    # Validate presence of expected profile fields (example: email field matching login)
    assert isinstance(profile_data, dict), "Profile response is not a JSON object"
    assert "email" in profile_data, "Profile data missing 'email' field"
    assert profile_data["email"].lower() == TEST_USER["email"].lower(), "Profile email does not match logged in user"

test_fetch_authenticated_user_profile()