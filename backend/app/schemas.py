import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class ParsedCV(BaseModel):
    full_name: str = Field(description="Full name of the candidate")
    possible_roles: list[str] = Field(
        description="List of possible job roles for this candidate"
    )
    core_technologies: list[str] = Field(description="List of core technologies/skills")
    knowledge_areas: list[str] = Field(
        description="List of knowledge domains/areas of expertise"
    )
    seniority_level: str = Field(
        description="Seniority level: Junior, Mid-Level, Senior, Lead, Principal, or Staff"
    )


class UserProfileRead(BaseModel):
    id: str
    full_name: str
    possible_roles: list[str]
    core_technologies: list[str]
    knowledge_areas: list[str]
    seniority_level: str
    raw_cv_text: str
    created_at: datetime

    model_config = {"from_attributes": True}


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    possible_roles: Optional[list[str]] = None
    core_technologies: Optional[list[str]] = None
    knowledge_areas: Optional[list[str]] = None
    seniority_level: Optional[str] = None


class ProjectCreate(BaseModel):
    description: str
    desired_team_size: int = Field(default=3, ge=1, le=20)


class ProjectRead(BaseModel):
    id: str
    description: str
    desired_team_size: int
    created_at: datetime

    model_config = {"from_attributes": True}


class TeamMemberAssignment(BaseModel):
    user_id: str = Field(description="ID of the assigned team member")
    assigned_role: str = Field(
        description="Role assigned to this member for the project"
    )


class TeamOption(BaseModel):
    option_name: str = Field(description="Creative name for this team configuration")
    selected_members: list[TeamMemberAssignment] = Field(
        description="List of team members with their assigned roles"
    )
    synergy_explanation: str = Field(
        description="Why this specific combination of people works well together"
    )
    skill_gap: str = Field(
        description="What skills or roles this team configuration might be missing"
    )
    cost_tier: str = Field(
        description="Cost tier: 'Lean' (fewest seniors), 'Moderate' (balanced), or 'Premium' (most experienced)"
    )
    estimated_cost_index: str = Field(
        description="A qualitative cost indicator like '$', '$$', or '$$$' based on seniority mix"
    )


class TeamGenerationRequest(BaseModel):
    project_description: str = Field(description="Description of the project")
    team_size: int = Field(default=4, ge=2, le=15, description="Desired team size")
    focus: str = Field(
        default="balanced",
        description="Team focus area: 'balanced', 'speed', 'quality', 'innovation', 'cost-effective'",
    )


class TeamGenerationResponse(BaseModel):
    project_description: str
    team_size: int
    focus: str
    options: list[TeamOption] = Field(description="Exactly 3 distinct team options")


class CandidateForMatching(BaseModel):
    id: str
    full_name: str
    possible_roles: list[str]
    core_technologies: list[str]
    knowledge_areas: list[str]
    seniority_level: str
