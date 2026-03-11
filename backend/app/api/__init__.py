from fastapi import APIRouter
import os
from app.api.endpoints import auth, candidates, interviews, admin, files, jobs, settings

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

@api_router.get("/health")
def health_check():
    return {"status": "healthy"}

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
        import passlib
        try:
            import passlib.handlers.bcrypt
            passlib_bcrypt = "available"
        except ImportError:
            passlib_bcrypt = "missing"
        
        return {
            "bcrypt_version": getattr(bcrypt, "__version__", "unknown"),
            "passlib_version": getattr(passlib, "__version__", "unknown"),
            "passlib_bcrypt_handler": passlib_bcrypt,
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
