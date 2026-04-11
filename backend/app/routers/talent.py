import json

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlmodel import Session, select

from app.database import get_session
from app.models import UserProfile
from app.schemas import UserProfileRead, UserProfileUpdate
from app.services.cv_parser import extract_text_from_upload, parse_cv_with_ai

router = APIRouter()


def _profile_to_read(profile: UserProfile) -> UserProfileRead:
    return UserProfileRead(
        id=profile.id,
        full_name=profile.full_name,
        possible_roles=json.loads(profile.possible_roles),
        core_technologies=json.loads(profile.core_technologies),
        knowledge_areas=json.loads(profile.knowledge_areas),
        seniority_level=profile.seniority_level,
        raw_cv_text=profile.raw_cv_text,
        created_at=profile.created_at,
    )


@router.post("/upload-cv/", response_model=UserProfileRead)
async def upload_cv(
    file: UploadFile = File(...),
    session: Session = Depends(get_session),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")

    try:
        file_bytes = await file.read()
        raw_text = extract_text_from_upload(file.filename, file_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read file: {str(e)}")

    if not raw_text.strip():
        raise HTTPException(
            status_code=422, detail="The uploaded file contains no extractable text"
        )

    try:
        parsed = parse_cv_with_ai(raw_text)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"AI parsing failed: {str(e)}")

    profile = UserProfile(
        full_name=parsed.full_name,
        possible_roles=json.dumps(parsed.possible_roles),
        core_technologies=json.dumps(parsed.core_technologies),
        knowledge_areas=json.dumps(parsed.knowledge_areas),
        seniority_level=parsed.seniority_level,
        raw_cv_text=raw_text,
    )
    session.add(profile)
    session.commit()
    session.refresh(profile)

    return _profile_to_read(profile)


@router.get("/profiles/", response_model=list[UserProfileRead])
def list_profiles(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session),
):
    statement = select(UserProfile).offset(skip).limit(limit)
    profiles = session.exec(statement).all()
    return [_profile_to_read(p) for p in profiles]


@router.get("/profiles/{profile_id}", response_model=UserProfileRead)
def get_profile(profile_id: str, session: Session = Depends(get_session)):
    profile = session.get(UserProfile, profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return _profile_to_read(profile)


@router.put("/profiles/{profile_id}", response_model=UserProfileRead)
def update_profile(
    profile_id: str,
    data: UserProfileUpdate,
    session: Session = Depends(get_session),
):
    profile = session.get(UserProfile, profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if data.full_name is not None:
        profile.full_name = data.full_name
    if data.possible_roles is not None:
        profile.possible_roles = json.dumps(data.possible_roles)
    if data.core_technologies is not None:
        profile.core_technologies = json.dumps(data.core_technologies)
    if data.knowledge_areas is not None:
        profile.knowledge_areas = json.dumps(data.knowledge_areas)
    if data.seniority_level is not None:
        profile.seniority_level = data.seniority_level

    session.add(profile)
    session.commit()
    session.refresh(profile)
    return _profile_to_read(profile)


@router.delete("/profiles/{profile_id}")
def delete_profile(profile_id: str, session: Session = Depends(get_session)):
    profile = session.get(UserProfile, profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    session.delete(profile)
    session.commit()
    return {"detail": "Profile deleted"}
