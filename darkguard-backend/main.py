"""
DarkGuard — FastAPI Application Entry Point
"""

import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)
logger = logging.getLogger("darkguard")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    logger.info("🛡️  DarkGuard API starting up...")

    # Verify critical config
    groq_key = os.getenv("GROQ_API_KEY", "")
    supa_url = os.getenv("SUPABASE_URL", "")
    if not groq_key:
        logger.warning("⚠️  GROQ_API_KEY not set — AI analysis will fall back to ML classifier")
    if not supa_url:
        logger.warning("⚠️  SUPABASE_URL not set — database operations will fail")

    logger.info("✅ DarkGuard API ready")
    yield
    logger.info("🛡️  DarkGuard API shutting down...")


# Create FastAPI app
app = FastAPI(
    title="DarkGuard API",
    description="AI-powered dark pattern detection API for protecting users from deceptive UI",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
        "chrome-extension://*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Auth Middleware ──────────────────────────────────────

@app.middleware("http")
async def auth_middleware(request: Request, call_next):
    """
    Extract user ID from Supabase JWT in Authorization header.
    Sets request.state.user_id if valid token found.
    Public routes work without authentication.
    """
    request.state.user_id = None

    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[7:]
        try:
            from services.supabase_service import get_supabase
            client = get_supabase()
            user = client.auth.get_user(token)
            if user and user.user:
                request.state.user_id = str(user.user.id)
        except Exception as e:
            logger.debug(f"Auth token validation failed: {e}")
            # Don't block request — some routes are public

    response = await call_next(request)
    return response


# ─── Register Routers ────────────────────────────────────

from routers.analyze import router as analyze_router
from routers.trust_score import router as trust_score_router
from routers.complaints import router as complaints_router
from routers.community import router as community_router
from routers.audit import router as audit_router
from routers.user import router as user_router
from routers.leaderboard import router as leaderboard_router

app.include_router(analyze_router)
app.include_router(trust_score_router)
app.include_router(complaints_router)
app.include_router(community_router)
app.include_router(audit_router)
app.include_router(user_router)
app.include_router(leaderboard_router)


# ─── Health Check ─────────────────────────────────────────

@app.get("/", tags=["health"])
async def root():
    return {
        "name": "DarkGuard API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint for monitoring."""
    checks = {"api": True, "groq": False, "supabase": False}

    if os.getenv("GROQ_API_KEY"):
        checks["groq"] = True
    if os.getenv("SUPABASE_URL"):
        checks["supabase"] = True

    return {
        "status": "healthy" if all(checks.values()) else "degraded",
        "checks": checks,
    }
