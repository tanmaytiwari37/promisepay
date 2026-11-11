from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from datetime import datetime
from app.db.session import Base


class VerificationReport(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    submission_id = Column(Integer, ForeignKey("submissions.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    completed_items = Column(Text, nullable=True)
    missing_items = Column(Text, nullable=True)
    uncertain_items = Column(Text, nullable=True)
    raw_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

