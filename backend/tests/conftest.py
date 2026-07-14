import asyncio
import pytest
from typing import AsyncGenerator, Generator
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.main import app

# 1. Config Async SQLite in-memory test database URL
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# 2. Setup Async SQLite Engine with static pooling for single-thread testing
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)

# 3. Create session maker
TestAsyncSessionLocal = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# 4. Dependency override
async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestAsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """
    Creates an instance of the default event loop for the session lifecycle.
    """
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()

@pytest.fixture(scope="session", autouse=True)
async def setup_test_db():
    """
    Auto-creates all database tables in the SQLite in-memory instance
    before running tests, and drops them afterward.
    """
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await test_engine.dispose()

@pytest.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Fixture returning an AsyncSession connected to the test database.
    """
    async with TestAsyncSessionLocal() as session:
        yield session

@pytest.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    """
    Fixture providing an AsyncClient pointing to the FastAPI app for HTTP requests.
    """
    async with AsyncClient(app=app, base_url="http://testserver") as async_client:
        yield async_client
