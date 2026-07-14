# AI Interview Simulator

A production-ready boilerplate for an AI Mock Interview Simulator built using Python FastAPI (backend) and React + Vite + TypeScript (frontend). The project is structured with **Clean Architecture** principles and includes full **Docker containerization** and robust **JWT Authentication** (with refresh token rotation).

## Project Architecture

The codebase is organized as follows:

```
├── backend/
│   ├── app/
│   │   ├── core/           # Cross-cutting configurations (JWT security, database sessions, logging, custom exceptions)
│   │   ├── domain/         # Pydantic schemas (Validation)
│   │   ├── adapters/       # Database models (SQLAlchemy)
│   │   ├── repositories/   # DB query operations (separation of database concerns)
│   │   ├── api/            # API endpoints & dependency injection
│   │   │   └── v1/
│   │   │       ├── endpoints/
│   │   │       └── router.py
│   │   └── main.py         # App declaration, middlewares, startup lifespan
│   ├── alembic/            # Database migrations
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/     # Reusable UI (Navbar, Protected Route guards)
│   │   ├── context/        # Global AuthContext (JWT storage & session checks)
│   │   ├── features/       # Modular features (Auth login/register, Dashboard stats, Profile management)
│   │   ├── services/       # Axios API client configured with silent refresh interceptors
│   │   ├── App.tsx         # Layout, Router, and routes configurations
│   │   ├── index.css       # Custom design system with glassmorphic cards and slate/violet theme variables
│   │   └── main.tsx        # React mounting entry point
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── docker-compose.yml
└── .env.example
```

## Features Implemented

1. **Clean Architecture**: Strong separation of database persistence (repositories), validation schemas (domain), configurations (core), and endpoints (api).
2. **Robust JWT Authentication**:
   - **Access Token**: Short-lived, passed in requests headers.
   - **Refresh Token**: Long-lived, stored in PostgreSQL and delivered to the client as an HTTP-only, secure, Lax cookie.
   - **Silent Refresh & Token Rotation**: Frontend interceptor detects expired access tokens (`401 Unauthorized`) and automatically fetches a new access token and fresh refresh token in the background, retrying the original request seamlessly.
3. **Database Integration**: SQLAlchemy async ORM engine configured for PostgreSQL. Tables are auto-created on application startup (with complete Alembic migrations support available).
4. **Rich Aesthetic Frontend**: Built using modern dark-theme styles, tailored slate/violet gradients, glassmorphism panels, CSS transition micro-animations, validation notices, and loading indicators.

---

## Getting Started

### Prerequisites
- [Docker](https://www.docker.com/) (includes Docker Compose)

### Running with Docker

1. **Set up Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. **Start the Services**:
   Use Docker Compose to build and start the PostgreSQL database, FastAPI backend, and React frontend:
   ```bash
   docker compose up --build
   ```

3. **Access the Applications**:
   - **React Frontend**: [http://localhost:5173](http://localhost:5173)
   - **FastAPI Documentation (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
   - **FastAPI Health check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## API Endpoints List

### Authentication
- `POST /api/v1/auth/register`: Create a new account.
- `POST /api/v1/auth/login`: Log in, returns JWT access token and sets HTTP-only refresh cookie.
- `POST /api/v1/auth/refresh`: Requests token refresh using the HTTP-only cookie, returns new access token.
- `POST /api/v1/auth/logout`: Revokes refresh token in the database and clears cookies.

### User Profile (Protected)
- `GET /api/v1/users/me`: Retrieves current authenticated user's details.
- `PUT /api/v1/users/me`: Updates current user profile (full name, password update with validation).
