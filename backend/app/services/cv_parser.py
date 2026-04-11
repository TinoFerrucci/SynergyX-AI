import io
import json

from PyPDF2 import PdfReader
from openai import OpenAI

from app.schemas import ParsedCV

SYSTEM_PROMPT = """You are an expert HR Recruiter and Talent Analyst. Your task is to analyze a candidate's CV/resume and extract structured information.

Extract the following fields:
- full_name: The candidate's full name
- possible_roles: List of 1-5 job roles this candidate could fill (e.g., "Frontend Developer", "Data Scientist", "DevOps Engineer")
- core_technologies: List of specific technologies, frameworks, languages, and tools the candidate knows (e.g., "React", "Python", "Docker", "AWS")
- knowledge_areas: List of broader knowledge domains and expertise areas (e.g., "Machine Learning", "Agile Methodologies", "System Design", "User Research")
- seniority_level: One of: Junior, Mid-Level, Senior, Lead, Principal, Staff

Be thorough and specific. Infer roles from the skills and experience described. If the seniority is not explicitly stated, estimate based on years of experience or project complexity."""


def extract_text_from_pdf(file_bytes: bytes) -> str:
    reader = PdfReader(io.BytesIO(file_bytes))
    pages = []
    for page in reader.pages:
        text = page.extract_text()
        if text:
            pages.append(text)
    return "\n\n".join(pages)


def extract_text_from_upload(filename: str, file_bytes: bytes) -> str:
    if filename.lower().endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    elif filename.lower().endswith(".txt"):
        return file_bytes.decode("utf-8", errors="replace")
    else:
        raise ValueError(
            f"Unsupported file format: {filename}. Only PDF and TXT files are accepted."
        )


def parse_cv_with_ai(raw_text: str) -> ParsedCV:
    client = OpenAI()

    response = client.responses.parse(
        model="gpt-5.4",
        input=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": f"Analyze the following CV/resume and extract the structured information:\n\n---\n{raw_text}\n---",
            },
        ],
        text_format=ParsedCV,
    )

    parsed = response.output_parsed
    if not parsed:
        raise ValueError("Failed to parse CV with AI: no structured output returned")

    return parsed
