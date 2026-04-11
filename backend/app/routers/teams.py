import json

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import UserProfile
from app.schemas import (
    CandidateForMatching,
    TeamGenerationRequest,
    TeamGenerationResponse,
)
from app.services.matching import generate_team_options

router = APIRouter()


@router.post("/generate-options", response_model=TeamGenerationResponse)
def generate_options(
    request: TeamGenerationRequest,
    session: Session = Depends(get_session),
):
    statement = select(UserProfile)
    all_profiles = session.exec(statement).all()

    if len(all_profiles) < request.team_size:
        raise HTTPException(
            status_code=400,
            detail=f"Not enough profiles. Need {request.team_size}, but only {len(all_profiles)} available. Upload more CVs first.",
        )

    candidates = []
    for p in all_profiles:
        candidates.append(
            CandidateForMatching(
                id=p.id,
                full_name=p.full_name,
                possible_roles=json.loads(p.possible_roles),
                core_technologies=json.loads(p.core_technologies),
                knowledge_areas=json.loads(p.knowledge_areas),
                seniority_level=p.seniority_level,
            )
        )

    try:
        result = generate_team_options(
            project_description=request.project_description,
            team_size=request.team_size,
            focus=request.focus,
            candidates=candidates,
        )
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Team generation failed: {str(e)}")

    return result
