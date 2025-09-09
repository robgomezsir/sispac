import requests
import uuid

BASE_URL = "http://localhost:5173"
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYnV5YWJwc3ZndWx2aWd2ZHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzQ3NjUsImV4cCI6MjA3MTc1MDc2NX0.a1EoCpinPFQqBd_ZYOT7n7iViH3NCwIzldzcBLlvfNo"
HEADERS = {
    "Content-Type": "application/json",
    "ApiKey": API_KEY
}
TIMEOUT = 30


def test_candidate_listing_and_addition():
    # List candidates with GET /api/candidates
    try:
        response = requests.get(f"{BASE_URL}/api/candidates", headers=HEADERS, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200 OK, got {response.status_code}"
        candidates_list = response.json()
        # Adjust in case response is wrapped in an object
        if not isinstance(candidates_list, list):
            if isinstance(candidates_list, dict):
                if "candidates" in candidates_list and isinstance(candidates_list["candidates"], list):
                    candidates_list = candidates_list["candidates"]
                elif "data" in candidates_list and isinstance(candidates_list["data"], list):
                    candidates_list = candidates_list["data"]
                else:
                    assert False, "Candidates list should be a list"
            else:
                assert False, "Candidates list should be a list"
        assert isinstance(candidates_list, list), "Candidates list should be a list"
    except Exception as e:
        raise AssertionError(f"GET /api/candidates failed: {e}")

    # Prepare candidate data for POST /api/candidates (create new candidate)
    unique_suffix = str(uuid.uuid4())
    new_candidate = {
        "name": f"Test Candidate {unique_suffix}",
        "email": f"test_candidate_{unique_suffix}@example.com"
    }

    candidate_id = None
    try:
        # Add new candidate
        post_response = requests.post(f"{BASE_URL}/api/candidates", headers=HEADERS, json=new_candidate, timeout=TIMEOUT)
        assert post_response.status_code == 201 or post_response.status_code == 200, f"Expected 200 or 201, got {post_response.status_code}"
        post_json = post_response.json()

        # Normalize candidate data in response (unwrap if nested)
        candidate_data = None
        if isinstance(post_json, dict):
            if "name" in post_json and "email" in post_json:
                candidate_data = post_json
            else:
                for key in ["candidate", "data", "result"]:
                    if key in post_json and isinstance(post_json[key], dict):
                        candidate_data = post_json[key]
                        break
        assert candidate_data is not None, "Candidate data not found in response"

        # Validate candidate data fields
        assert candidate_data.get("name") == new_candidate["name"], "Name in response does not match request"
        assert candidate_data.get("email") == new_candidate["email"], "Email in response does not match request"

        candidate_id = candidate_data.get("id") or candidate_data.get("_id")
        assert candidate_id is not None, "Created candidate ID not returned"

        # Verify candidate appears in listing after addition
        get_after_post = requests.get(f"{BASE_URL}/api/candidates", headers=HEADERS, timeout=TIMEOUT)
        assert get_after_post.status_code == 200, f"Expected 200 OK, got {get_after_post.status_code}"
        candidates_after_add = get_after_post.json()
        if not isinstance(candidates_after_add, list):
            if isinstance(candidates_after_add, dict):
                if "candidates" in candidates_after_add and isinstance(candidates_after_add["candidates"], list):
                    candidates_after_add = candidates_after_add["candidates"]
                elif "data" in candidates_after_add and isinstance(candidates_after_add["data"], list):
                    candidates_after_add = candidates_after_add["data"]
                else:
                    assert False, "Candidates list should be a list"
            else:
                assert False, "Candidates list should be a list"
        assert any(
            c.get("id") == candidate_id or c.get("_id") == candidate_id or
            (c.get("email") == new_candidate["email"] and c.get("name") == new_candidate["name"])
            for c in candidates_after_add
        ), "New candidate not found in candidates list after addition"

        # Test validation error handling by sending invalid data (missing name)
        invalid_candidate = {"email": "invalid@example.com"}
        invalid_response = requests.post(f"{BASE_URL}/api/candidates", headers=HEADERS, json=invalid_candidate, timeout=TIMEOUT)
        # Expecting 4xx error
        assert 400 <= invalid_response.status_code < 500, f"Expected client error status for invalid input, got {invalid_response.status_code}"

    finally:
        # Cleanup: delete the created candidate if it exists
        if candidate_id:
            try:
                del_response = requests.delete(f"{BASE_URL}/api/candidate/{candidate_id}", headers=HEADERS, timeout=TIMEOUT)
                # Some APIs return 204 No Content or 200 OK on delete
                assert del_response.status_code in (200, 204), f"Failed to delete candidate with id {candidate_id}, status {del_response.status_code}"
            except Exception as e:
                raise AssertionError(f"Failed cleanup delete candidate {candidate_id}: {e}")


test_candidate_listing_and_addition()
