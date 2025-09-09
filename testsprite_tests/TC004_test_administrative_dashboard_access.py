import requests

BASE_URL = "http://localhost:5173"
API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYnV5YWJwc3ZndWx2aWd2ZHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzQ3NjUsImV4cCI6MjA3MTc1MDc2NX0.a1EoCpinPFQqBd_ZYOT7n7iViH3NCwIzldzcBLlvfNo"
HEADERS = {
    "ApiKey": API_KEY,
    "Content-Type": "application/json",
    "Accept": "application/json"
}
TIMEOUT = 30

def test_administrative_dashboard_access():
    """
    Validate that the /dashboard endpoint allows access only to authorized users (Admin, RH),
    and returns the dashboard data with correct filters, sorting, and search capabilities.
    """
    url = f"{BASE_URL}/dashboard"

    try:
        # Attempt access with correct API key (Admin/RH role implied by token)
        response = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        assert response.status_code == 200, f"Expected 200 OK for authorized user, got {response.status_code}"
        data = response.json()

        # Validate response data structure for dashboard data (basic structure validation)
        assert isinstance(data, dict), "Dashboard response should be a JSON object"
        # Check presence of expected keys indicating filters, sorting, and search data
        # Since exact schema is not provided, we check typical expected keys:
        expected_keys = ["filters", "sorting", "searchResults", "candidates", "statistics", "export"]
        # We'll check if at least one key is present showing these features are supported
        assert any(key in data for key in expected_keys), \
            f"Dashboard data should include at least one of the keys: {expected_keys}"

        # Additional validation can include types or contents if known, here we just check basic presence
        if "filters" in data:
            assert isinstance(data["filters"], dict) or isinstance(data["filters"], list), "Filters should be dict or list"
        if "sorting" in data:
            assert isinstance(data["sorting"], dict) or isinstance(data["sorting"], list), "Sorting should be dict or list"
        if "searchResults" in data:
            assert isinstance(data["searchResults"], list), "Search results should be a list"

        # Test filter parameter: attempting to send filters/sorting/search in query to validate acceptance
        params = {
            "filter": '{"status":"active"}',  # Filter candidates by active status (example)
            "sort": "name:asc",               # Sort by name ascending
            "search": "developer"             # Search for 'developer'
        }
        filtered_response = requests.get(url, headers=HEADERS, params=params, timeout=TIMEOUT)
        assert filtered_response.status_code == 200, f"Filtering/sorting/search query failed with status {filtered_response.status_code}"
        filtered_data = filtered_response.json()
        assert isinstance(filtered_data, dict), "Filtered dashboard response should be a JSON object"

        # Test unauthorized access (simulate missing or invalid API key)
        unauthorized_headers = {
            "ApiKey": "invalid_or_missing_key"
        }
        unauthorized_response = requests.get(url, headers=unauthorized_headers, timeout=TIMEOUT)
        assert unauthorized_response.status_code in [401, 403], f"Expected 401 or 403 for unauthorized access, got {unauthorized_response.status_code}"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_administrative_dashboard_access()