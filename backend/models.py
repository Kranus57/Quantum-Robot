import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, Text
from sqlalchemy.orm import relationship

try:
    from backend.database import Base
except ModuleNotFoundError:
    from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False, default="pbkdf2:sha256$hashed")
    full_name = Column(String, nullable=False)
    user_background = Column(String, default="cs-undergrad") # high-school, cs-undergrad, physics-phd
    role = Column(String, default="student") # student, admin
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    circuits = relationship("QuantumCircuitModel", back_populates="owner", cascade="all, delete-orphan")
    progress = relationship("StudentProgressModel", back_populates="user", cascade="all, delete-orphan")
    badges = relationship("BadgeModel", back_populates="user", cascade="all, delete-orphan")

class QuantumCircuitModel(Base):
    __tablename__ = "quantum_circuits"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    qubit_count = Column(Integer, default=3)
    gates_json = Column(JSON, nullable=False)  # Stores circuit gate arrays
    qasm_code = Column(Text, nullable=True)
    framework = Column(String, default="qiskit")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="circuits")

class StudentProgressModel(Base):
    __tablename__ = "student_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    lesson_id = Column(String, index=True, nullable=False)
    quiz_score = Column(Float, default=100.0)
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="progress")

class BadgeModel(Base):
    __tablename__ = "badges"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    badge_name = Column(String, nullable=False)
    description = Column(String, nullable=False)
    unlocked_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="badges")

class CohortAttemptModel(Base):
    __tablename__ = "cohort_attempts"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, index=True)
    student_name = Column(String, nullable=False)
    lesson_title = Column(String, nullable=False)
    score = Column(Float, nullable=False)
    status = Column(String, default="passed") # passed, failed
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class ModuleTestResultModel(Base):
    __tablename__ = "module_test_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    student_name = Column(String, nullable=False)
    module_id = Column(String, index=True, nullable=False)
    module_title = Column(String, nullable=False)
    mcq_score = Column(Float, nullable=False, default=0.0)
    circuit_score = Column(Float, nullable=False, default=0.0)
    code_score = Column(Float, nullable=False, default=0.0)
    total_score = Column(Float, nullable=False, default=0.0)
    max_possible_score = Column(Float, nullable=False, default=100.0)
    percentage = Column(Float, nullable=False, default=0.0)
    status = Column(String, default="passed") # passed, needs_review
    details_json = Column(JSON, nullable=True) # Full breakdown of MCQ choices, drawn circuit, and submitted code
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)

