import requests

BASE_URL = "http://localhost:5173"
LOGIN_ENDPOINT = "/auth/login"
API_KEY_HEADER = {
    "ApiKey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppYnV5YWJwc3ZndWx2aWd2ZHRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNzQ3NjUsImV4cCI6MjA3MTc1MDc2NX0.a1EoCpinPFQqBd_ZYOT7n7iViH3NCwIzldzcBLlvfNo"
}

TIMEOUT = 30


def test_user_login_functionality():
    headers = {
        "Content-Type": "application/json",
        **API_KEY_HEADER
    }

    valid_email = "testuser@example.com"
    valid_password = "ValidPass123!"

    invalid_email = "invaliduser@example.com"
    invalid_password = "WrongPass"

    # 1. Test login with valid credentials
    response_valid = requests.post(
        BASE_URL + LOGIN_ENDPOINT,
        json={"email": valid_email, "password": valid_password},
        headers=headers,
        timeout=TIMEOUT,
    )
    # Expect success 200 and token or user data in response
    assert response_valid.status_code == 200, f"Expected 200 but got {response_valid.status_code}"
    json_data = response_valid.json()
    assert "token" in json_data or "access_token" in json_data or "user" in json_data, "Response should include token or user data"

    # 2. Test login with invalid email and valid password
    response_invalid_email = requests.post(
        BASE_URL + LOGIN_ENDPOINT,
        json={"email": invalid_email, "password": valid_password},
        headers=headers,
        timeout=TIMEOUT,
    )
    # Expect 401 Unauthorized or 400 Bad Request with error message
    assert response_invalid_email.status_code in (400, 401), f"Expected 400 or 401 but got {response_invalid_email.status_code}"
    json_error = response_invalid_email.json()
    assert "error" in json_error or "message" in json_error, "Error response should include 'error' or 'message'"

    # 3. Test login with valid email and invalid password
    response_invalid_password = requests.post(
        BASE_URL + LOGIN_ENDPOINT,
        json={"email": valid_email, "password": invalid_password},
        headers=headers,
        timeout=TIMEOUT,
    )
    # Expect 401 Unauthorized or 400 Bad Request with error message
    assert response_invalid_password.status_code in (400, 401), f"Expected 400 or 401 but got {response_invalid_password.status_code}"
    json_error = response_invalid_password.json()
    assert "error" in json_error or "message" in json_error, "Error response should include 'error' or 'message'"

    # 4. Test login with missing email
    response_missing_email = requests.post(
        BASE_URL + LOGIN_ENDPOINT,
        json={"password": valid_password},
        headers=headers,
        timeout=TIMEOUT,
    )
    assert response_missing_email.status_code in (400, 422), f"Expected 400 or 422 but got {response_missing_email.status_code}"

    # 5. Test login with missing password
    response_missing_password = requests.post(
        BASE_URL + LOGIN_ENDPOINT,
        json={"email": valid_email},
        headers=headers,
        timeout=TIMEOUT,
    )
    assert response_missing_password.status_code in (400, 422), f"Expected 400 or 422 but got {response_missing_password.status_code}"


test_user_login_functionality()