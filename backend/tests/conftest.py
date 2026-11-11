import os
import uuid
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from starlette.testclient import TestClient

from app.db.session import Base, get_db
from app.core.security import get_password_hash
from app.main import app as fastapi_app

TEST_DB_URL = f"sqlite:///./test_{uuid.uuid4().hex}.db"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    # Import all models so Base knows about them
    import app.models  # noqa
    Base.metadata.create_all(bind=test_engine)

    # Seed demo users needed by conftest
    db = TestSessionLocal()
    from app.models.users import User
    for email, role, name in [
        ("customer@demo.com", "customer", "Demo Customer"),
        ("freelancer@demo.com", "freelancer", "Demo Freelancer"),
    ]:
        if not db.query(User).filter(User.email == email).first():
            db.add(User(email=email, hashed_password=get_password_hash("demo1234"), full_name=name, role=role))
    db.commit()
    db.close()

    fastapi_app.dependency_overrides[get_db] = override_get_db
    yield
    fastapi_app.dependency_overrides.clear()
    test_engine.dispose()
    db_path = TEST_DB_URL.replace("sqlite:///./", "")
    if os.path.exists(db_path):
        os.remove(db_path)


@pytest.fixture
def client():
    return TestClient(fastapi_app)
