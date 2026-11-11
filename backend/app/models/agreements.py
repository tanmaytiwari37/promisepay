from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, JSON
from datetime import datetime
from app.db.session import Base


class Agreement(Base):
    __tablename__ = "agreements"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), unique=True, nullable=False)
    deliverables = Column(JSON, nullable=True)  # list of {id, title, description}
    acceptance_criteria = Column(JSON, nullable=True)  # list of {id, deliverable_id, criterion}
    amount = Column(Float, nullable=False, default=0.0)
    deadline = Column(String, nullable=True)
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
