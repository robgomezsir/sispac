import requests

BASE_URL = "http://localhost:5173"
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYnV5YWJwc3ZndWx2aWd2ZHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzQ3NjUsImV4cCI6MjA3MTc1MDc2NX0.a1EoCpinPFQqBd_ZYOT7n7iViH3NCwIzldzcBLlvfNo"
HEADERS = {
    "ApiKey": API_KEY,
    "Content-Type": "application/json"
}
TIMEOUT = 30


def test_candidate_retrieval_and_deletion_by_id():
    candidate_url = f"{BASE_URL}/api/candidates"
    # Payload to create candidate
    candidate_payload = {
        "name": "Test Candidate TC006",
        "email": "tc006_candidate@example.com"
    }

    candidate_id = None
    try:
        # Create a new candidate
        response = requests.post(candidate_url, json=candidate_payload, headers=HEADERS, timeout=TIMEOUT)
        assert response.status_code == 201 or response.status_code == 200, f"Failed to create candidate, status code {response.status_code}"
        candidate_data = response.json()
        candidate_id = candidate_data.get("id") or candidate_data.get("ID") or candidate_data.get("Id")
        assert candidate_id is not None, "Created candidate ID not returned."

        # GET candidate by ID (valid)
        get_url = f"{BASE_URL}/api/candidate/{candidate_id}"
        get_resp = requests.get(get_url, headers=HEADERS, timeout=TIMEOUT)
        assert get_resp.status_code == 200, f"GET candidate by ID failed, status code {get_resp.status_code}"
        get_data = get_resp.json()
        assert get_data.get("name") == candidate_payload["name"], "Candidate name mismatch."
        assert get_data.get("email") == candidate_payload["email"], "Candidate email mismatch."

        # DELETE candidate by ID (valid)
        del_resp = requests.delete(get_url, headers=HEADERS, timeout=TIMEOUT)
        assert del_resp.status_code in (200, 204), f"Failed to delete candidate, status code {del_resp.status_code}"

        # Verify candidate deletion: GET should return 404 or similar
        get_after_del_resp = requests.get(get_url, headers=HEADERS, timeout=TIMEOUT)
        assert get_after_del_resp.status_code in (404, 400), f"Deleted candidate still accessible, status code {get_after_del_resp.status_code}"

        # DELETE candidate with invalid ID
        invalid_id = "invalid-id-123456"
        invalid_del_resp = requests.delete(f"{BASE_URL}/api/candidate/{invalid_id}", headers=HEADERS, timeout=TIMEOUT)
        # Expecting graceful handling: 404 Not Found or 400 Bad Request
        assert invalid_del_resp.status_code in (400, 404), f"Invalid ID delete did not return expected error, status code {invalid_del_resp.status_code}"

        # GET candidate with invalid ID
        invalid_get_resp = requests.get(f"{BASE_URL}/api/candidate/{invalid_id}", headers=HEADERS, timeout=TIMEOUT)
        # Expecting 404 Not Found or 400 Bad Request as well
        assert invalid_get_resp.status_code in (400, 404), f"Invalid ID get did not return expected error, status code {invalid_get_resp.status_code}"

    finally:
        if candidate_id:
            # Best effort to delete candidate in case test failed before deletion
            try:
                requests.delete(f"{BASE_URL}/api/candidate/{candidate_id}", headers=HEADERS, timeout=TIMEOUT)
            except Exception:
                pass


test_candidate_retrieval_and_deletion_by_id()