from fastapi import APIRouter
import os
from app.api.endpoints import auth, candidates, interviews, admin, files, jobs, settings

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

@api_router.get("/health")
def health_check():
    return {"status": "healthy"}

@api_router.get("/files")
def list_backend_files():
    try:
        return {
            "root_files": os.listdir("/app"),
            "backend_files": os.listdir("/app/backend"),
            "app_files": os.listdir("/app/backend/app"),
            "api_files": os.listdir("/app/backend/app/api"),
            "cwd": os.getcwd()
        }
    except Exception as e:
        return {"error": str(e)}

@api_router.get("/logs")
def get_logs():
    try:
        if os.path.exists("error.log"):
            with open("error.log", "r") as f:
                content = f.readlines()
                return {"logs": "".join(content[-500:])}
        return {"logs": "No logs found"}
    except Exception as e:
        return {"error": str(e)}

@api_router.get("/diagnostics")
def get_diagnostics():
    try:
        import bcrypt
        db_url = os.getenv("DATABASE_URL", "MISSING")
        masked_db_url = db_url[:20] + "..." if db_url != "MISSING" else "MISSING"
        
        db_host = "N/A"
        if "@" in db_url:
            db_host = db_url.split("@")[-1].split("/")[0]
        
        return {
            "database_url_status": "present" if db_url != "MISSING" else "MISSING",
            "database_url_preview": masked_db_url,
            "database_host": db_host,
            "bcrypt_version": getattr(bcrypt, "__version__", "unknown"),
            "cwd": os.getcwd(),
            "files": os.listdir(".")
        }
    except Exception as e:
        return {"error": str(e)}

api_router.include_router(candidates.router, prefix="/candidates", tags=["candidates"])
api_router.include_router(interviews.router, prefix="/interviews", tags=["interviews"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(files.router, prefix="/files", tags=["files"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
