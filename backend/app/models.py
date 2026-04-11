import uuid
from datetime import datetime, timezone

from sqlmodel import Field, SQLModel


class UserProfile(SQLModel, table=True):
    __tablename__ = "user_profiles"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    full_name: str = Field(default="Unknown")
    possible_roles: str = Field(default="[]")
    core_technologies: str = Field(default="[]")
    knowledge_areas: str = Field(default="[]")
    seniority_level: str = Field(default="Unknown")
    raw_cv_text: str = Field(default="")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class Project(SQLModel, table=True):
    __tablename__ = "projects"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    description: str
    desired_team_size: int = Field(default=3)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
