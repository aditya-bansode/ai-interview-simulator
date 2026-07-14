import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.core.logging import setup_logging
from app.core.exceptions import APIException, api_exception_handler
from app.api.v1.router import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize logging configuration
    setup_logging()
    
    # Ensure uploads folder exists
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    uploads_dir = os.path.join(base_dir, "uploads")
    os.makedirs(uploads_dir, exist_ok=True)
    
    # Auto-create database tables on startup (excellent out-of-the-box behavior)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    # Seed Default Admin if not present
    from app.core.database import AsyncSessionLocal
    from app.adapters.db_models import User
    from app.core.security import get_password_hash
    from sqlalchemy import select

    async with AsyncSessionLocal() as db_session:
        # Check if default admin exists
        admin_email = "admin@simulator.com"
        result = await db_session.execute(select(User).filter(User.email == admin_email))
        admin_user = result.scalar_one_or_none()
        
        if not admin_user:
            hashed_pw = get_password_hash("AdminPassword123!")
            new_admin = User(
                email=admin_email,
                hashed_password=hashed_pw,
                full_name="Interviewer Admin",
                is_admin=True,
                is_active=True
            )
            db_session.add(new_admin)
            await db_session.commit()
            print("Successfully seeded default administrator account: admin@simulator.com")
        
    yield
    
    # Clean up database resources
    await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Production-ready backend API for the AI Interview Simulator",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Register application-level exception handlers
app.add_exception_handler(APIException, api_exception_handler)

# Root level healthcheck endpoint
@app.get("/health", tags=["system"])
async def health_check():
    return {"status": "healthy", "project": settings.PROJECT_NAME}

# Register routing
app.include_router(api_router, prefix="/api/v1")
