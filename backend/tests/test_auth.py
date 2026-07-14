import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_auth_flow(client: AsyncClient):
    """
    Integrative test validating the complete JWT Authentication workflow:
    Register -> Login (Success/Fail) -> Refresh Session -> Logout.
    """
    test_email = "pytest.candidate@gmail.com"
    test_password = "SecurePassword123!"

    # 1. Register candidate
    reg_response = await client.post(
        "/api/v1/auth/register",
        json={"email": test_email, "password": test_password, "full_name": "Pytest Candidate"}
    )
    assert reg_response.status_code == 201
    reg_json = reg_response.json()
    assert reg_json["email"] == test_email
    assert "id" in reg_json

    # 2. Login with incorrect credentials
    bad_login_response = await client.post(
        "/api/v1/auth/login",
        json={"email": test_email, "password": "WrongPassword!"}
    )
    assert bad_login_response.status_code == 401
    assert "detail" in bad_login_response.json()

    # 3. Login with correct credentials
    login_response = await client.post(
        "/api/v1/auth/login",
        json={"email": test_email, "password": test_password}
    )
    assert login_response.status_code == 200
    login_json = login_response.json()
    assert "access_token" in login_json
    assert "refresh_token" in login_json
    
    access_token = login_json["access_token"]
    refresh_token = login_json["refresh_token"]

    # 4. Refresh token rotation
    refresh_response = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token}
    )
    assert refresh_response.status_code == 200
    refresh_json = refresh_response.json()
    assert "access_token" in refresh_json
    assert "refresh_token" in refresh_json
    
    new_refresh_token = refresh_json["refresh_token"]

    # 5. Logout candidate
    logout_response = await client.post(
        "/api/v1/auth/logout",
        json={"refresh_token": new_refresh_token}
    )
    assert logout_response.status_code == 200
    assert logout_response.json()["status"] == "success"

    # 6. Verify rotated/revoked refresh token is unusable
    dead_refresh_response = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": new_refresh_token}
    )
    assert dead_refresh_response.status_code == 401
