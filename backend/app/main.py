import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.init_db import init_db
from app.routers import auth, projects, agreements, submissions, payments, verification, dashboard

init_db()

app = FastAPI(title=settings.PROJECT_NAME)

# Allow both local frontend and Cloudflare tunnel for development
# FRONTEND_URL can be a comma-separated list of origins
allowed_origins = [origin.strip() for origin in settings.FRONTEND_URL.split(",")]
# Add Cloudflare tunnel URL if it's different from FRONTEND_URL
tunnel_url = os.getenv("TUNNEL_URL") or "https://belt-eat-supplied-calgary.trycloudflare.com"
if tunnel_url not in allowed_origins:
    allowed_origins.append(tunnel_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(agreements.router)
app.include_router(submissions.router)
app.include_router(payments.router)
app.include_router(verification.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {
        "app": settings.PROJECT_NAME,
        "status": "online",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
def health_check():
    return {"status": "OK", "app": settings.PROJECT_NAME}
