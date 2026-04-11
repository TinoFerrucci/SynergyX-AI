import json
from contextlib import asynccontextmanager

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import create_db_and_tables
from app.routers import talent, projects, teams


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(
    title="SynergyX-AI",
    description="Autonomous team-building platform powered by AI",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(talent.router, prefix="/api", tags=["talent"])
app.include_router(projects.router, prefix="/api", tags=["projects"])
app.include_router(teams.router, prefix="/api/teams", tags=["teams"])


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "SynergyX-AI"}
