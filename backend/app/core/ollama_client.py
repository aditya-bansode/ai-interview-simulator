import json
import logging
import httpx
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

# Heuristic Fallback Generator for when Ollama is unreachable
def generate_heuristic_evaluation(
    role: str, 
    level: str, 
    question: str, 
    answer: str
) -> Dict[str, Any]:
    """
    Simulates a detailed, multi-dimensional evaluation response using local rules when Ollama is offline.
    """
    answer_len = len(answer.strip())
    
    # Calculate a baseline tech score
    tech_score = 65
    keywords = ["optimization", "index", "cache", "scale", "redis", "postgres", "lock", "thread", "load", "design", "async"]
    matches = sum(1 for kw in keywords if kw in answer.lower())
    tech_score += min(30, matches * 5)
    
    # Heuristics for communication, grammar, confidence
    comm_score = min(95, max(50, 60 + (answer_len // 10)))
    gram_score = 90 if answer_len > 15 else 70
    conf_score = min(95, max(55, 65 + matches * 4))
    
    # Build suggestions list
    suggestions = []
    if answer_len < 30:
        suggestions.append("Provide a longer, more structured answer that outlines actual deployment trade-offs.")
    else:
        suggestions.append("Structure your technical replies by first explaining the core concept, then the implementation details.")
        
    suggestions.append("Incorporate specific benchmark indicators or sizing details to prove real-world engineering experiences.")
    suggestions.append("Use standard industry design patterns (like clean decoupling or caching) to ground structural choices.")
    
    # Construct an exemplar correct answer
    correct_answer = (
        f"An optimal response for a {level} {role} would cover:\n"
        f"1. Core concept analysis: Define the system limits, locking behaviors, or scaling bottlenecks referenced in: '{question}'.\n"
        f"2. Practical implementation: Mention production-ready practices such as read replicas, connection pooling, and queue pipelines.\n"
        f"3. Quantitative metrics: Show how to profile performance or handle failures gracefully."
    )
    
    # Compile dynamic follow-up
    follow_up = f"That is a reasonable summary. How would you handle database connection pooling or resource cleanups under peak concurrency spikes?"
    
    return {
        "technical_score": tech_score,
        "communication_score": comm_score,
        "grammar_score": gram_score,
        "confidence_score": conf_score,
        "suggestions": suggestions,
        "correct_answer": correct_answer,
        "follow_up": follow_up,
        "is_fallback": True
    }

async def evaluate_candidate_answer(
    role: str,
    level: str,
    question: str,
    answer: str,
    resume_summary: Optional[str] = None
) -> Dict[str, Any]:
    """
    Sends the candidate's answer to Ollama (Llama 3.1) for evaluation.
    Returns a dictionary containing scores, suggestions, correct answer, and a follow-up question.
    """
    system_prompt = (
        "You are an expert technical interviewer evaluating a mock interview.\n"
        "Provide constructive feedback, multi-score metrics (0-100), detailed recommendations, and a follow-up question.\n"
        "Adaptively adjust the difficulty of the follow_up question: if the candidate performs well (technical_score >= 80), ask a more challenging, deeper follow-up. If they struggled (<60), ask an easier follow-up question.\n"
        "You MUST return your output STRICTLY in JSON format matching this schema:\n"
        "{\n"
        "  \"technical_score\": <int>,\n"
        "  \"communication_score\": <int>,\n"
        "  \"grammar_score\": <int>,\n"
        "  \"confidence_score\": <int>,\n"
        "  \"suggestions\": [\"<str>\", \"<str>\"],\n"
        "  \"correct_answer\": \"<str>\",\n"
        "  \"follow_up\": \"<str>\"\n"
        "}"
    )

    user_prompt = (
        f"Role: {role}\n"
        f"Experience Level: {level}\n"
        f"Question: {question}\n"
        f"Candidate's Answer: {answer}\n"
    )
    if resume_summary:
        user_prompt += f"Candidate's Resume context: {resume_summary}\n"

    payload = {
        "model": settings.OLLAMA_MODEL,
        "prompt": user_prompt,
        "system": system_prompt,
        "stream": False,
        "format": "json",
        "options": {
            "temperature": 0.7
        }
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            logger.info(f"Connecting to Ollama at {settings.OLLAMA_URL} for granular metrics...")
            response = await client.post(
                f"{settings.OLLAMA_URL}/api/generate",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                result = response.json()
                raw_response = result.get("response", "")
                parsed_json = json.loads(raw_response)
                
                # Verify required keys
                required_keys = [
                    "technical_score", "communication_score", "grammar_score", "confidence_score",
                    "suggestions", "correct_answer", "follow_up"
                ]
                if all(key in parsed_json for key in required_keys):
                    parsed_json["is_fallback"] = False
                    return parsed_json
                    
                raise ValueError("JSON returned by Ollama is missing required evaluation metrics.")
            else:
                logger.warning(f"Ollama returned status {response.status_code}. Using fallback.")
                
    except Exception as err:
        logger.warning(f"Ollama integration unavailable: {str(err)}. Executing local heuristic fallback.")
        
    return generate_heuristic_evaluation(role, level, question, answer)
