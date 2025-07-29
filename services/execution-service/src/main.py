from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import asyncio
import docker
import json
import uuid
from typing import Dict, List
from contextlib import asynccontextmanager

from .models.execution import ExecutionRequest, ExecutionResponse, ExecutionStatus
from .services.code_executor import CodeExecutor
from .services.container_manager import ContainerManager
from .core.config import settings
from .utils.logger import setup_logger

logger = setup_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting Code Execution Service...")
    
    # Initialize Docker client
    try:
        docker_client = docker.from_env()
        app.state.docker_client = docker_client
        logger.info("Docker client initialized")
    except Exception as e:
        logger.error(f"Failed to initialize Docker client: {e}")
        raise
    
    # Initialize container manager
    app.state.container_manager = ContainerManager(docker_client)
    
    # Initialize code executor
    app.state.code_executor = CodeExecutor(app.state.container_manager)
    
    logger.info("Code Execution Service started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down Code Execution Service...")
    await app.state.container_manager.cleanup_all_containers()

app = FastAPI(
    title="Code Execution Service",
    description="Secure code execution service with Docker sandboxing",
    version="1.0.0",
    lifespan=lifespan
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active WebSocket connections
active_connections: Dict[str, WebSocket] = {}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "execution-service",
        "version": "1.0.0"
    }

@app.post("/api/v1/execute", response_model=ExecutionResponse)
async def execute_code(request: ExecutionRequest):
    """Execute code in a secure Docker container"""
    
    try:
        result = await app.state.code_executor.execute_code(
            code=request.code,
            language=request.language,
            input_data=request.input_data,
            timeout=request.timeout,
            memory_limit=request.memory_limit
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Code execution failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Code execution failed: {str(e)}"
        )

@app.websocket("/api/v1/execute/stream/{session_id}")
async def execute_code_stream(websocket: WebSocket, session_id: str):
    """Execute code with real-time output streaming"""
    
    await websocket.accept()
    active_connections[session_id] = websocket
    
    try:
        while True:
            # Receive execution request
            data = await websocket.receive_text()
            request_data = json.loads(data)
            
            request = ExecutionRequest(**request_data)
            
            # Execute code with streaming output
            async for output_chunk in app.state.code_executor.execute_code_stream(
                code=request.code,
                language=request.language,
                input_data=request.input_data,
                timeout=request.timeout,
                memory_limit=request.memory_limit,
                session_id=session_id
            ):
                await websocket.send_text(json.dumps(output_chunk))
                
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected for session {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error for session {session_id}: {str(e)}")
        await websocket.send_text(json.dumps({
            "type": "error",
            "message": str(e)
        }))
    finally:
        if session_id in active_connections:
            del active_connections[session_id]
        
        # Cleanup any running containers for this session
        await app.state.container_manager.cleanup_session_containers(session_id)

@app.get("/api/v1/languages")
async def get_supported_languages():
    """Get list of supported programming languages"""
    
    return app.state.code_executor.get_supported_languages()

@app.post("/api/v1/validate")
async def validate_code(request: ExecutionRequest):
    """Validate code syntax without execution"""
    
    try:
        result = await app.state.code_executor.validate_code(
            code=request.code,
            language=request.language
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Code validation failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Code validation failed: {str(e)}"
        )

@app.get("/api/v1/stats")
async def get_execution_stats():
    """Get execution service statistics"""
    
    stats = await app.state.container_manager.get_stats()
    
    return {
        "active_containers": stats["active_containers"],
        "total_executions": stats["total_executions"],
        "average_execution_time": stats["average_execution_time"],
        "memory_usage": stats["memory_usage"],
        "cpu_usage": stats["cpu_usage"]
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8002,
        reload=settings.DEBUG,
        log_level="info"
    )
