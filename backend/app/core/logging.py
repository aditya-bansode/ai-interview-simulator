import logging
import sys
from app.core.config import settings

def setup_logging() -> None:
    """
    Configures standard logging formatting and level for the entire application.
    """
    log_level = logging.INFO
    if settings.ENVIRONMENT == "development":
        log_level = logging.DEBUG

    logging.basicConfig(
        level=log_level,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ],
        force=True
    )

    # Prevent spamming from 3rd party libraries
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("aiosqlite").setLevel(logging.WARNING)
    
    logger = logging.getLogger(__name__)
    logger.info(f"Logging initialized with level: {logging.getLevelName(log_level)}")
