from typing import Optional
from app.schemas.ai import GeneratedAgreement, DeliverableItem, AcceptanceCriterionItem
from app.services.ai.llm import call_llm_json
from app.core.config import settings


async def generate_agreement(description: str, budget: float, deadline: str) -> GeneratedAgreement:
    prompt = f"""
Project Description: {description}
Agreed Budget: ${budget}
Target Deadline: {deadline}

Generate a clear, fair freelance agreement breaking down the description into:
1. title: A concise project title (use the project title if provided, otherwise derive from description).
2. summary: A professional 2-3 sentence overview of the scope.
3. deliverables: An array of objects with 'id', 'title', and 'description'.
4. acceptance_criteria: An array of verifiable criteria with 'id', 'deliverable_id', and 'criterion'.
5. amount: numeric budget.
6. deadline: deadline string.
7. assumptions: an array of key technical or project assumptions.
"""
    system_prompt = "You are an expert contract specialist and project manager creating precise, objective freelance agreements."

    raw_json = await call_llm_json(prompt, system_prompt)

    if not raw_json:
        # Honest mock fallback: build from the project's actual title, description, budget, and deadline
        # Derive a sensible title from the description if needed
        project_title = description.strip().split('\n')[0][:80] if description else "Untitled Project"

        raw_json = {
            "title": project_title,
            "summary": f"Project: {description[:200]}{'...' if len(description) > 200 else ''}. Budget: ${budget:,.2f}. Deadline: {deadline or 'Not specified'}.",
            "deliverables": [
                {
                    "id": "del-1",
                    "title": "Core Deliverable",
                    "description": description[:300] if description else "Complete the project as described."
                }
            ],
            "acceptance_criteria": [
                {
                    "id": "crit-1",
                    "deliverable_id": "del-1",
                    "criterion": "Deliverable matches the project description and requirements."
                },
                {
                    "id": "crit-2",
                    "deliverable_id": "del-1",
                    "criterion": "Work is submitted by the agreed deadline."
                }
            ],
            "amount": float(budget),
            "deadline": str(deadline or "Not specified"),
            "assumptions": [
                "Requirements are based on the project description provided by the customer",
                "Budget and deadline are as agreed in the project creation"
            ],
            "ai_mode": "mock"
        }
    elif "ai_mode" not in raw_json:
        raw_json["ai_mode"] = settings.LLM_PROVIDER

    return GeneratedAgreement.model_validate(raw_json)
