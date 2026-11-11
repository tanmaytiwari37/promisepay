from pydantic import BaseModel
from typing import List, Optional


class DeliverableItem(BaseModel):
    id: str
    title: str
    description: str


class AcceptanceCriterionItem(BaseModel):
    id: str
    deliverable_id: str
    criterion: str


class GeneratedAgreement(BaseModel):
    title: str
    summary: str
    deliverables: List[DeliverableItem]
    acceptance_criteria: List[AcceptanceCriterionItem]
    amount: float
    deadline: str
    assumptions: List[str] = []


class CriterionVerification(BaseModel):
    criterion_id: str
    status: str  # completed | missing | uncertain
    evidence: str
    reasoning: str


class VerificationResult(BaseModel):
    criteria: List[CriterionVerification]
    overall_summary: str
    improvement_suggestions: List[str] = []
    limitations: List[str] = []
