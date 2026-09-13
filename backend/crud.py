import uuid
import hashlib
import datetime
from sqlalchemy.orm import Session

try:
    from backend.models import User, QuantumCircuitModel, StudentProgressModel, BadgeModel, CohortAttemptModel, ModuleTestResultModel
except ModuleNotFoundError:
    from models import User, QuantumCircuitModel, StudentProgressModel, BadgeModel, CohortAttemptModel, ModuleTestResultModel


def _hash_pass(password: str) -> str:
    return hashlib.sha256(password.encode('utf-8')).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return _hash_pass(password) == hashed

def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == str(email).lower().strip()).first()

def get_user_by_phone(db: Session, phone_number: str):
    clean_phone = str(phone_number).strip()
    return db.query(User).filter(User.email == f"{clean_phone}@phone.quantumedu.ai").first()

def create_user_account(db: Session, email: str, password: str, full_name: str, background: str = "cs-undergrad", role: str = "student"):
    email_clean = str(email).lower().strip()
    existing = get_user_by_email(db, email_clean)
    if existing:
        return existing

    hashed = _hash_pass(password)
    db_user = User(
        email=email_clean,
        password_hash=hashed,
        full_name=full_name,
        user_background=background,
        role=role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_user(db: Session, email: str, password: str, full_name: str, user_background: str = "cs-undergrad", role: str = "student"):
    return create_user_account(db, email, password, full_name, user_background, role)

def create_user_by_phone(db: Session, phone_number: str, full_name: str = "Quantum Learner", user_background: str = "cs-undergrad"):
    clean_phone = ''.join(filter(str.isdigit, str(phone_number)))
    pseudo_email = f"{clean_phone}@phone.quantumedu.ai"
    display_name = full_name if clean_phone in full_name else f"{full_name} ({clean_phone})"
    return create_user_account(
        db=db,
        email=pseudo_email,
        password="sms_otp_authenticated",
        full_name=display_name,
        background=user_background,
        role="student"
    )


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

def seed_initial_data(db: Session):
    """Seed default Admin and Student accounts if empty"""
    admin = get_user_by_email(db, "admin@quantumedu.ai")
    if not admin:
        create_user_account(
            db=db,
            email="admin@quantumedu.ai",
            password="admin123",
            full_name="Quantum Edu Administrator",
            background="physics-phd",
            role="admin"
        )

    student = get_user_by_email(db, "alex@quantumedu.ai")
    if not student:
        st_user = create_user_account(
            db=db,
            email="alex@quantumedu.ai",
            password="student123",
            full_name="Alex Rivera",
            background="cs-undergrad",
            role="student"
        )
        # Seed progress for Alex
        update_progress(db, lesson_id="lesson_1", quiz_score=100.0, user_id=st_user.id)
        update_progress(db, lesson_id="lesson_2", quiz_score=90.0, user_id=st_user.id)
        # Seed initial badge
        badge = BadgeModel(
            id=f"badge_{uuid.uuid4().hex[:6]}",
            user_id=st_user.id,
            badge_name="Superposition Explorer",
            description="Successfully generated Hadamard state vector superposition!"
        )
        db.add(badge)
        db.commit()

def save_circuit(db: Session, title: str, qubit_count: int, gates: list, qasm_code: str, framework: str = "qiskit", user_id: int = None):
    circuit_id = f"circ_{uuid.uuid4().hex[:8]}"
    db_circuit = QuantumCircuitModel(
        id=circuit_id,
        title=title,
        user_id=user_id,
        qubit_count=qubit_count,
        gates_json=gates,
        qasm_code=qasm_code,
        framework=framework
    )
    db.add(db_circuit)
    db.commit()
    db.refresh(db_circuit)
    return db_circuit

def get_circuits(db: Session, limit: int = 20):
    return db.query(QuantumCircuitModel).order_by(QuantumCircuitModel.created_at.desc()).limit(limit).all()

def get_user_circuits(db: Session, user_id: int, limit: int = 10):
    return db.query(QuantumCircuitModel).filter(QuantumCircuitModel.user_id == user_id).order_by(QuantumCircuitModel.created_at.desc()).limit(limit).all()

def update_progress(db: Session, lesson_id: str, quiz_score: float, user_id: int = None):
    db_progress = StudentProgressModel(
        user_id=user_id,
        lesson_id=lesson_id,
        quiz_score=quiz_score
    )
    db.add(db_progress)
    db.commit()
    db.refresh(db_progress)
    return db_progress

def get_user_progress(db: Session, user_id: int):
    return db.query(StudentProgressModel).filter(StudentProgressModel.user_id == user_id).all()

def get_user_badges(db: Session, user_id: int):
    return db.query(BadgeModel).filter(BadgeModel.user_id == user_id).all()

def get_cohort_attempts(db: Session, limit: int = 10):
    attempts = db.query(CohortAttemptModel).order_by(CohortAttemptModel.timestamp.desc()).limit(limit).all()
    if not attempts:
        mock_attempts = [
            CohortAttemptModel(student_id="st_101", student_name="Alex Rivera", lesson_title="2. Quantum Entanglement & Bell States", score=100, status="passed"),
            CohortAttemptModel(student_id="st_102", student_name="Maya Patel", lesson_title="4. Grover’s Quantum Search Algorithm", score=60, status="failed"),
            CohortAttemptModel(student_id="st_103", student_name="Jordan Chen", lesson_title="1. Qubit Fundamentals & Superposition", score=100, status="passed"),
        ]
        for ma in mock_attempts:
            db.add(ma)
        db.commit()
        return mock_attempts
    return attempts

def save_module_test_result(
    db: Session,
    user_id: int,
    student_name: str,
    module_id: str,
    module_title: str,
    mcq_score: float,
    circuit_score: float,
    code_score: float,
    total_score: float,
    max_possible_score: float,
    percentage: float,
    status: str,
    details_json: dict
):
    result = ModuleTestResultModel(
        user_id=user_id,
        student_name=student_name,
        module_id=module_id,
        module_title=module_title,
        mcq_score=mcq_score,
        circuit_score=circuit_score,
        code_score=code_score,
        total_score=total_score,
        max_possible_score=max_possible_score,
        percentage=percentage,
        status=status,
        details_json=details_json
    )
    db.add(result)
    db.commit()
    db.refresh(result)
    return result

def get_user_module_test_results(db: Session, user_id: int):
    return db.query(ModuleTestResultModel).filter(ModuleTestResultModel.user_id == user_id).order_by(ModuleTestResultModel.submitted_at.desc()).all()

def get_all_module_test_results(db: Session, limit: int = 50):
    return db.query(ModuleTestResultModel).order_by(ModuleTestResultModel.submitted_at.desc()).limit(limit).all()

def get_database_summary(db: Session):
    """Retrieve counts and table rows for Admin DB Explorer"""
    users = db.query(User).order_by(User.created_at.desc()).all()
    circuits = db.query(QuantumCircuitModel).order_by(QuantumCircuitModel.created_at.desc()).all()
    progress = db.query(StudentProgressModel).order_by(StudentProgressModel.completed_at.desc()).all()
    badges = db.query(BadgeModel).order_by(BadgeModel.unlocked_at.desc()).all()
    attempts = db.query(CohortAttemptModel).order_by(CohortAttemptModel.timestamp.desc()).all()
    test_results = db.query(ModuleTestResultModel).order_by(ModuleTestResultModel.submitted_at.desc()).all()

    return {
        "stats": {
            "total_users": len(users),
            "total_circuits": len(circuits),
            "total_progress_records": len(progress),
            "total_badges": len(badges),
            "total_attempts": len(attempts),
            "total_module_tests": len(test_results),
            "db_engine": "SQLite / PostgreSQL (SQLAlchemy ORM Active)"
        },
        "tables": {
            "users": [
                {
                    "id": u.id,
                    "email": u.email,
                    "full_name": u.full_name,
                    "role": u.role,
                    "background": u.user_background,
                    "created_at": u.created_at.strftime("%Y-%m-%d %H:%M:%S") if u.created_at else ""
                } for u in users
            ],
            "quantum_circuits": [
                {
                    "id": c.id,
                    "title": c.title,
                    "user_id": c.user_id,
                    "qubit_count": c.qubit_count,
                    "framework": c.framework,
                    "gates_count": len(c.gates_json) if isinstance(c.gates_json, list) else 0,
                    "created_at": c.created_at.strftime("%Y-%m-%d %H:%M:%S") if c.created_at else ""
                } for c in circuits
            ],
            "student_progress": [
                {
                    "id": p.id,
                    "user_id": p.user_id,
                    "lesson_id": p.lesson_id,
                    "quiz_score": p.quiz_score,
                    "completed_at": p.completed_at.strftime("%Y-%m-%d %H:%M:%S") if p.completed_at else ""
                } for p in progress
            ],
            "badges": [
                {
                    "id": b.id,
                    "user_id": b.user_id,
                    "badge_name": b.badge_name,
                    "description": b.description,
                    "unlocked_at": b.unlocked_at.strftime("%Y-%m-%d %H:%M:%S") if b.unlocked_at else ""
                } for b in badges
            ],
            "cohort_attempts": [
                {
                    "id": a.id,
                    "student_id": a.student_id,
                    "student_name": a.student_name,
                    "lesson_title": a.lesson_title,
                    "score": a.score,
                    "status": a.status,
                    "timestamp": a.timestamp.strftime("%Y-%m-%d %H:%M:%S") if a.timestamp else ""
                } for a in attempts
            ],
            "module_test_results": [
                {
                    "id": t.id,
                    "user_id": t.user_id,
                    "student_name": t.student_name,
                    "module_id": t.module_id,
                    "module_title": t.module_title,
                    "mcq_score": t.mcq_score,
                    "circuit_score": t.circuit_score,
                    "code_score": t.code_score,
                    "total_score": t.total_score,
                    "percentage": t.percentage,
                    "status": t.status,
                    "submitted_at": t.submitted_at.strftime("%Y-%m-%d %H:%M:%S") if t.submitted_at else ""
                } for t in test_results
            ]
        }
    }

def delete_user(db: Session, user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        db.delete(user)
        db.commit()
        return True
    return False

def import_csv_data(db: Session, table: str, rows: list):
    """Batch insert or update records from uploaded CSV rows into the database."""
    inserted_count = 0
    updated_count = 0
    errors = []

    for idx, row in enumerate(rows):
        try:
            if table == "users":
                email = str(row.get("email") or "").lower().strip()
                if not email:
                    continue
                full_name = str(row.get("full_name") or row.get("name") or "Enrolled Student").strip()
                background = str(row.get("background") or row.get("user_background") or "cs-undergrad").strip()
                role = str(row.get("role") or "student").strip().lower()
                password = str(row.get("password") or "student123").strip()

                existing = get_user_by_email(db, email)
                if existing:
                    existing.full_name = full_name
                    existing.user_background = background
                    existing.role = role
                    updated_count += 1
                else:
                    create_user_account(db, email=email, password=password, full_name=full_name, background=background, role=role)
                    inserted_count += 1

            elif table == "cohort_attempts":
                student_name = str(row.get("student_name") or row.get("name") or "Student").strip()
                lesson_title = str(row.get("lesson_title") or row.get("lesson") or "Lesson 1: Superposition").strip()
                score_val = float(row.get("score") or row.get("quiz_score") or 100)
                status = str(row.get("status") or ("passed" if score_val >= 70 else "review")).strip()
                attempt = CohortAttemptModel(
                    student_id=str(row.get("student_id") or uuid.uuid4().hex[:6]),
                    student_name=student_name,
                    lesson_title=lesson_title,
                    score=score_val,
                    status=status
                )
                db.add(attempt)
                inserted_count += 1

            elif table == "student_progress":
                user_id = row.get("user_id")
                if not user_id and row.get("email"):
                    u = get_user_by_email(db, str(row["email"]).strip())
                    if u:
                        user_id = u.id
                lesson_id = str(row.get("lesson_id") or "lesson_1").strip()
                quiz_score = float(row.get("quiz_score") or 100)
                prog = StudentProgressModel(
                    user_id=int(user_id) if user_id else None,
                    lesson_id=lesson_id,
                    quiz_score=quiz_score
                )
                db.add(prog)
                inserted_count += 1

            elif table == "module_test_results":
                student_name = str(row.get("student_name") or "Student").strip()
                module_id = str(row.get("module_id") or "m1").strip()
                module_title = str(row.get("module_title") or "Quantum Module Assessment").strip()
                mcq_score = float(row.get("mcq_score") or 35)
                circuit_score = float(row.get("circuit_score") or 25)
                code_score = float(row.get("code_score") or 25)
                total_score = mcq_score + circuit_score + code_score
                percentage = round((total_score / 100.0) * 100.0)
                status = str(row.get("status") or ("passed" if percentage >= 60 else "review")).strip()
                test_model = ModuleTestResultModel(
                    student_name=student_name,
                    module_id=module_id,
                    module_title=module_title,
                    mcq_score=mcq_score,
                    circuit_score=circuit_score,
                    code_score=code_score,
                    total_score=total_score,
                    max_possible_score=100.0,
                    percentage=percentage,
                    status=status
                )
                db.add(test_model)
                inserted_count += 1

        except Exception as e:
            errors.append(f"Row {idx + 1}: {str(e)}")

    db.commit()
    return {
        "status": "success",
        "inserted_count": inserted_count,
        "updated_count": updated_count,
        "errors": errors,
        "message": f"Successfully processed {inserted_count} new record(s) and updated {updated_count} record(s)."
    }

