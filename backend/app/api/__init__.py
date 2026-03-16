from fastapi import APIRouter, Depends, HTTPException
import os
from app.api.endpoints import auth, candidates, interviews, admin, files, jobs, settings
from app.api import deps
from app import models

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

@api_router.get("/health")
def health_check():
    return {"status": "healthy"}

@api_router.get("/files")
def list_backend_files(
    current_user: models.User = Depends(deps.get_current_active_user)
):
    # Only admins can list files
    if current_user.role.name != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
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
def get_logs(
    current_user: models.User = Depends(deps.get_current_active_user)
):
    if current_user.role.name != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    try:
        if os.path.exists("error.log"):
            with open("error.log", "r") as f:
                content = f.readlines()
                return {"logs": "".join(content[-500:])}
        return {"logs": "No logs found"}
    except Exception as e:
        return {"error": str(e)}

@api_router.get("/diagnostics")
def get_diagnostics(
    current_user: models.User = Depends(deps.get_current_active_user)
):
    if current_user.role.name != "admin":
        raise HTTPException(status_code=403, detail="Not enough permissions")
    try:
        import bcrypt
        import traceback
        # Masked environment variables for troubleshooting
        env_summary = {}
        for k, v in os.environ.items():
            if any(x in k for x in ["DATABASE", "POSTGRES", "SUPABASE", "REDIS", "MINIO", "GEMINI"]):
                if len(v) > 12:
                    env_summary[k] = f"{v[:6]}...{v[-4:]} ({len(v)} chars)"
                else:
                    env_summary[k] = v

        db_url = os.getenv("DATABASE_URL", "MISSING")
        
        # Robust host extraction
        db_host = "N/A"
        if db_url != "MISSING":
            try:
                # Handle postgresql://user:pass@host:port/db
                if "@" in db_url:
                    db_host = db_url.split("@")[-1].split("/")[0]
                else:
                    # Handle postgresql://host:port/db
                    parts = db_url.split("/")
                    if len(parts) >= 3:
                        db_host = parts[2]
            except:
                db_host = "ERROR_PARSING"

        return {
            "database_url_present": db_url != "MISSING",
            "database_host": db_host,
            "env_summary": env_summary,
            "bcrypt_version": getattr(bcrypt, "__version__", "unknown"),
            "os_cwd": os.getcwd(),
            "os_uid": os.getuid() if hasattr(os, "getuid") else "N/A"
        }
    except Exception as e:
        return {"error": str(e), "traceback": traceback.format_exc()}

api_router.include_router(candidates.router, prefix="/candidates", tags=["candidates"])
api_router.include_router(interviews.router, prefix="/interviews", tags=["interviews"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(files.router, prefix="/files", tags=["files"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(settings.router, prefix="/settings", tags=["settings"])
