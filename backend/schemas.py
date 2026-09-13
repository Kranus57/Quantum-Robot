from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class GateOperationSchema(BaseModel):
    id: str
    type: str  # H, X, Y, Z, S, T, CNOT, CZ, TOFFOLI, MEASURE
    qubit: int
    targetQubit: Optional[int] = None
    control2Qubit: Optional[int] = None
    param: Optional[float] = None
    step: int

class CircuitRequestSchema(BaseModel):
    qubitCount: int = Field(default=3, ge=1, le=10)
    gates: List[GateOperationSchema]
    shots: int = Field(default=1024, ge=0, le=10000)
    framework: str = Field(default="qiskit")  # qiskit, cirq, pennylane, qbraid, native

class AIExplainRequestSchema(BaseModel):
    concept: Optional[str] = None
    query: Optional[str] = None
    userBackground: Optional[str] = "cs-undergrad"
    circuit: Optional[CircuitRequestSchema] = None

class AIDebugRequestSchema(BaseModel):
    qubitCount: int
    gates: List[GateOperationSchema]
    code: Optional[str] = None

class AIOptimizeRequestSchema(BaseModel):
    qubitCount: int
    gates: List[GateOperationSchema]

# Auth & User Schemas
class UserRegisterSchema(BaseModel):
    email: str
    password: str
    fullName: str
    userBackground: str = "cs-undergrad" # high-school, cs-undergrad, physics-phd
    role: str = "student" # student, admin

class UserLoginSchema(BaseModel):
    email: str
    password: str

class GoogleAuthSchema(BaseModel):
    email: str
    fullName: str

class TwilioSendOtpSchema(BaseModel):
    phoneNumber: str
    countryCode: str = "+1"

class TwilioVerifyOtpSchema(BaseModel):
    phoneNumber: str
    otpCode: str
    fullName: Optional[str] = "Quantum Learner"
    userBackground: Optional[str] = "cs-undergrad"

class UserResponseSchema(BaseModel):
    id: int
    email: str
    fullName: str
    userBackground: str
    role: str
    createdAt: str

class DBTableQuerySchema(BaseModel):
    tableName: str = "users"
    limit: int = 50

class ModuleTestSubmitSchema(BaseModel):
    userId: Optional[int] = 1
    studentName: Optional[str] = "Alex Rivera"
    moduleId: str
    moduleTitle: str
    mcqAnswers: Dict[str, int]  # e.g., {"q1": 1, "q2": 0, ...}
    circuitGates: List[GateOperationSchema]
    circuitQubitCount: int = 2
    codeSnippet: str

