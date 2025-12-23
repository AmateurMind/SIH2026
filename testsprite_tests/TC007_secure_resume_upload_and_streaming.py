import requests
import io

BASE_URL = "http://localhost:5000"
TIMEOUT = 30

# Sample credentials for student user to authenticate
STUDENT_CREDENTIALS = {
    "email": "student1@example.com",
    "password": "strongpassword123"
}


def test_secure_resume_upload_and_streaming():
    # Authenticate user to get JWT token
    login_url = f"{BASE_URL}/api/auth/login"
    try:
        login_resp = requests.post(login_url, json=STUDENT_CREDENTIALS, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise AssertionError(f"Login request failed: {e}")
    assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"

    token = login_resp.json().get("token") or login_resp.json().get("accessToken")
    assert token is not None, "No token received after login"

    headers = {"Authorization": f"Bearer {token}"}

    # 1) Upload Resume (POST /api/resume)
    upload_url = f"{BASE_URL}/api/resume"

    # Prepare a small PDF file content in memory for upload
    pdf_bytes = (
        b"%PDF-1.4\n"
        b"1 0 obj\n"
        b"<<\n"
        b"/Type /Catalog\n"
        b"/Pages 2 0 R\n"
        b">>\n"
        b"endobj\n"
        b"2 0 obj\n"
        b"<<\n"
        b"/Type /Pages\n"
        b"/Count 1\n"
        b"/Kids [3 0 R]\n"
        b">>\n"
        b"endobj\n"
        b"3 0 obj\n"
        b"<<\n"
        b"/Type /Page\n"
        b"/Parent 2 0 R\n"
        b"/MediaBox [0 0 612 792]\n"
        b"/Contents 4 0 R\n"
        b"/Resources <<>>\n"
        b">>\n"
        b"endobj\n"
        b"4 0 obj\n"
        b"<< /Length 44 >>\n"
        b"stream\n"
        b"BT\n"
        b"/F1 24 Tf\n"
        b"100 700 Td\n"
        b"(Hello Resume) Tj\n"
        b"ET\n"
        b"endstream\n"
        b"endobj\n"
        b"xref\n"
        b"0 5\n"
        b"0000000000 65535 f \n"
        b"0000000010 00000 n \n"
        b"0000000060 00000 n \n"
        b"0000000117 00000 n \n"
        b"0000000211 00000 n \n"
        b"trailer\n"
        b"<<\n"
        b"/Root 1 0 R\n"
        b"/Size 5\n"
        b">>\n"
        b"startxref\n"
        b"298\n"
        b"%%EOF\n"
    )
    files = {
        "resume": ("resume.pdf", io.BytesIO(pdf_bytes), "application/pdf")
    }

    try:
        upload_resp = requests.post(upload_url, headers=headers, files=files, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise AssertionError(f"Resume upload request failed: {e}")

    assert upload_resp.status_code == 201, f"Resume upload failed: {upload_resp.status_code}, {upload_resp.text}"

    # 2) Get Authenticated User Profile to obtain studentId
    profile_url = f"{BASE_URL}/api/auth/profile"
    try:
        profile_resp = requests.get(profile_url, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        raise AssertionError(f"Fetching profile failed: {e}")

    assert profile_resp.status_code == 200, f"Fetching profile failed: {profile_resp.text}"
    profile_data = profile_resp.json()
    student_id = profile_data.get("id") or profile_data.get("_id")
    assert student_id is not None, "Student ID not found in profile response"

    # 3) Stream Resume (GET /api/resumes/{studentId})
    resume_url = f"{BASE_URL}/api/resumes/{student_id}"
    try:
        stream_resp = requests.get(resume_url, headers=headers, timeout=TIMEOUT, stream=True)
    except requests.RequestException as e:
        raise AssertionError(f"Streaming resume request failed: {e}")

    # Access control validation: response should be 200 (success) or 403 (forbidden)
    assert stream_resp.status_code in (200, 403), (
        f"Unexpected status code for resume streaming: {stream_resp.status_code}, {stream_resp.text}"
    )

    if stream_resp.status_code == 200:
        # Validate content-type is PDF
        content_type = stream_resp.headers.get("Content-Type", "")
        assert "pdf" in content_type.lower(), f"Expected PDF content-type but got: {content_type}"
        # Optionally verify some bytes present in stream content
        content_start = stream_resp.raw.read(4)
        assert content_start == b"%PDF", "Streamed content does not start with PDF header"


test_secure_resume_upload_and_streaming()
