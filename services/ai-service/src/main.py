from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uvicorn
import asyncio
import logging
from contextlib import asynccontextmanager

from .routers import code_analysis, code_conversion, code_generation, chat, optimization
from .core.config import settings
from .core.database import init_db
from .core.redis_client import init_redis
from .middleware.auth import verify_token
from .middleware.rate_limit import RateLimitMiddleware
from .utils.logger import setup_logger

# Setup logging
logger = setup_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting AI Service...")
    await init_db()
    await init_redis()
    logger.info("AI Service started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down AI Service...")

app = FastAPI(
    title="AI Code Assistant Service",
    description="AI-powered code analysis, conversion, and generation service",
    version="1.0.0",
    lifespan=lifespan
)

# Security
security = HTTPBearer()

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(RateLimitMiddleware)

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ai-service",
        "version": "1.0.0"
    }

# Include routers
app.include_router(
    code_analysis.router,
    prefix="/api/v1/analysis",
    tags=["Code Analysis"],
    dependencies=[Depends(verify_token)]
)

app.include_router(
    code_conversion.router,
    prefix="/api/v1/conversion",
    tags=["Code Conversion"],
    dependencies=[Depends(verify_token)]
)

app.include_router(
    code_generation.router,
    prefix="/api/v1/generation",
    tags=["Code Generation"],
    dependencies=[Depends(verify_token)]
)

app.include_router(
    chat.router,
    prefix="/api/v1/chat",
    tags=["AI Chat"],
    dependencies=[Depends(verify_token)]
)

app.include_router(
    optimization.router,
    prefix="/api/v1/optimization",
    tags=["Code Optimization"],
    dependencies=[Depends(verify_token)]
)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=settings.DEBUG,
        log_level="info"
    )
