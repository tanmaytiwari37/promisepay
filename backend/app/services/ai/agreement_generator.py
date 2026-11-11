from typing import Optional
from app.schemas.ai import GeneratedAgreement, DeliverableItem, AcceptanceCriterionItem
from app.services.ai.llm import call_llm_json


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
        # Realistic canned fallback for mock mode or offline demo
        raw_json = {
            "title": "E-Commerce Landing Page & API Integration",
            "summary": f"Deliver a high-converting, mobile-responsive landing page with verified checkout capabilities within budget of ${budget}.",
            "deliverables": [
                {
                    "id": "del-1",
                    "title": "Responsive Frontend Layout",
                    "description": "Cross-browser compatible user interface based on design specifications."
                },
                {
                    "id": "del-2",
                    "title": "Payment & Order Processing",
                    "description": "Secure integration connecting checkout buttons to authorization endpoints."
                }
            ],
            "acceptance_criteria": [
                {
                    "id": "crit-1",
                    "deliverable_id": "del-1",
                    "criterion": "Passes automated responsive testing on Chrome, Safari, and mobile viewports."
                },
                {
                    "id": "crit-2",
                    "deliverable_id": "del-2",
                    "criterion": "Order creation and payment authorization execute with HTTP 200/201 and valid payload."
                }
            ],
            "amount": float(budget),
            "deadline": str(deadline or "2026-12-01"),
            "assumptions": [
                "Client provides necessary branding assets and color palette",
                "Deployment will target standard HTTPS environments"
            ]
        }

    return GeneratedAgreement.model_validate(raw_json)
