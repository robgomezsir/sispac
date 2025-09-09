import requests
import uuid

BASE_URL = "http://localhost:5173"
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYnV5YWJwc3ZndWx2aWd2ZHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzQ3NjUsImV4cCI6MjA3MTc1MDc2NX0.a1EoCpinPFQqBd_ZYOT7n7iViH3NCwIzldzcBLlvfNo"
HEADERS = {
    "Content-Type": "application/json",
    "ApiKey": API_KEY
}
TIMEOUT = 30


def test_gupy_webhook_candidate_synchronization():
    # Prepare candidate data similar to Gupy webhook payload
    unique_email = f"test_{uuid.uuid4()}@example.com"
    candidate_data = {
        "id": str(uuid.uuid4()),
        "name": "Test Candidate",
        "email": unique_email,
        "application_date": "2025-09-08T12:00:00Z",
        "position": "Software Engineer",
        "status": "applied",
        "additional_info": {
            "linkedin": "https://linkedin.com/in/testcandidate",
            "phone": "+5511999999999"
        }
    }

    created_candidate_id = None

    try:
        # POST data to /api/gupy-webhook endpoint
        response = requests.post(
            f"{BASE_URL}/api/gupy-webhook",
            json=candidate_data,
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert response.status_code in (200, 201), f"Expected status 200 or 201, got {response.status_code}"

        resp_json = response.json()
        # Expected fields: confirmation of synchronization, generated token, and candidate info

        assert isinstance(resp_json, dict), "Response is not a JSON object"
        assert "token" in resp_json, "Response JSON missing 'token' field"
        assert isinstance(resp_json["token"], str) and len(resp_json["token"]) > 0, "'token' is empty or not a string"
        assert "candidate" in resp_json, "Response JSON missing 'candidate' field"
        candidate = resp_json["candidate"]
        assert candidate.get("email") == unique_email, "Synchronized candidate email does not match posted data"
        # Optionally confirm other fields if present
        assert "id" in candidate, "Candidate data missing 'id' field"
        created_candidate_id = candidate["id"]

        # Validate token received by calling /auth/validate-token endpoint
        validate_response = requests.post(
            f"{BASE_URL}/auth/validate-token",
            json={"token": resp_json["token"]},
            headers=HEADERS,
            timeout=TIMEOUT
        )
        assert validate_response.status_code == 200, f"Token validation failed with status {validate_response.status_code}"
        validate_json = validate_response.json()
        assert validate_json.get("valid") is True, "Token is not valid according to validation endpoint"

    finally:
        # Cleanup: delete candidate created by webhook if ID available
        if created_candidate_id:
            try:
                delete_response = requests.delete(
                    f"{BASE_URL}/api/candidate/{created_candidate_id}",
                    headers=HEADERS,
                    timeout=TIMEOUT
                )
                # Accept 200 or 204 as successful deletion
                assert delete_response.status_code in (200, 204), f"Failed to delete candidate, status {delete_response.status_code}"
            except Exception:
                pass


test_gupy_webhook_candidate_synchronization()
