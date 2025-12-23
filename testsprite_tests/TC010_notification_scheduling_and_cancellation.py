import requests

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

# Replace these with valid credentials for authentication before running the test
AUTH_EMAIL = "testuser@example.com"
AUTH_PASSWORD = "TestPassword123!"

def get_auth_token():
    try:
        resp = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": AUTH_EMAIL, "password": AUTH_PASSWORD},
            timeout=TIMEOUT
        )
        resp.raise_for_status()
        token = resp.json().get("token")
        assert token, "Authentication token not received; check credentials or login endpoint."
        return token
    except requests.RequestException as e:
        assert False, f"Authentication failed; skipping tests requiring authorization. Details: {e}"

def test_notification_scheduling_and_cancellation():
    token = get_auth_token()
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

    scheduled_notification_id = None

    try:
        # 1. Schedule a notification with POST /api/notifications, expect 201
        schedule_payload = {
            "title": "Test Notification",
            "message": "This is a test notification scheduled by automated test.",
            "scheduleTime": "2099-12-31T23:59:00Z"  # future time ISO 8601 string
        }
        resp_post = requests.post(
            f"{BASE_URL}/api/notifications",
            json=schedule_payload,
            headers=headers,
            timeout=TIMEOUT
        )
        assert resp_post.status_code == 201, f"Expected 201 on scheduling, got {resp_post.status_code}"
        resp_data = resp_post.json()
        assert "id" in resp_data, "Scheduled notification response missing 'id'"
        scheduled_notification_id = resp_data["id"]

        # 2. List scheduled notifications with GET /api/notifications, expect 200 and list contains new notification
        resp_get = requests.get(
            f"{BASE_URL}/api/notifications",
            headers=headers,
            timeout=TIMEOUT
        )
        assert resp_get.status_code == 200, f"Expected 200 on listing, got {resp_get.status_code}"
        notifications = resp_get.json()
        assert isinstance(notifications, list), "Expected list of notifications"
        assert any(n.get("id") == scheduled_notification_id for n in notifications), \
            "Scheduled notification id not found in list"

        # 3. Cancel the notification with POST /api/notifications/{id}/cancel, expect 200
        resp_cancel = requests.post(
            f"{BASE_URL}/api/notifications/{scheduled_notification_id}/cancel",
            headers=headers,
            timeout=TIMEOUT
        )
        assert resp_cancel.status_code == 200, f"Expected 200 on cancellation, got {resp_cancel.status_code}"

        # 4. Cancel again to test 404 response for already cancelled or missing notification
        resp_cancel_404 = requests.post(
            f"{BASE_URL}/api/notifications/{scheduled_notification_id}/cancel",
            headers=headers,
            timeout=TIMEOUT
        )
        assert resp_cancel_404.status_code in (200, 404), \
            f"Expected 200 or 404 on cancelling non-existent, got {resp_cancel_404.status_code}"

    finally:
        # Cleanup: Attempt to cancel notification if still exists to avoid side effects
        if scheduled_notification_id:
            try:
                requests.post(
                    f"{BASE_URL}/api/notifications/{scheduled_notification_id}/cancel",
                    headers=headers,
                    timeout=TIMEOUT
                )
            except Exception:
                pass

test_notification_scheduling_and_cancellation()
