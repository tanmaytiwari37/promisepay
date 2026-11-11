from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text
from datetime import datetime
from app.db.session import Base


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    deliverable_title = Column(String, nullable=True)
    evidence_url = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String, default="SUBMITTED")  # SUBMITTED
    created_at = Column(DateTime, default=datetime.utcnow)

