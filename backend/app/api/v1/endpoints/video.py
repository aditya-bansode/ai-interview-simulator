import base64
import logging
from fastapi import APIRouter, Depends, status
from app.core.exceptions import APIException
from app.api.deps import get_current_user
from app.adapters.db_models import User
from app.domain.schemas import FrameAnalysisRequest, FrameAnalysisResponse
from app.core.video_analyzer import analyze_frame

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/analyze-frame", response_model=FrameAnalysisResponse, status_code=status.HTTP_200_OK)
async def analyze_video_frame(
    payload: FrameAnalysisRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Decodes a base64 encoded video snapshot and runs OpenCV Haar Cascade tracking
    along with DeepFace facial expression classifier to monitor gaze and emotions.
    """
    try:
        # 1. Clean data URI headers if present (e.g. data:image/jpeg;base64,...)
        if "," in payload.image_base64:
            _, base64_data = payload.image_base64.split(",", 1)
        else:
            base64_data = payload.image_base64
            
        # 2. Base64 decode raw image bytes
        image_bytes = base64.b64decode(base64_data)
        
    except Exception as decode_err:
        logger.error(f"Failed to decode base64 image frame: {str(decode_err)}")
        raise APIException(
            "Invalid base64 image data payload.",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    # 3. Process the frame through OpenCV and DeepFace
    analysis = analyze_frame(
        image_bytes=image_bytes,
        last_x=payload.last_x,
        last_y=payload.last_y
    )

    return FrameAnalysisResponse(
        face_detected=analysis.get("face_detected", False),
        eye_contact=analysis.get("eye_contact", False),
        looking_away=analysis.get("looking_away", False),
        head_movement_detected=analysis.get("head_movement_detected", False),
        current_x=analysis.get("current_x", 0),
        current_y=analysis.get("current_y", 0),
        dominant_emotion=analysis.get("dominant_emotion", "none"),
        emotion_happy=analysis.get("emotion_happy", 0.0),
        emotion_neutral=analysis.get("emotion_neutral", 0.0),
        emotion_sad=analysis.get("emotion_sad", 0.0),
        emotion_angry=analysis.get("emotion_angry", 0.0),
        emotion_fear=analysis.get("emotion_fear", 0.0)
    )
