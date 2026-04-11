import json

import numpy as np
from openai import OpenAI

from app.schemas import (
    CandidateForMatching,
    TeamGenerationResponse,
    TeamOption,
)

MATCHING_SYSTEM_PROMPT = """You are an expert team-building consultant. Your task is to assemble the best possible teams for a given project.

You will receive:
1. A project description
2. The desired team size
3. A team focus area
4. A list of candidate profiles (pre-filtered by relevance)

You MUST generate exactly 3 distinct team configuration options:

- Option 1 ("Lean & Efficient"): The most cost-effective team. Favor juniors and mid-level. Minimize senior overhead. Best for tight budgets or MVPs.
- Option 2 ("Balanced & Solid"): A well-rounded team mixing seniority levels. Best for most projects. Good balance of experience and fresh ideas.
- Option 3 ("All-Star Premium"): The most experienced team possible. Maximize senior/lead presence. Best for critical projects where quality trumps cost.

For each option, provide:
- option_name: A short, memorable name (2-4 words)
- selected_members: The chosen candidates with their assigned roles
- synergy_explanation: Why these people complement each other (2-3 sentences)
- skill_gap: What this team might be missing (1-2 sentences)
- cost_tier: "Lean", "Moderate", or "Premium"
- estimated_cost_index: "$", "$$", or "$$$"

The user's requested focus area is: {focus}
Adapt the recommendations to align with this focus. For example:
- "speed": Favor people who can execute quickly, generalists over specialists
- "quality": Favor senior people, specialists, proven track records
- "innovation": Favor diverse backgrounds, creative roles, cross-functional thinkers
- "cost-effective": Favor lean team with high-impact individuals
- "balanced": Default balanced approach

IMPORTANT:
- Select exactly the number of members specified in team_size
- Each member must have a specific role relevant to the project
- The three options MUST be genuinely different in composition
- Cost tiers must reflect the actual seniority mix
"""

EMBEDDING_MODEL = "text-embedding-3-small"


def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))


def build_candidate_text(candidate: CandidateForMatching) -> str:
    roles = ", ".join(candidate.possible_roles)
    tech = ", ".join(candidate.core_technologies)
    knowledge = ", ".join(candidate.knowledge_areas)
    return f"Name: {candidate.full_name}\nRoles: {roles}\nTechnologies: {tech}\nKnowledge: {knowledge}\nSeniority: {candidate.seniority_level}"


def rank_candidates_by_embedding(
    project_description: str,
    candidates: list[CandidateForMatching],
    top_n: int = 15,
) -> list[CandidateForMatching]:
    if len(candidates) <= top_n:
        return candidates

    client = OpenAI()

    project_response = client.embeddings.create(
        input=[project_description],
        model=EMBEDDING_MODEL,
    )
    project_embedding = np.array(project_response.data[0].embedding)

    candidate_texts = [build_candidate_text(c) for c in candidates]
    candidate_response = client.embeddings.create(
        input=candidate_texts,
        model=EMBEDDING_MODEL,
    )
    candidate_embeddings = [
        np.array(item.embedding) for item in candidate_response.data
    ]

    scored = []
    for i, candidate in enumerate(candidates):
        sim = _cosine_similarity(project_embedding, candidate_embeddings[i])
        scored.append((sim, candidate))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [c for _, c in scored[:top_n]]


def generate_team_options(
    project_description: str,
    team_size: int,
    focus: str,
    candidates: list[CandidateForMatching],
) -> TeamGenerationResponse:
    ranked = rank_candidates_by_embedding(project_description, candidates, top_n=15)

    candidates_json = []
    for c in ranked:
        candidates_json.append(
            {
                "id": c.id,
                "full_name": c.full_name,
                "possible_roles": c.possible_roles,
                "core_technologies": c.core_technologies,
                "knowledge_areas": c.knowledge_areas,
                "seniority_level": c.seniority_level,
            }
        )

    candidates_block = json.dumps(candidates_json, indent=2)
    system_prompt = MATCHING_SYSTEM_PROMPT.format(focus=focus)

    user_content = f"""PROJECT DESCRIPTION:
{project_description}

DESIRED TEAM SIZE: {team_size}
FOCUS AREA: {focus}

AVAILABLE CANDIDATES (ranked by relevance):
{candidates_block}

Generate exactly 3 distinct team options (Lean, Balanced, Premium). For each, select exactly {team_size} members."""

    client = OpenAI()

    response = client.responses.parse(
        model="gpt-5.4",
        input=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ],
        text_format=TeamGenerationResponse,
    )

    parsed = response.output_parsed
    if not parsed:
        raise ValueError(
            "Failed to generate team options: no structured output returned"
        )

    return parsed
