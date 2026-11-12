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
1. title: A concise project title.
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
        # Realistic canned fallback for mock mode or offline demo - Bakery Website project
        raw_json = {
            "title": "Bakery Website",
            "summary": f"Build a 3-page website (Home, Menu, Contact) for Riya's Bake House with a working contact form, within budget of ${budget}.",
            "deliverables": [
                {
                    "id": "del-1",
                    "title": "Home Page",
                    "description": "Hero section with bakery story, featured items, and call-to-action."
                },
                {
                    "id": "del-2",
                    "title": "Menu Page",
                    "description": "Lists all bakery items with prices, descriptions, and dietary tags."
                },
                {
                    "id": "del-3",
                    "title": "Contact Page with Form",
                    "description": "Contact form that sends messages to the bakery's email."
                }
            ],
            "acceptance_criteria": [
                {
                    "id": "crit-1",
                    "deliverable_id": "del-1",
                    "criterion": "Home, Menu, and Contact pages exist and are accessible via navigation."
                },
                {
                    "id": "crit-2",
                    "deliverable_id": "del-2",
                    "criterion": "Menu page lists items with prices and descriptions."
                },
                {
                    "id": "crit-3",
                    "deliverable_id": "del-3",
                    "criterion": "Contact form sends a message successfully (shows confirmation)."
                },
                {
                    "id": "crit-4",
                    "deliverable_id": "del-1",
                    "criterion": "Site works on mobile viewports (responsive design)."
                }
            ],
            "amount": float(budget),
            "deadline": str(deadline or "2026-12-01"),
            "assumptions": [
                "Client provides bakery logo, photos, and menu content",
                "Deployment will target standard HTTPS hosting (e.g., Vercel, Netlify)"
            ],
            "ai_mode": "mock"
        }
    elif "ai_mode" not in raw_json:
        raw_json["ai_mode"] = settings.LLM_PROVIDER

    return GeneratedAgreement.model_validate(raw_json)
