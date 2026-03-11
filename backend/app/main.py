from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import api_router
from app.core.config import settings
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI HR Interview Automation System API",
    version="1.0.0"
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

Instrumentator().instrument(app).expose(app)

@app.get("/health")
def health_check():
    return {"status": "healthy"}
