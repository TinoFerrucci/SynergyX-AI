from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import Project
from app.schemas import ProjectCreate, ProjectRead

router = APIRouter()


@router.post("/projects/", response_model=ProjectRead)
def create_project(
    data: ProjectCreate,
    session: Session = Depends(get_session),
):
    project = Project(
        description=data.description,
        desired_team_size=data.desired_team_size,
    )
    session.add(project)
    session.commit()
    session.refresh(project)
    return project


@router.get("/projects/", response_model=list[ProjectRead])
def list_projects(
    skip: int = 0,
    limit: int = 50,
    session: Session = Depends(get_session),
):
    statement = select(Project).offset(skip).limit(limit)
    return session.exec(statement).all()


@router.get("/projects/{project_id}", response_model=ProjectRead)
def get_project(project_id: str, session: Session = Depends(get_session)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.delete("/projects/{project_id}")
def delete_project(project_id: str, session: Session = Depends(get_session)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    session.delete(project)
    session.commit()
    return {"detail": "Project deleted"}
