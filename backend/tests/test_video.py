import pytest
from httpx import AsyncClient

# Base64 string of a tiny 1x1 blank JPEG image
TINY_JPEG_BASE64 = (
    "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP////////////////////////"
    "//////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QA"
    "FPABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="
)

@pytest.mark.asyncio
async def test_analyze_video_frame(client: AsyncClient):
    """
    Tests the video proctoring and emotion analysis endpoint `/interviews/analyze-frame`.
    """
    # 1. Setup authenticated headers
    await client.post(
        "/api/v1/auth/register",
        json={"email": "video.pytest@gmail.com", "password": "SecurePassword123!", "full_name": "Video Tester"}
    )
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": "video.pytest@gmail.com", "password": "SecurePassword123!"}
    )
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. POST image frame payload
    payload = {
        "image_base64": TINY_JPEG_BASE64,
        "last_x": 100,
        "last_y": 100
    }
    
    response = await client.post(
        "/api/v1/interviews/analyze-frame",
        json=payload,
        headers=headers
    )
    
    assert response.status_code == 200
    json_data = response.json()
    
    # 3. Assert schema properties exist
    assert "face_detected" in json_data
    assert "eye_contact" in json_data
    assert "looking_away" in json_data
    assert "head_movement_detected" in json_data
    assert "dominant_emotion" in json_data
    assert "emotion_happy" in json_data
    assert "emotion_neutral" in json_data
