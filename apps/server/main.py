from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.employees import router as employees_router
from api.auth import router as auth_router
from api.dashboard import router as dashboard_router
from api.error_monitoring import router as error_monitoring_router
from api.ai_diagnostics import router as ai_diagnostics_router
from api.sync import router as sync_router
from api.payroll import router as payroll_router
from api.attendance import router as attendance_router
from api.leave import router as leave_router
from api.documents import router as documents_router
from api.assets import router as assets_router
from api.performance import router as performance_router
from api.organizations import router as organizations_router
from api.database import router as database_router
from fastapi.staticfiles import StaticFiles
import os
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from dotenv import load_dotenv

# Load local environment files
load_dotenv()

SENTRY_DSN = os.getenv("SENTRY_DSN")
if SENTRY_DSN:
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[FastApiIntegration()],
        traces_sample_rate=1.0,
        send_default_pii=True
    )
    print("Successfully connected to Sentry Real-Time Error Monitoring")

ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()
IS_PROD = ENVIRONMENT == "production"

# Disable FastAPI documentation in production for security hardening
app = FastAPI(
    title="WKNsite API",
    docs_url=None if IS_PROD else "/docs",
    redoc_url=None if IS_PROD else "/redoc",
    openapi_url=None if IS_PROD else "/openapi.json"
)

# Allow CORS for safe development and production domains
default_origins = [
    "http://localhost:5173",    # React Vite Dev
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

env_origins = os.getenv("ALLOWED_ORIGINS")
if env_origins:
    ALLOWED_ORIGINS = [origin.strip() for origin in env_origins.split(",") if origin.strip()]
else:
    ALLOWED_ORIGINS = default_origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(employees_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(error_monitoring_router, prefix="/api")
app.include_router(ai_diagnostics_router, prefix="/api")
app.include_router(sync_router, prefix="/api")
app.include_router(payroll_router, prefix="/api")
app.include_router(attendance_router, prefix="/api")
app.include_router(leave_router, prefix="/api")
app.include_router(documents_router, prefix="/api")
app.include_router(assets_router, prefix="/api")
app.include_router(performance_router, prefix="/api")
app.include_router(organizations_router, prefix="/api")
app.include_router(database_router, prefix="/api")

@app.on_event("startup")
async def startup_event():
    import asyncio
    from utils.db_backup import start_backup_scheduler
    asyncio.create_task(start_backup_scheduler())

@app.get("/api")
@app.get("/api/")
def api_root():
    return {"status": "online", "message": "WKNsite API is running"}

# Serve static files (UI) from the client directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
CLIENT_DIST_DIR = os.path.join(BASE_DIR, "apps", "client", "dist")
LEGACY_CLIENT_DIR = os.path.join(BASE_DIR, "archive", "client_legacy")

# Support for React SPA (Single Page Application) Routing in production
if os.path.exists(CLIENT_DIST_DIR):
    assets_dir = os.path.join(CLIENT_DIST_DIR, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    def read_root():
        from fastapi.responses import FileResponse
        return FileResponse(os.path.join(CLIENT_DIST_DIR, "index.html"))

    @app.get("/{catchall:path}")
    def read_catchall(catchall: str):
        from fastapi.responses import FileResponse
        if catchall.startswith("api"):
            from fastapi import HTTPException
            raise HTTPException(status_code=404, detail="Not Found")
        
        file_path = os.path.join(CLIENT_DIST_DIR, catchall)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
            
        return FileResponse(os.path.join(CLIENT_DIST_DIR, "index.html"))
else:
    # Fallback to legacy client if build does not exist
    def mount_static(app, path, directory):
        if os.path.exists(directory):
            app.mount(path, StaticFiles(directory=directory), name=path.strip("/"))

    if os.path.exists(LEGACY_CLIENT_DIR):
        mount_static(app, "/js", os.path.join(LEGACY_CLIENT_DIR, "js"))
        mount_static(app, "/css", os.path.join(LEGACY_CLIENT_DIR, "css"))
        mount_static(app, "/assets", os.path.join(LEGACY_CLIENT_DIR, "assets"))
        mount_static(app, "/lib", os.path.join(LEGACY_CLIENT_DIR, "lib"))

        @app.get("/style.css")
        def get_style():
            from fastapi.responses import FileResponse
            return FileResponse(os.path.join(LEGACY_CLIENT_DIR, "css", "style.css"))

        @app.get("/")
        def read_root():
            from fastapi.responses import FileResponse
            return FileResponse(os.path.join(LEGACY_CLIENT_DIR, "index.html"))

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
