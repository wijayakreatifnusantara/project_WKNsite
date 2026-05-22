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
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(title="WKNsite API")

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

@app.get("/api")
@app.get("/api/")
def api_root():
    return {"status": "online", "message": "WKNsite API is running"}

# Serve static files (UI) from the client directory
CLIENT_DIR = os.path.join(os.path.dirname(__file__), "..", "client")
LEGACY_CLIENT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "client_legacy")

def mount_static(app, path, directory):
    if os.path.exists(directory):
        app.mount(path, StaticFiles(directory=directory), name=path.strip("/"))
    else:
        # Try legacy directory as fallback
        legacy_dir = os.path.join(LEGACY_CLIENT_DIR, path.strip("/"))
        if os.path.exists(legacy_dir):
            app.mount(path, StaticFiles(directory=legacy_dir), name=path.strip("/"))

mount_static(app, "/js", os.path.join(CLIENT_DIR, "js"))
mount_static(app, "/css", os.path.join(CLIENT_DIR, "css"))
mount_static(app, "/assets", os.path.join(CLIENT_DIR, "assets"))
mount_static(app, "/lib", os.path.join(CLIENT_DIR, "lib"))

@app.get("/style.css")
def get_style():
    from fastapi.responses import FileResponse
    path = os.path.join(CLIENT_DIR, "css", "style.css")
    if not os.path.exists(path):
        path = os.path.join(LEGACY_CLIENT_DIR, "css", "style.css")
    return FileResponse(path)

@app.get("/")
def read_root():
    from fastapi.responses import FileResponse
    path = os.path.join(CLIENT_DIR, "index.html")
    if not os.path.exists(path):
        path = os.path.join(LEGACY_CLIENT_DIR, "index.html")
    return FileResponse(path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
