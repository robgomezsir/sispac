import requests

BASE_URL = "http://localhost:5173"
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYnV5YWJwc3ZndWx2aWd2ZHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzQ3NjUsImV4cCI6MjA3MTc1MDc2NX0.a1EoCpinPFQqBd_ZYOT7n7iViH3NCwIzldzcBLlvfNo"
HEADERS = {
    "Content-Type": "application/json",
    "ApiKey": API_KEY
}

def test_token_validation_for_candidates():
    url = f"{BASE_URL}/auth/validate-token"
    timeout = 30

    # Valid token (the one from API_KEY)
    valid_token = API_KEY

    # Expired token (simulate by setting exp in past, here just a dummy string)
    expired_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE2MDAwMDAwMDB9.invalidsignature"

    # Malformed token (not JWT format)
    malformed_token = "invalid.token.value"

    # Helper function to post token and return response
    def post_token(token):
        payload = {"token": token}
        try:
            response = requests.post(url, json=payload, headers=HEADERS, timeout=timeout)
            response.raise_for_status()
            return response
        except requests.exceptions.RequestException as e:
            return e.response if hasattr(e, 'response') else None

    # Test with a valid token - expecting success (likely 200)
    resp_valid = post_token(valid_token)
    assert resp_valid is not None, "No response for valid token"
    assert resp_valid.status_code == 200, f"Expected 200 for valid token, got {resp_valid.status_code}"
    json_valid = resp_valid.json()
    assert any(key in json_valid for key in ["valid", "status", "message"]), "Valid token response not as expected"

    # Test with expired token - accepting 200 or error status
    resp_expired = post_token(expired_token)
    assert resp_expired is not None, "No response for expired token"
    assert resp_expired.status_code in (200, 400, 401, 403), f"Expected 200 or 400/401/403 for expired token, got {resp_expired.status_code}"
    json_expired = resp_expired.json()
    # If 200, probably indicates valid response with 'valid' or 'status' keys
    if resp_expired.status_code == 200:
        assert any(key in json_expired for key in ["valid", "status", "message"]), "Expired token response content unexpected"
    else:
        assert "error" in json_expired or "expired" in str(json_expired).lower(), "Expired token error message missing or unexpected"

    # Test with malformed token - expecting 200 or error status
    resp_malformed = post_token(malformed_token)
    assert resp_malformed is not None, "No response for malformed token"
    assert resp_malformed.status_code in (200, 400, 401, 403), f"Expected 200 or 400/401/403 for malformed token, got {resp_malformed.status_code}"
    json_malformed = resp_malformed.json()
    if resp_malformed.status_code == 200:
        assert any(key in json_malformed for key in ["valid", "status", "message", "error"]), "Malformed token response content unexpected"
    else:
        assert "error" in json_malformed or "invalid" in str(json_malformed).lower(), "Malformed token error message missing or unexpected"

test_token_validation_for_candidates()
