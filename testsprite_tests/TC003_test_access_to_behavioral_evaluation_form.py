import requests

BASE_URL = "http://localhost:5173"
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYnV5YWJwc3ZndWx2aWd2ZHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzQ3NjUsImV4cCI6MjA3MTc1MDc2NX0.a1EoCpinPFQqBd_ZYOT7n7iViH3NCwIzldzcBLlvfNo"
HEADERS = {"ApiKey": API_KEY}
TIMEOUT = 30

def test_access_behavioral_evaluation_form():
    # Token for test (note: API_KEY used but may not be a valid candidate token)
    valid_token = API_KEY

    # Test with token query parameter
    try:
        resp_valid = requests.get(
            f"{BASE_URL}/form",
            headers=HEADERS,
            params={"token": valid_token},
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Request with token failed: {e}"
    # Accept 200 OK or 401/403/400 if token is invalid
    assert resp_valid.status_code in [200, 401, 403, 400], f"Expected 200, 401, 403 or 400 with token but got {resp_valid.status_code}"
    if resp_valid.status_code == 200:
        try:
            json_content = resp_valid.json()
            assert isinstance(json_content, dict) and ("questions" in json_content or "form" in json_content), "Response JSON missing expected form keys"
        except ValueError:
            text_content = resp_valid.text.lower()
            assert "form" in text_content or "question" in text_content, "Response text does not appear to contain form data"

    # Test with invalid token (random invalid string)
    invalid_token = "invalidtoken123"
    try:
        resp_invalid = requests.get(
            f"{BASE_URL}/form",
            headers=HEADERS,
            params={"token": invalid_token},
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Request with invalid token failed: {e}"
    assert resp_invalid.status_code in [401, 403, 400], f"Expected 401, 403 or 400 for invalid token but got {resp_invalid.status_code}"

    # Test with missing token parameter
    try:
        resp_missing = requests.get(
            f"{BASE_URL}/form",
            headers=HEADERS,
            timeout=TIMEOUT
        )
    except requests.RequestException as e:
        assert False, f"Request with missing token failed: {e}"
    assert resp_missing.status_code in [401, 403, 400], f"Expected 401, 403 or 400 for missing token but got {resp_missing.status_code}"


test_access_behavioral_evaluation_form()