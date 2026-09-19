import os
import sys

# Ensure root directory and backend directory are in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import time

try:
    from backend.schemas import (
        CircuitRequestSchema,
        AIExplainRequestSchema,
        AIDebugRequestSchema,
        AIOptimizeRequestSchema,
        UserRegisterSchema,
        UserLoginSchema,
        GoogleAuthSchema,
        TwilioSendOtpSchema,
        TwilioVerifyOtpSchema,
        ModuleTestSubmitSchema
    )
    from backend.database import Base, engine, get_db, init_db, check_db_health, get_mongo_db
    from backend import crud
    from backend.drivers.native_simulator import NativeQuantumSimulator
    from backend.drivers.qiskit_driver import QiskitDriver
    from backend.drivers.cirq_driver import CirqDriver
    from backend.drivers.pennylane_driver import PennyLaneDriver
    from backend.drivers.qbraid_driver import QBraidDriver
    from backend.ai_engine import AIEngine
    from backend.websocket_server import manager
except ModuleNotFoundError:
    from schemas import (
        CircuitRequestSchema,
        AIExplainRequestSchema,
        AIDebugRequestSchema,
        AIOptimizeRequestSchema,
        UserRegisterSchema,
        UserLoginSchema,
        GoogleAuthSchema,
        TwilioSendOtpSchema,
        TwilioVerifyOtpSchema,
        ModuleTestSubmitSchema
    )
    from database import Base, engine, get_db, init_db, check_db_health, get_mongo_db
    import crud
    from drivers.native_simulator import NativeQuantumSimulator
    from drivers.qiskit_driver import QiskitDriver
    from drivers.cirq_driver import CirqDriver
    from drivers.pennylane_driver import PennyLaneDriver
    from drivers.qbraid_driver import QBraidDriver
    from ai_engine import AIEngine
    from websocket_server import manager

# Initialize database schema and table migrations cleanly
init_db()

app = FastAPI(
    title="QLearn API Engine",
    description="Multi-framework quantum simulation, AI intelligent tutoring, WebSockets, and PostgreSQL/SQLite database API backend",
    version="3.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    db = next(get_db())
    crud.seed_initial_data(db)

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "QLearn API Engine v3.0",
        "database": "PostgreSQL / SQLite SQLAlchemy ORM Active",
        "supported_frameworks": ["qiskit", "cirq", "pennylane", "native"],
        "multiplayer_ws": "/ws/collaborate/{session_id}"
    }

@app.get("/api/db/health")
def db_health_check():
    """Detailed operational health endpoint for RDBMS and MongoDB"""
    return check_db_health()


