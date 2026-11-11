from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text
from datetime import datetime
from app.db.session import Base


class Agreement(Base):
    __tablename__ = "agreements"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    deliverables = Column(Text, nullable=True)  # JSON or plain text description
    acceptance_criteria = Column(Text, nullable=True)
    total_amount = Column(Float, nullable=False, default=0.0)
    status = Column(String, default="PENDING_APPROVAL")
    created_at = Column(DateTime, default=datetime.utcnow)

