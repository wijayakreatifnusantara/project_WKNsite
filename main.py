from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.employees import router as employees_router

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

@app.get("/")
def read_root():
    return {"message": "Welcome to WKNsite API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