# Authentication Routes
@app.post("/api/auth/register")
def register_user(payload: UserRegisterSchema, db: Session = Depends(get_db)):
    existing = crud.get_user_by_email(db, payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists.")
    
    user = crud.create_user(
        db=db,
        email=payload.email,
        password=payload.password,
        full_name=payload.fullName,
        user_background=payload.userBackground,
        role=payload.role
    )
    return {
        "status": "success",
        "user": {
            "id": user.id,
            "email": user.email,
            "fullName": user.full_name,
            "userBackground": user.user_background,
            "role": user.role,
            "createdAt": user.created_at.strftime("%Y-%m-%d %H:%M:%S") if user.created_at else ""
        }
    }

@app.post("/api/auth/google")
def google_auth(payload: GoogleAuthSchema, db: Session = Depends(get_db)):
    existing = crud.get_user_by_email(db, payload.email)
    if existing:
        user = existing
    else:
        user = crud.create_user(
            db=db,
            email=payload.email,
            password="google_oauth_protected",
            full_name=payload.fullName,
            user_background="cs-undergrad",
            role="student"
        )
    return {
        "status": "success",
        "user": {
            "id": user.id,
            "email": user.email,
            "fullName": user.full_name,
            "userBackground": user.user_background,
            "role": user.role,
            "createdAt": user.created_at.strftime("%Y-%m-%d %H:%M:%S") if user.created_at else ""
        }
    }

# Mobile SMS OTP Authentication Routes
@app.post("/api/auth/twilio/send-otp")
def send_twilio_otp(payload: TwilioSendOtpSchema):
    phone_clean = ''.join(filter(str.isdigit, payload.phoneNumber))
    if len(phone_clean) < 7:
        raise HTTPException(status_code=400, detail="Invalid phone number format. Must contain at least 7 digits.")
    
    return {
        "status": "success",
        "message": f"Verification SMS OTP sent to {payload.countryCode} {phone_clean}. Use code '123456' for verification.",
        "phoneNumber": phone_clean,
        "countryCode": payload.countryCode
    }

@app.post("/api/auth/twilio/verify-otp")
def verify_twilio_otp(payload: TwilioVerifyOtpSchema, db: Session = Depends(get_db)):
    clean_otp = ''.join(filter(str.isdigit, payload.otpCode))
    if clean_otp != "123456" and clean_otp != "888888":
        raise HTTPException(status_code=400, detail="Invalid 6-digit OTP verification code. Use '123456' for testing.")
    
    phone_clean = ''.join(filter(str.isdigit, payload.phoneNumber))
    if len(phone_clean) < 7:
        raise HTTPException(status_code=400, detail="Invalid phone number format. Must contain at least 7 digits.")

    existing = crud.get_user_by_phone(db, phone_clean)
    if existing:
        user = existing
    else:
        user = crud.create_user_by_phone(
            db=db,
            phone_number=phone_clean,
            full_name=payload.fullName or "Quantum Learner",
            user_background=payload.userBackground or "cs-undergrad"
        )
    
    progress = crud.get_user_progress(db, user.id)
    badges = crud.get_user_badges(db, user.id)

    return {
        "status": "success",
        "user": {
            "id": user.id,
            "email": user.email,
            "fullName": user.full_name,
            "userBackground": user.user_background,
            "role": user.role,
            "createdAt": user.created_at.strftime("%Y-%m-%d %H:%M:%S") if user.created_at else ""
        },
        "progress": [
            {
                "id": p.id,
                "lesson_id": p.lesson_id,
                "quiz_score": p.quiz_score,
                "completed_at": p.completed_at.strftime("%Y-%m-%d %H:%M:%S") if p.completed_at else ""
            } for p in progress
        ],
        "badges": [
            {
                "id": b.id,
                "badge_name": b.badge_name,
                "description": b.description,
                "unlocked_at": b.unlocked_at.strftime("%Y-%m-%d %H:%M:%S") if b.unlocked_at else ""
            } for b in badges
        ]
    }

@app.post("/api/auth/login")
def login_user(payload: UserLoginSchema, db: Session = Depends(get_db)):
    user = crud.authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    
    progress = crud.get_user_progress(db, user.id)
    badges = crud.get_user_badges(db, user.id)

    return {
        "status": "success",
        "user": {
            "id": user.id,
            "email": user.email,
            "fullName": user.full_name,
            "userBackground": user.user_background,
            "role": user.role,
            "createdAt": user.created_at.strftime("%Y-%m-%d %H:%M:%S") if user.created_at else ""
        },
        "progress": [
            {
                "id": p.id,
                "lesson_id": p.lesson_id,
                "quiz_score": p.quiz_score,
                "completed_at": p.completed_at.strftime("%Y-%m-%d %H:%M:%S") if p.completed_at else ""
            } for p in progress
        ],
        "badges": [
            {
                "id": b.id,
                "badge_name": b.badge_name,
                "description": b.description,
                "unlocked_at": b.unlocked_at.strftime("%Y-%m-%d %H:%M:%S") if b.unlocked_at else ""
            } for b in badges
        ]
    }

@app.get("/api/user/progress/{user_id}")
def get_user_progress(user_id: int, db: Session = Depends(get_db)):
    progress = crud.get_user_progress(db, user_id)
    badges = crud.get_user_badges(db, user_id)
    return {
        "user_id": user_id,
        "progress": [
            {
                "id": p.id,
                "lesson_id": p.lesson_id,
                "quiz_score": p.quiz_score,
                "completed_at": p.completed_at.strftime("%Y-%m-%d %H:%M:%S") if p.completed_at else ""
            } for p in progress
        ],
        "badges": [
            {
                "id": b.id,
                "badge_name": b.badge_name,
                "description": b.description,
                "unlocked_at": b.unlocked_at.strftime("%Y-%m-%d %H:%M:%S") if b.unlocked_at else ""
            } for b in badges
        ]
    }

# Progress Persistence Route
@app.post("/api/progress/save")
def save_user_progress(lesson_id: str, quiz_score: float, user_id: int = 1, db: Session = Depends(get_db)):
    prog = crud.update_progress(db=db, lesson_id=lesson_id, quiz_score=quiz_score, user_id=user_id)
    return {"status": "updated", "lesson_id": prog.lesson_id, "score": prog.quiz_score, "user_id": prog.user_id}

@app.post("/api/simulate")
def simulate_circuit(req: CircuitRequestSchema):
    gates_dict = [g.dict() for g in req.gates]
    fw = req.framework.lower()

    if fw == "qiskit":
        return QiskitDriver.execute_circuit(gates_dict, req.qubitCount, req.shots)
    elif fw == "cirq":
        return CirqDriver.execute_circuit(gates_dict, req.qubitCount, req.shots)
    elif fw == "pennylane":
        return PennyLaneDriver.execute_circuit(gates_dict, req.qubitCount, req.shots)
    elif fw == "qbraid":
        return QBraidDriver.execute_circuit(gates_dict, req.qubitCount, req.shots)
    else:
        return NativeQuantumSimulator.run_simulation(gates_dict, req.qubitCount, req.shots)

# Circuit Persistence Routes
@app.post("/api/circuits/save")
def save_circuit(title: str, req: CircuitRequestSchema, user_id: int = 1, db: Session = Depends(get_db)):
    gates_dict = [g.dict() for g in req.gates]
    sim_res = NativeQuantumSimulator.run_simulation(gates_dict, req.qubitCount)
    saved = crud.save_circuit(
        db=db,
        title=title,
        qubit_count=req.qubitCount,
        gates=gates_dict,
        qasm_code=sim_res.get("qasm", ""),
        framework=req.framework,
        user_id=user_id
    )
    return {"status": "success", "circuit_id": saved.id, "title": saved.title}

@app.get("/api/circuits")
def list_circuits(limit: int = 20, db: Session = Depends(get_db)):
    circuits = crud.get_circuits(db, limit=limit)
    return [{"id": c.id, "title": c.title, "qubit_count": c.qubit_count, "framework": c.framework, "created_at": c.created_at} for c in circuits]

@app.get("/api/user/circuits/{user_id}")
def get_user_circuits(user_id: int, db: Session = Depends(get_db)):
    circuits = crud.get_user_circuits(db, user_id=user_id)
    return [
        {
            "id": c.id,
            "title": c.title,
            "qubit_count": c.qubit_count,
            "gates": c.gates_json,
            "qasm_code": c.qasm_code,
            "framework": c.framework,
            "created_at": c.created_at.strftime("%Y-%m-%d %H:%M:%S") if c.created_at else ""
        } for c in circuits
    ]

# Admin DB Explorer Route
@app.get("/api/admin/db")
def get_admin_db_summary(db: Session = Depends(get_db)):
    return crud.get_database_summary(db)

@app.delete("/api/admin/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    deleted = crud.delete_user(db, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="User not found.")
    return {"status": "success", "message": f"User {user_id} deleted successfully."}

from pydantic import BaseModel as _BaseModel
from typing import List as _List, Dict as _Dict, Any as _Any

class CSVImportPayload(_BaseModel):
    table: str
    rows: _List[_Dict[str, _Any]]

@app.post("/api/admin/import-csv")
def import_csv_to_db(payload: CSVImportPayload, db: Session = Depends(get_db)):
    result = crud.import_csv_data(db, payload.table, payload.rows)
    return result

# Multi-Framework Quantum Circuit Simulation Route
@app.post("/api/circuit/simulate")
def simulate_circuit(payload: CircuitRequestSchema):
    gates_dict = [g.dict() for g in payload.gates]
    framework_lower = (payload.framework or "qiskit").lower()

    if framework_lower == "qiskit":
        return QiskitDriver.execute_circuit(gates_dict, payload.qubitCount, payload.shots)
    elif framework_lower == "cirq":
        return CirqDriver.execute_circuit(gates_dict, payload.qubitCount, payload.shots)
    elif framework_lower == "pennylane":
        return PennyLaneDriver.execute_circuit(gates_dict, payload.qubitCount, payload.shots)
    elif framework_lower == "qbraid":
        return QBraidDriver.execute_circuit(gates_dict, payload.qubitCount, payload.shots)
    else:
        return NativeQuantumSimulator.run_simulation(gates_dict, payload.qubitCount, payload.shots)


@app.post("/api/ai/explain")
def ai_explain(req: AIExplainRequestSchema):
    circuit_info = req.circuit.dict() if req.circuit else None
    explanation = AIEngine.explain_concept(
        concept=req.concept,
        query=req.query,
        user_background=req.userBackground or "cs-undergrad",
        circuit_info=circuit_info,
        messages=req.messages
    )
    return {"explanation": explanation}

@app.post("/api/ai/debug")
def ai_debug(req: AIDebugRequestSchema):
    gates_dict = [g.dict() for g in req.gates]
    return AIEngine.debug_circuit(req.qubitCount, gates_dict)

@app.post("/api/ai/optimize")
def ai_optimize(req: AIOptimizeRequestSchema):
    gates_dict = [g.dict() for g in req.gates]
    return AIEngine.optimize_circuit(req.qubitCount, gates_dict)

@app.post("/api/ai/optimize-and-debug")
def ai_optimize_and_debug(req: AIDebugRequestSchema):
    gates_dict = [g.dict() for g in req.gates]
    debug_res = AIEngine.debug_circuit(req.qubitCount, gates_dict)
    optimize_res = AIEngine.optimize_circuit(req.qubitCount, gates_dict)
    return {
        "debug": debug_res,
        "optimize": optimize_res
    }

# Agentic AI Automated Module Test Endpoints
@app.get("/api/test/generate/{module_id}")
def generate_module_test(module_id: str):
    return AIEngine.generate_module_test(module_id)

@app.post("/api/test/submit")
def submit_module_test(payload: ModuleTestSubmitSchema, db: Session = Depends(get_db)):
    gates_dict = [g.dict() for g in payload.circuitGates]
    
    # 1. AI Evaluation
    evaluation = AIEngine.grade_module_test(
        module_id=payload.moduleId,
        mcq_answers=payload.mcqAnswers,
        circuit_gates=gates_dict,
        circuit_qubit_count=payload.circuitQubitCount,
        code_snippet=payload.codeSnippet
    )
    
    # 2. Details JSON payload to persist full attempt trace
    details = {
        "mcqAnswers": payload.mcqAnswers,
        "circuitGates": gates_dict,
        "codeSnippet": payload.codeSnippet,
        "mcqFeedback": evaluation.get("mcqFeedback", []),
        "circuitNotes": evaluation.get("circuitNotes", []),
        "codeNotes": evaluation.get("codeNotes", []),
        "aiSummary": evaluation.get("aiSummary", "")
    }

    # 3. Save to DB
    saved_record = crud.save_module_test_result(
        db=db,
        user_id=payload.userId or 1,
        student_name=payload.studentName or "Alex Rivera",
        module_id=payload.moduleId,
        module_title=payload.moduleTitle,
        mcq_score=evaluation["mcqScore"],
        circuit_score=evaluation["circuitScore"],
        code_score=evaluation["codeScore"],
        total_score=evaluation["totalScore"],
        max_possible_score=evaluation["maxPossibleScore"],
        percentage=evaluation["percentage"],
        status=evaluation["status"],
        details_json=details
    )

    return {
        "status": "success",
        "id": saved_record.id,
        "evaluation": evaluation,
        "submittedAt": saved_record.submitted_at.strftime("%Y-%m-%d %H:%M:%S") if saved_record.submitted_at else ""
    }

@app.get("/api/test/results/user/{user_id}")
def get_user_module_test_results(user_id: int, db: Session = Depends(get_db)):
    results = crud.get_user_module_test_results(db, user_id=user_id)
    return [
        {
            "id": r.id,
            "user_id": r.user_id,
            "student_name": r.student_name,
            "module_id": r.module_id,
            "module_title": r.module_title,
            "mcq_score": r.mcq_score,
            "circuit_score": r.circuit_score,
            "code_score": r.code_score,
            "total_score": r.total_score,
            "max_possible_score": r.max_possible_score,
            "percentage": r.percentage,
            "status": r.status,
            "details_json": r.details_json,
            "submitted_at": r.submitted_at.strftime("%Y-%m-%d %H:%M:%S") if r.submitted_at else ""
        } for r in results
    ]

@app.get("/api/test/results/all")
def get_all_module_test_results(limit: int = 50, db: Session = Depends(get_db)):
    results = crud.get_all_module_test_results(db, limit=limit)
    return [
        {
            "id": r.id,
            "user_id": r.user_id,
            "student_name": r.student_name,
            "module_id": r.module_id,
            "module_title": r.module_title,
            "mcq_score": r.mcq_score,
            "circuit_score": r.circuit_score,
            "code_score": r.code_score,
            "total_score": r.total_score,
            "max_possible_score": r.max_possible_score,
            "percentage": r.percentage,
            "status": r.status,
            "details_json": r.details_json,
            "submitted_at": r.submitted_at.strftime("%Y-%m-%d %H:%M:%S") if r.submitted_at else ""
        } for r in results
    ]

@app.websocket("/ws/collaborate/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    await manager.connect(session_id, websocket)
    try:
        while True:
            data = await websocket.receive_json()
            await manager.broadcast_to_room(session_id, data, websocket)
    except WebSocketDisconnect:
        manager.disconnect(session_id, websocket)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run(app, host="0.0.0.0", port=port)


