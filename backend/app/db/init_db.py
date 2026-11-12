from app.db.session import engine, SessionLocal, Base
from app.models.users import User
from app.core.security import get_password_hash
# Import all models to ensure they are registered with Base
import app.models  # noqa


def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        demo_customer = db.query(User).filter(User.email == "customer@demo.com").first()
        if not demo_customer:
            customer = User(
                email="customer@demo.com",
                hashed_password=get_password_hash("demo1234"),
                full_name="Riya Sharma",
                role="customer"
            )
            db.add(customer)

        demo_freelancer = db.query(User).filter(User.email == "freelancer@demo.com").first()
        if not demo_freelancer:
            freelancer = User(
                email="freelancer@demo.com",
                hashed_password=get_password_hash("demo1234"),
                full_name="Arjun Mehta",
                role="freelancer"
            )
            db.add(freelancer)

        db.commit()
    finally:
        db.close()

