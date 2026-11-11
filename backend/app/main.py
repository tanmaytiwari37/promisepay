from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routers import auth, projects, agreements, submissions, payments, verification

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(agreements.router)
app.include_router(submissions.router)
app.include_router(payments.router)
app.include_router(verification.router)


@app.get("/health")
def health_check():
    return {"status": "OK", "app": settings.PROJECT_NAME}

