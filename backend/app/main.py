from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
import traceback
from fastapi.middleware.cors import CORSMiddleware
from app.api import api_router
from app.core.config import settings
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI HR Interview Automation System API",
    version="1.0.0"
)

@app.on_event("startup")
def startup_event():
    print("--- SYSTEM STARTUP ---")
    print(f"Project: {settings.PROJECT_NAME}")
    print(f"Version: 1.0.0")
    print("-------------------------")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    # Log the full exception server-side
    import logging
    logging.error(f"Global exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error"},
    )

# Set restricted CORS origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/api/v1/info")
def info_test():
    return {"message": "Info route is reachable", "prefix": "/api/v1"}

@app.get("/debug")
def debug_root():
    return {"message": "Backend is alive", "routes": [route.path for route in app.routes]}

Instrumentator().instrument(app).expose(app)

@app.get("/health")
def health_check():
    return {"status": "healthy"}
