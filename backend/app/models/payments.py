from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, UniqueConstraint
from datetime import datetime
from app.db.session import Base


class Payment(Base):
    __tablename__ = "payments"
    __table_args__ = (
        UniqueConstraint("project_id", "status", name="uq_payment_project_status"),
    )

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    paypal_order_id = Column(String, nullable=True, index=True)
    authorization_id = Column(String, nullable=True)
    capture_id = Column(String, nullable=True, unique=True)
    amount = Column(Float, nullable=False, default=0.0)
    currency = Column(String, default="USD")
    status = Column(String, default="PAYMENT_AUTHORIZED")
    mode = Column(String, default="mock")  # mock | sandbox
    idempotency_key = Column(String, nullable=True, unique=True)
    created_at = Column(DateTime, default=datetime.utcnow)
