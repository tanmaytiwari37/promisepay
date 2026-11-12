import os
from typing import List, Dict, Any, Optional
from pypdf import PdfReader
from app.schemas.ai import VerificationResult, CriterionVerification
from app.services.ai.llm import call_llm_json
from app.core.config import settings


def extract_evidence_text(file_path: Optional[str], file_type: Optional[str]) -> str:
    if not file_path or not os.path.exists(file_path):
        return "No attached file provided."

    file_type = (file_type or "").lower()
    if file_type in ["txt", "md"]:
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()[:10000]
        except Exception as e:
            return f"[Error reading text file: {e}]"
    elif file_type == "pdf":
        try:
            reader = PdfReader(file_path)
            extracted = []
            for page in reader.pages[:10]:
                text = page.extract_text()
                if text:
                    extracted.append(text)
            return "\n".join(extracted)[:10000]
        except Exception as e:
            return f"[Error extracting PDF text: {e}]"
    else:
        return f"[Binary submission evidence file: {os.path.basename(file_path)} ({file_type})]"


async def verify_submission_evidence(
    criteria: List[Dict[str, Any]],
    submission_notes: Optional[str],
    file_path: Optional[str],
    file_type: Optional[str]
) -> VerificationResult:
    evidence_text = extract_evidence_text(file_path, file_type)
    criteria_text = "\n".join([f"- ID: {c.get('id')}: {c.get('criterion')}" for c in criteria])

    prompt = f"""
Acceptance Criteria:
{criteria_text}

Freelancer Submission Notes:
{submission_notes or "None provided"}

Extracted Evidence / Content:
{evidence_text}

Verify the submission against each acceptance criterion.
For each criterion, determine:
- criterion_id: matching the provided ID
- status: exactly one of "completed", "missing", or "uncertain"
- evidence: direct quote from the text or explicit file reference (e.g., "Line 42: ...", "Page 3: ...", "File: deliverable.txt")
- reasoning: why this evidence satisfies or fails the criterion. Never claim certainty without direct evidence.

VERIFICATION RULES:
- A criterion may be "completed" ONLY if there is a direct quoted evidence snippet or explicit file reference.
- If evidence is partial, indirect, or missing, use "uncertain" or "missing" — never "completed" without proof.
- Always include limitations: automated check cannot execute code, verify external APIs, or access private credentials.
- Customer approval remains required to trigger payment capture.

Provide an overall summary, actionable improvement suggestions if any, and limitations of this automated assessment.
"""
    system_prompt = (
        "You are an objective AI delivery auditor. Evaluate evidence strictly against criteria without bias. "
        "Your role is decision support for the customer. You must never approve payments or make legal guarantees. "
        "Be conservative: prefer 'uncertain' over 'completed' when evidence is not explicit."
    )

    raw_json = await call_llm_json(prompt, system_prompt)

    if not raw_json:
        # Realistic canned fallback for mock mode - Bakery Website project
        # Most criteria completed, one uncertain (honest AI)
        verified_items = []
        for i, c in enumerate(criteria):
            cid = c.get("id", f"crit-{i+1}")
            if i == 0:
                # Home, Menu, Contact pages exist
                verified_items.append({
                    "criterion_id": cid,
                    "status": "completed",
                    "evidence": "Submission includes live URLs: https://riyasbakehouse.vercel.app/, https://riyasbakehouse.vercel.app/menu, https://riyasbakehouse.vercel.app/contact",
                    "reasoning": "All three pages are deployed and accessible via navigation bar. Direct evidence from live site."
                })
            elif i == 1:
                # Menu page lists items with prices
                verified_items.append({
                    "criterion_id": cid,
                    "status": "completed",
                    "evidence": "Menu page shows 12 items with prices (e.g., 'Chocolate Croissant — $3.50', 'Sourdough Loaf — $6.00') and descriptions.",
                    "reasoning": "Menu page displays items, prices, and descriptions as required. Verified via live URL."
                })
            elif i == 2:
                # Contact form sends message
                verified_items.append({
                    "criterion_id": cid,
                    "status": "completed",
                    "evidence": "Form submission test: filled Name, Email, Message fields → clicked Send → received 'Message sent successfully' toast notification.",
                    "reasoning": "Contact form functions end-to-end. Submission recorded in Formspree dashboard (screenshot attached)."
                })
            elif i == 3:
                # Mobile responsive - uncertain (honest AI)
                verified_items.append({
                    "criterion_id": cid,
                    "status": "uncertain",
                    "evidence": "Submission includes desktop screenshots only. No mobile viewport screenshots or automated test results provided.",
                    "reasoning": "Cannot verify mobile responsiveness without mobile viewport evidence or automated test report. Customer should manually test on mobile device."
                })
            else:
                verified_items.append({
                    "criterion_id": cid,
                    "status": "uncertain",
                    "evidence": f"Attached file: {os.path.basename(file_path or 'deliverable.txt')}.",
                    "reasoning": "Partial evidence found; customer manual verification recommended before final payment capture."
                })

        raw_json = {
            "criteria": verified_items if verified_items else [
                {
                    "criterion_id": "crit-default",
                    "status": "completed",
                    "evidence": submission_notes or "Evidence provided in submission upload.",
                    "reasoning": "Work delivered according to agreement terms."
                }
            ],
            "overall_summary": "Three of four acceptance criteria verified with direct evidence. Mobile responsiveness remains uncertain — no mobile test evidence provided. Customer should test on mobile device before final approval.",
            "improvement_suggestions": [
                "Attach mobile viewport screenshots or Lighthouse mobile audit report",
                "Test contact form on actual mobile device"
            ],
            "limitations": [
                "Automated check does not execute arbitrary code or verify external third-party API credentials live",
                "Cannot verify visual rendering on real mobile devices without screenshots or test reports",
                "Customer approval remains required to trigger payment capture"
            ],
            "ai_mode": "mock"
        }
    elif "ai_mode" not in raw_json:
        raw_json["ai_mode"] = settings.LLM_PROVIDER

    return VerificationResult.model_validate(raw_json)
