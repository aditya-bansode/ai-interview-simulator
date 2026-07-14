import pytest
from httpx import AsyncClient

async def get_auth_headers(client: AsyncClient, email: str) -> dict:
    """
    Registers and logs in a test account, returning authorization headers.
    """
    await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "SecurePassword123!", "full_name": "Interviews Pytest"}
    )
    login_res = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "SecurePassword123!"}
    )
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.mark.asyncio
async def test_question_generation(client: AsyncClient):
    """
    Tests question generation endpoint `/interviews/generate`.
    """
    headers = await get_auth_headers(client, "generator.test@gmail.com")
    
    response = await client.post(
        "/api/v1/interviews/generate",
        json={"role": "Software Engineer", "experience_level": "Intermediate"},
        headers=headers
    )
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["role"] == "Software Engineer"
    assert json_data["experience_level"] == "Intermediate"
    assert len(json_data["questions"]) == 10
    assert "text" in json_data["questions"][0]

@pytest.mark.asyncio
async def test_answer_evaluation(client: AsyncClient):
    """
    Tests evaluation pipeline `/interviews/evaluate` using fallbacks or client mocks.
    """
    headers = await get_auth_headers(client, "evaluation.test@gmail.com")
    
    payload = {
        "role": "Python Developer",
        "experience_level": "Intermediate",
        "question": "What is the difference between list and tuple in Python?",
        "answer": "Lists are mutable and declared with square brackets. Tuples are immutable and declared with parentheses."
    }
    
    response = await client.post(
        "/api/v1/interviews/evaluate",
        json=payload,
        headers=headers
    )
    assert response.status_code == 200
    json_data = response.json()
    assert "technical_score" in json_data
    assert "communication_score" in json_data
    assert "suggestions" in json_data
    assert "correct_answer" in json_data

@pytest.mark.asyncio
async def test_adaptive_progression(client: AsyncClient):
    """
    Tests difficulty calibration `/interviews/next` escalates and de-escalates correctly.
    """
    headers = await get_auth_headers(client, "adaptive.test@gmail.com")
    
    # 1. Test escalation (score >= 80)
    payload_up = {
        "role": "Software Engineer",
        "current_level": "Intermediate",
        "last_score": 85,
        "answered_questions": ["What is a list?"]
    }
    response_up = await client.post("/api/v1/interviews/next", json=payload_up, headers=headers)
    assert response_up.status_code == 200
    assert response_up.json()["new_level"] == "Expert"
    
    # 2. Test de-escalation (score <= 60)
    payload_down = {
        "role": "Software Engineer",
        "current_level": "Intermediate",
        "last_score": 50,
        "answered_questions": ["What is a list?"]
    }
    response_down = await client.post("/api/v1/interviews/next", json=payload_down, headers=headers)
    assert response_down.status_code == 200
    assert response_down.json()["new_level"] == "Beginner"

@pytest.mark.asyncio
async def test_pdf_report_generation(client: AsyncClient):
    """
    Tests PDF compilation and streaming endpoint `/interviews/report`.
    """
    headers = await get_auth_headers(client, "report.test@gmail.com")
    
    payload = {
        "role": "Python Developer",
        "experience_level": "Intermediate",
        "resume_summary": "Python backend engineer.",
        "eye_contact_rate": 85,
        "face_presence_rate": 95,
        "head_movements": 4,
        "dominant_emotion": "neutral",
        "qa_history": [
            {
                "question": "What is mutability?",
                "answer": "It means the object state can be modified after creation.",
                "technical_score": 88,
                "communication_score": 82,
                "grammar_score": 90,
                "confidence_score": 85,
                "suggestions": ["Include memory allocation details."],
                "correct_answer": "Mutability allows altering state in-place."
            }
        ]
    }
    
    response = await client.post(
        "/api/v1/interviews/report",
        json=payload,
        headers=headers
    )
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert len(response.content) > 0
