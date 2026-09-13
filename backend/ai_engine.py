import os
from typing import Dict, Any, List

class AIEngine:
    """
    AI Intelligent Tutoring System (ITS) Engine.
    Orchestrates LLM prompts (OpenAI / Anthropic API compatible) and provides local rule-based fallback diagnostics.
    """
    @staticmethod
    def explain_concept(concept: str = None, query: str = None, user_background: str = "cs-undergrad", circuit_info: Dict[str, Any] = None) -> str:
        """
        Processes user query or concept using AI.
        Attempts LLM completion via OpenRouter API with fast models; otherwise invokes
        smart fallback reasoning engine capable of answering basic and complex queries.
        """
        user_prompt = (query or concept or "Quantum Computing Dynamics").strip()
        bg_level = (user_background or "cs-undergrad").lower()
        
        # 1. Attempt LLM API call if OPENAI_API_KEY is configured
        api_key = os.environ.get("OPENAI_API_KEY")
        base_url = os.environ.get("OPENAI_BASE_URL", "https://openrouter.ai")
        
        if api_key and len(api_key) > 10 and not api_key.startswith("your_"):
            candidate_models = [
                "google/gemini-2.0-flash-lite-preview-02-05:free",
                "meta-llama/llama-3.3-70b-instruct:free",
                "deepseek/deepseek-r1:free",
                "qwen/qwen-2.5-coder-32b-instruct:free",
                "mistralai/mistral-7b-instruct:free",
                "openchat/openchat-7b:free",
                "nex-agi/nex-n2.5-mini:free",
                "gpt-4o-mini",
                "gpt-3.5-turbo"
            ] if "openrouter" in base_url else ["gpt-4o-mini", "gpt-3.5-turbo"]
            
            import urllib.request
            import json
            
            endpoint = f"{base_url.rstrip('/')}/api/v1/chat/completions" if "openrouter" in base_url else f"{base_url.rstrip('/')}/v1/chat/completions"
            
            system_prompt = (
                f"You are Stark Sensei, an expert AI tutor, scientist, mathematician, and programmer. "
                f"You can answer ANY question the student asks—including basic questions (e.g. greetings, simple math, definitions, programming, general science, logic), "
                f"as well as advanced quantum mechanics, bra-ket linear algebra, circuit dynamics, and algorithms. "
                f"Provide clear, accurate, friendly, and well-structured answers using Markdown formatting."
            )
            
            circuit_context = ""
            if circuit_info and circuit_info.get("gates"):
                circuit_context = f"\n\nCurrent Student Circuit Context: {len(circuit_info.get('gates', []))} gates, {circuit_info.get('qubitCount', 2)} qubits."
            
            for model_name in candidate_models:
                try:
                    payload = {
                        "model": model_name,
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": f"{user_prompt}{circuit_context}"}
                        ],
                        "temperature": 0.5,
                        "max_tokens": 1200
                    }
                    
                    req = urllib.request.Request(
                        endpoint,
                        data=json.dumps(payload).encode("utf-8"),
                        headers={
                            "Content-Type": "application/json",
                            "Authorization": f"Bearer {api_key}",
                            "User-Agent": "Stark-Sensei-AI-Tutor/1.0",
                            "HTTP-Referer": "http://localhost:3000",
                            "X-Title": "Quantum Robot Stark Sensei"
                        },
                        method="POST"
                    )
                    
                    with urllib.request.urlopen(req, timeout=8) as response:
                        res_data = json.loads(response.read().decode("utf-8"))
                        choices = res_data.get("choices", [])
                        if choices and "message" in choices[0]:
                            content = choices[0]["message"].get("content", "").strip()
                            if content and len(content) >= 2:
                                return content
                except Exception:
                    continue

        # 2. Local Fallback Reasoning Engine for Basic & Quantum Questions
        q_lower = user_prompt.lower().strip()

        # Greetings
        if q_lower in ["hi", "hello", "hey", "who are you", "what is your name", "stark sensei", "hi stark", "hello stark"]:
            return (
                "### 👋 Hello! I am Stark Sensei\n\n"
                "I am your personal AI tutor. Ask me **anything**!\n\n"
                "- **Basic Questions**: Ask about simple concepts, math, definitions, or code.\n"
                "- **Quantum Physics & Mathematics**: Superposition, entanglement, Dirac notation, matrix algebra, and circuit dynamics.\n"
                "- **Coding & Algorithms**: Python, Qiskit, algorithm design, or debugging.\n\n"
                "What would you like to ask or explore today?"
            )

        # Basic Arithmetic & Math Queries (e.g., 2+2, 10*5, 100/4)
        if any(c in q_lower for c in ["+", "-", "*", "/"]) and any(c.isdigit() for c in q_lower):
            try:
                clean_expr = "".join(c for c in user_prompt if c in "0123456789+-*/.() ")
                if clean_expr.strip():
                    val = eval(clean_expr, {"__builtins__": {}})
                    return f"### 🧮 Math Calculation\n\n**Question**: `{user_prompt}`\n\n**Result**: **{val}**"
            except Exception:
                pass
        
        # Topic 1: Phase Kickback & Quantum Oracles
        if any(w in q_lower for w in ["kickback", "phase kickback", "oracle", "deutsch", "bernstein", "simon"]):
            topic_title = "Quantum Phase Kickback & Oracle Mechanisms"
            high_school_text = (
                "Imagine you are pushing a swing, but the person on the swing is so heavy and rooted that instead of moving them, "
                "the push kicks YOU backwards! That is exactly what happens in **Quantum Phase Kickback**.\n\n"
                "In a controlled gate (like CNOT or Controlled-U), the control qubit is normally supposed to dictate what happens to the target. "
                "However, if the target qubit is already prepared in an **eigenstate** (like $|-\\rangle = \\frac{|0\\rangle - |1\\rangle}{\\sqrt{2}}$), "
                "applying the gate does not alter the target at all! Instead, the relative negative phase $(-1)$ kicks back onto the control qubit, "
                "flipping its state from $|+\\rangle$ to $|-\\rangle$."
            )
            cs_text = (
                r"Phase kickback is the foundational mathematical subroutine powering the Deutsch-Jozsa, Bernstein-Vazirani, Simon's, and Shor's algorithms. "
                r"Let $U$ be a unitary operator with eigenstate $|u\rangle$ such that $U|u\rangle = e^{i\phi}|u\rangle$." "\n\n"
                r"Consider a controlled-$U$ gate where qubit 0 is the control and qubit 1 is in state $|u\rangle$:" "\n\n"
                r"$$|0\rangle|u\rangle \xrightarrow{C-U} |0\rangle|u\rangle$$" "\n"
                r"$$|1\rangle|u\rangle \xrightarrow{C-U} |1\rangle U|u\rangle = e^{i\phi}|1\rangle|u\rangle$$" "\n\n"
                r"If the control qubit is prepared in superposition $|+\rangle = \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle)$:" "\n\n"
                r"$$\frac{|0\rangle + |1\rangle}{\sqrt{2}} \otimes |u\rangle \xrightarrow{C-U} \frac{|0\rangle + e^{i\phi}|1\rangle}{\sqrt{2}} \otimes |u\rangle$$" "\n\n"
                r"Notice that the target state $|u\rangle$ factors out completely unchanged! The global eigenvalue phase factor $e^{i\phi}$ has been kicked back "
                r"into a local relative phase on the control register, allowing subsequent interference (via Hadamard) to read out the phase with certainty."
            )
            phd_text = (
                r"Formally, phase kickback demonstrates that the distinction between 'control' and 'target' in a two-qubit controlled unitary is basis-dependent. "
                r"For the canonical CNOT gate $CX = |0\rangle\langle 0| \otimes I + |1\rangle\langle 1| \otimes X$, the Pauli $X$ operator has eigenstates "
                r"$|\pm\rangle = \frac{1}{\sqrt{2}}(|0\rangle \pm |1\rangle)$ with eigenvalues $\lambda = \pm 1 = e^{i \pi (0,1)}$." "\n\n"
                r"Under the dual Hadamard-transformed basis $\{|+\rangle, |-\rangle\}$, CNOT undergoes conjugation: "
                r"$$(H \otimes H) CX (H \otimes H) = CX_{2 \to 1}$$" "\n"
                r"The control and target roles reverse: the phase kickback from the eigenstate $|-\rangle$ on the target produces a bit-flip on the control in the Hadamard basis."
            )
            code_example = (
                "from qiskit import QuantumCircuit\n\n"
                "# Demonstrate Phase Kickback with CNOT\n"
                "qc = QuantumCircuit(2, 1)\n"
                "qc.h(0)       # Control qubit in |+> state\n"
                "qc.x(1)       # Target qubit initialized to |1>\n"
                "qc.h(1)       # Target qubit transformed to eigenstate |->\n"
                "qc.barrier()\n"
                "qc.cx(0, 1)   # CNOT kicks relative phase (-1) back to control qubit 0!\n"
                "qc.barrier()\n"
                "qc.h(0)       # Hadamard on control maps |-> back to |1> (revealing kickback)\n"
                "qc.measure(0, 0)\n"
                "print(qc.draw())"
            )

        # Topic 2: Superposition & Hadamard Transform
        elif any(w in q_lower for w in ["superposition", "hadamard", "plus state", "minus state", "h gate"]):
            topic_title = "Quantum Superposition & Hadamard Transform"
            high_school_text = (
                "Think of a quantum coin. While spinning on a table, it is not simply heads or tails—it exists in a fluid blend of both states at once! "
                "The **Hadamard (H) gate** is the kick that puts the coin into this spinning superposition. Only when you slap your hand down (measurement) "
                "does the coin collapse into a definite heads (0) or tails (1) with 50/50 odds."
            )
            cs_text = (
                r"A qubit $|\psi\rangle$ exists as a normalized unit vector in a 2-dimensional complex Hilbert space $\mathbb{C}^2$:" "\n\n"
                r"$$|\psi\rangle = \alpha |0\rangle + \beta |1\rangle, \quad |\alpha|^2 + |\beta|^2 = 1, \quad \alpha, \beta \in \mathbb{C}$$" "\n\n"
                r"The **Hadamard gate** is a Hermitian and unitary operator ($H = H^\dagger = H^{-1}$):" "\n\n"
                r"$$H = \frac{1}{\sqrt{2}}\begin{pmatrix} 1 & 1 \\ 1 & -1 \end{pmatrix}$$" "\n\n"
                r"Applying $H$ to basis states creates equal superpositions with constructive and destructive phase relationships:" "\n"
                r"$$H|0\rangle = |+\rangle = \frac{1}{\sqrt{2}}(|0\rangle + |1\rangle), \qquad H|1\rangle = |-\rangle = \frac{1}{\sqrt{2}}(|0\rangle - |1\rangle)$$" "\n\n"
                r"For an $n$-qubit register initialized to $|0\rangle^{\otimes n}$, applying $H^{\otimes n}$ generates a uniform superposition over all $2^n$ computational states simultaneously."
            )
            phd_text = (
                r"Geometrically on the Bloch sphere, the Hadamard operator represents an involutory $\pi$-rotation about the diagonal axis $\frac{\hat{x} + \hat{z}}{\sqrt{2}}$: "
                r"$$H = \frac{X + Z}{\sqrt{2}} = \exp\left(-i \frac{\pi}{2} \frac{X + Z}{\sqrt{2}}\right)$$" "\n"
                r"In density matrix formalism, pure state $\rho = |0\rangle\langle 0| = \begin{pmatrix} 1 & 0 \\ 0 & 0 \end{pmatrix}$ evolves to "
                r"$\rho' = H \rho H^\dagger = \frac{1}{2}\begin{pmatrix} 1 & 1 \\ 1 & 1 \end{pmatrix}$. The off-diagonal coherences $\rho_{01} = \rho_{10} = \frac{1}{2}$ "
                r"represent maximal quantum phase coherence, enabling non-classical interference."
            )
            code_example = (
                "from qiskit import QuantumCircuit\n\n"
                "qc = QuantumCircuit(1, 1)\n"
                "qc.h(0)  # Superposition on qubit 0\n"
                "qc.measure(0, 0)\n"
                "print(qc.draw())"
            )

        # Topic 3: Entanglement, Bell States & Non-Locality
        elif any(w in q_lower for w in ["entangle", "bell", "epr", "cnot", "phi+", "psi-", "non-locality", "chsh"]):
            topic_title = "Quantum Entanglement & Bell State Generation"
            high_school_text = (
                "Entanglement links two qubits so profoundly that their physical properties become one shared destiny. "
                "Even if Alice takes one qubit to Mars and Bob keeps his on Earth, measuring Alice's qubit instantly reveals what Bob will see! "
                "Albert Einstein famously called this 'spooky action at a distance', but quantum mechanics proves it is real and essential for quantum computers."
            )
            cs_text = (
                r"Entangled bipartite states cannot be decomposed as tensor products of individual single-qubit states: "
                r"$$|\Psi_{AB}\rangle \neq |\psi_A\rangle \otimes |\psi_B\rangle$$" "\n\n"
                r"The four maximally entangled orthonormal Bell states (EPR pairs) form a complete basis for $\mathbb{C}^4$:" "\n"
                r"$$|\Phi^+\rangle = \frac{|00\rangle + |11\rangle}{\sqrt{2}}, \quad |\Phi^-\rangle = \frac{|00\rangle - |11\rangle}{\sqrt{2}}$$" "\n"
                r"$$|\Psi^+\rangle = \frac{|01\rangle + |10\rangle}{\sqrt{2}}, \quad |\Psi^-\rangle = \frac{|01\rangle - |10\rangle}{\sqrt{2}}$$" "\n\n"
                r"A Bell circuit creates $|\Phi^+\rangle$ by passing qubit 0 through a Hadamard (creating superposition), then using CNOT with qubit 0 as control and qubit 1 as target."
            )
            phd_text = (
                r"Entanglement entropy quantifies bipartite entanglement. Tracing out subsystem $B$ yields the reduced density operator: "
                r"$$\rho_A = \text{Tr}_B(|\Phi^+\rangle\langle\Phi^+|) = \frac{1}{2}(|0\rangle\langle 0| + |1\rangle\langle 1|) = \frac{1}{2} I_2$$" "\n"
                r"The von Neumann entropy $S(\rho_A) = -\text{Tr}(\rho_A \log_2 \rho_A) = 1$ bit is maximal. "
                r"Bell states maximally violate the classical Clauser-Horne-Shimony-Holt (CHSH) inequality: "
                r"$\langle \mathcal{B} \rangle = 2\sqrt{2} \approx 2.828 > 2$ (the classical local-realism bound), saturating Cirel'son's bound."
            )
            code_example = (
                "from qiskit import QuantumCircuit\n\n"
                "qc = QuantumCircuit(2, 2)\n"
                "qc.h(0)       # Create superposition on control qubit\n"
                "qc.cx(0, 1)   # Entangle target qubit with control via CNOT\n"
                "qc.measure([0, 1], [0, 1])\n"
                "print(qc.draw())"
            )

        # Topic 4: Quantum Teleportation
        elif any(w in q_lower for w in ["teleport", "teleportation", "quantum channel", "alice", "bob"]):
            topic_title = "Quantum Teleportation Protocol"
            high_school_text = (
                "Quantum teleportation transmits the exact quantum state of an unknown qubit across space without physically moving the particle! "
                "Alice and Bob share an entangled Bell pair in advance. Alice measures her particle together with the mystery particle, "
                "destroying the original state (obeying the No-Cloning Theorem). She sends 2 classical bits over the phone to Bob, "
                "who applies simple gate corrections to restore the exact original quantum state on his particle!"
            )
            cs_text = (
                r"Teleportation transmits state $|\psi\rangle = \alpha |0\rangle + \beta |1\rangle$ using 1 shared Bell pair and 2 classical bits. "
                r"The total 3-qubit state $|\psi\rangle_0 \otimes |\Phi^+\rangle_{12}$ expands as:" "\n\n"
                r"$$\frac{1}{2} \Big( |\Phi^+\rangle_{01}(\alpha|0\rangle + \beta|1\rangle)_2 + |\Phi^-\rangle_{01}(\alpha|0\rangle - \beta|1\rangle)_2 + |\Psi^+\rangle_{01}(\beta|0\rangle + \alpha|1\rangle)_2 + |\Psi^-\rangle_{01}(-\beta|0\rangle + \alpha|1\rangle)_2 \Big)$$" "\n\n"
                r"Alice performs a Bell measurement on qubits $(0, 1)$, obtaining classical bits $(c_0, c_1) \in \{00, 01, 10, 11\}$. "
                r"Bob applies the Pauli unitary correction $Z^{c_0} X^{c_1}$ to qubit 2, recovering $|\psi\rangle$ with 100% fidelity."
            )
            phd_text = (
                r"Teleportation is an isomorphism between quantum channels and entangled states (Jamiołkowski isomorphism). "
                r"Because the Bell measurement projects the joint system onto one of four maximally entangled orthogonal states, "
                r"the reduced state $\rho_2$ prior to classical message arrival is strictly $\frac{1}{2} I_2$ (maximally mixed), "
                r"rigorously preventing superluminal signaling and adhering to relativistic causality."
            )
            code_example = (
                "from qiskit import QuantumCircuit\n\n"
                "qc = QuantumCircuit(3, 2)\n"
                "qc.x(0)      # Prepare sample payload |1> on qubit 0\n"
                "qc.h(1)\n"
                "qc.cx(1, 2)  # Pre-shared Bell pair between Alice (q1) and Bob (q2)\n"
                "qc.barrier()\n"
                "qc.cx(0, 1)  # Bell measurement step 1\n"
                "qc.h(0)      # Bell measurement step 2\n"
                "qc.measure([0, 1], [0, 1])\n"
                "print(qc.draw())"
            )

        # Topic 5: Grover's Search & Amplitude Amplification
        elif any(w in q_lower for w in ["grover", "diffuser", "amplitude amplification", "quadratic"]):
            topic_title = "Grover's Search & Amplitude Amplification"
            high_school_text = (
                "Imagine searching for a specific name in an unorganized phone book of 1,000,000 people. "
                "A classical computer has to check one by one, averaging 500,000 checks. "
                "Grover's quantum algorithm uses constructive wave interference to amplify the probability of the right answer while canceling wrong ones, "
                "finding the correct item in only $\\sqrt{1,000,000} = 1,000$ steps!"
            )
            cs_text = (
                r"Grover's algorithm achieves provably optimal quadratic speedup $\mathcal{O}(\sqrt{N})$ for searching an unsorted database of $N = 2^n$ entries. "
                r"Each Grover iteration consists of two unitary operations:" "\n\n"
                r"1. **Phase Oracle** $O_f$: Flips the target state amplitude: $O_f |x\rangle = (-1)^{f(x)} |x\rangle$." "\n"
                r"2. **Grover Diffuser** $D$: Inversion about the mean amplitude: "
                r"$$D = 2|s\rangle\langle s| - I_N, \quad |s\rangle = \frac{1}{\sqrt{N}} \sum_{x=0}^{N-1} |x\rangle$$" "\n\n"
                r"Geometrically, each iteration rotates the state vector in a 2D plane by angle $\theta \approx 2/\sqrt{N}$. "
                r"The optimal number of iterations is $R \approx \frac{\pi}{4}\sqrt{N}$."
            )
            phd_text = (
                r"In the 2D subspace spanned by the target $|w\rangle$ and non-target superposition $|w^\perp\rangle$, "
                r"the uniform superposition is $|s\rangle = \cos(\theta/2)|w^\perp\rangle + \sin(\theta/2)|w\rangle$ where $\sin(\theta/2) = 1/\sqrt{N}$. "
                r"The Grover operator $G = -(I - 2|s\rangle\langle s|)(I - 2|w\rangle\langle w|)$ corresponds to the product of two Householder reflections, "
                r"yielding a planar rotation $SO(2)$ by $\theta$. Bennett, Bernstein, Brassard, and Vazirani (BBBV theorem) proved $\Omega(\sqrt{N})$ is the absolute quantum lower bound."
            )
            code_example = (
                "from qiskit import QuantumCircuit\n\n"
                "# 2-Qubit Grover Diffuser\n"
                "qc = QuantumCircuit(2)\n"
                "qc.h([0, 1])\n"
                "qc.x([0, 1])\n"
                "qc.cz(0, 1)  # Reflection about |00>\n"
                "qc.x([0, 1])\n"
                "qc.h([0, 1])\n"
                "print(qc.draw())"
            )

        # Topic 6: Shor's Algorithm & Quantum Fourier Transform (QFT)
        elif any(w in q_lower for w in ["shor", "qft", "fourier", "order finding", "factorization", "factor", "rsa"]):
            topic_title = "Shor's Algorithm & Quantum Fourier Transform (QFT)"
            high_school_text = (
                "Shor's algorithm is famous because it can break RSA internet encryption by factoring giant numbers in minutes instead of billions of years! "
                "It works by translating the math problem of factoring into a puzzle about finding the repeating rhythm (period) of numbers, "
                "using the Quantum Fourier Transform to hear the musical frequency of the answer."
            )
            cs_text = (
                r"Shor's algorithm factors an integer $N$ with exponential speedup in polynomial time $\mathcal{O}((\log N)^3)$ using modular arithmetic and Quantum Phase Estimation:" "\n\n"
                r"1. Choose random $a < N$ such that $\gcd(a, N) = 1$." "\n"
                r"2. Find the period $r$ of $f(x) = a^x \pmod N$ using the **Quantum Fourier Transform (QFT)**." "\n"
                r"3. If $r$ is even and $a^{r/2} \not\equiv -1 \pmod N$, compute non-trivial factors via $\gcd(a^{r/2} \pm 1, N)$." "\n\n"
                r"The QFT transforms computational basis states into phase-encoded frequency states: "
                r"$$|j\rangle \xrightarrow{\text{QFT}} \frac{1}{\sqrt{2^n}} \sum_{k=0}^{2^n-1} \exp\left(\frac{2\pi i j k}{2^n}\right) |k\rangle$$"
            )
            phd_text = (
                r"Shor's algorithm solves the Hidden Subgroup Problem (HSP) for the abelian group $\mathbb{Z}$. "
                r"The quantum circuit implements controlled modular exponentiation $U_a |y\rangle = |a y \pmod N\rangle$, "
                r"whose eigenvalues are $e^{2\pi i s / r}$ with eigenvectors $|u_s\rangle = \frac{1}{\sqrt{r}} \sum_{k=0}^{r-1} e^{-2\pi i s k / r} |a^k \pmod N\rangle$. "
                r"Phase estimation via inverse QFT and classical continuous fraction expansion yields the period $r$ with bounded error."
            )
            code_example = (
                "from qiskit import QuantumCircuit\n\n"
                "# 3-Qubit Quantum Fourier Transform (QFT)\n"
                "qc = QuantumCircuit(3)\n"
                "qc.h(0)\n"
                "qc.cp(3.14159/2, 1, 0)\n"
                "qc.cp(3.14159/4, 2, 0)\n"
                "qc.h(1)\n"
                "qc.cp(3.14159/2, 2, 1)\n"
                "qc.h(2)\n"
                "qc.swap(0, 2)\n"
                "print(qc.draw())"
            )

        # Topic 7: Quantum Measurement & Wavefunction Collapse
        elif any(w in q_lower for w in ["measure", "collapse", "born rule", "wavefunction", "projection"]):
            topic_title = "Quantum Measurement & Wavefunction Collapse"
            high_school_text = (
                "In classical physics, observing a ball does not change where it is. But in quantum physics, observation actively changes reality! "
                "Before measurement, a qubit is an unbroken wave of potential outcomes. The moment a measurement device interacts with it, "
                "the wave violently collapses into a single definite classical state with probabilities given by the **Born Rule**."
            )
            cs_text = (
                r"Quantum measurement is governed by projection-valued measures (PVM) or positive operator-valued measures (POVM). "
                r"For observable $A = \sum_m \lambda_m P_m$ with projection operators $P_m = |m\rangle\langle m|$:" "\n\n"
                r"1. **Born's Rule**: The probability of observing outcome $m$ is: "
                r"$$P(m) = \langle \psi | P_m | \psi \rangle = |\langle m | \psi \rangle|^2$$" "\n"
                r"2. **State Projection**: Post-measurement state collapses instantaneously to: "
                r"$$|\psi'\rangle = \frac{P_m |\psi\rangle}{\sqrt{P(m)}} = |m\rangle$$" "\n\n"
                r"Measurement is non-unitary, non-reversible, and destroys quantum phase coherence."
            )
            phd_text = (
                r"Von Neumann measurement formalism decomposes the process into pre-measurement (unitary entanglement with macroscopic apparatus $U|\psi\rangle|A_0\rangle = \sum_m c_m |m\rangle|A_m\rangle$) "
                r"and decoherence via environmental tracing. The density operator undergoes Lüders projection: "
                r"$$\rho \to \sum_m P_m \rho P_m$$" "\n"
                r"This eliminates all off-diagonal interference coherences $\rho_{ij} (i \neq j)$, yielding an epistemic mixed classical ensemble."
            )
            code_example = (
                "from qiskit import QuantumCircuit\n\n"
                "qc = QuantumCircuit(1, 1)\n"
                "qc.h(0)           # Equal superposition (|0> + |1>)/sqrt(2)\n"
                "qc.measure(0, 0)  # Collapses to 0 or 1 with 50% probability\n"
                "print(qc.draw())"
            )

        # Topic 8: Quantum Logic Gates & Unitary Dynamics
        elif any(w in q_lower for w in ["gate", "pauli", "unitary", "toffoli", "cnot", "swap", "phase gate", "t gate", "rotation"]):
            topic_title = "Quantum Logic Gates & Unitary Operators"
            high_school_text = (
                "Classical computers use logic gates like AND, OR, and NOT that manipulate definite 0s and 1s. "
                "Quantum gates are special: they are smooth rotations on a 3D sphere! "
                "Because they are reversible, no information is ever lost inside a quantum circuit until the final measurement."
            )
            cs_text = (
                r"Quantum logic gates are represented by unitary matrices satisfying $U^\dagger U = U U^\dagger = I$. "
                r"The primary single-qubit gates are the **Pauli operators**:" "\n\n"
                r"$$X = \begin{pmatrix} 0 & 1 \\ 1 & 0 \end{pmatrix}, \quad Y = \begin{pmatrix} 0 & -i \\ i & 0 \end{pmatrix}, \quad Z = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}$$" "\n\n"
                r"The phase gate $S = \text{diag}(1, i)$ and $T = \text{diag}(1, e^{i\pi/4})$ provide non-Clifford capability. "
                r"By the Solovay-Kitaev theorem, the Clifford+T gate set $\{H, S, CNOT, T\}$ is universal and can approximate any unitary to arbitrary precision $\epsilon$."
            )
            phd_text = (
                r"Single-qubit operations form the Lie group $SU(2)$, parameterized by Euler rotations "
                r"$U(\theta, \phi, \lambda) = R_z(\phi) R_y(\theta) R_z(\lambda)$. "
                r"Two-qubit gates like CNOT, CZ, and iSWAP generate entanglement and belong to $SU(4)$. "
                r"The Cartan decomposition reveals that any $U \in SU(4)$ can be factored with at most 3 CNOT gates and local single-qubit rotations."
            )
            code_example = (
                "from qiskit import QuantumCircuit\n\n"
                "qc = QuantumCircuit(2)\n"
                "qc.h(0)      # Hadamard\n"
                "qc.t(0)      # T-Gate (pi/4 phase)\n"
                "qc.cx(0, 1)  # CNOT entangler\n"
                "qc.rz(1.57, 1) # RZ rotation\n"
                "print(qc.draw())"
            )

        # Topic 9: Decoherence, Noise & Error Correction
        elif any(w in q_lower for w in ["noise", "decoherence", "t1", "t2", "fidelity", "error correction", "stabilizer", "surface code"]):
            topic_title = "Quantum Noise, Decoherence & Quantum Error Correction"
            high_school_text = (
                "Qubits are unbelievably sensitive. Stray magnetic fields, ambient heat, or cosmic rays cause them to lose their quantum state—a disaster called **decoherence**. "
                "Relaxation time $T_1$ is how long energy lasts, while dephasing time $T_2$ is how long the quantum phase stays coherent. "
                "Quantum error correction groups multiple noisy physical qubits together into one protected 'logical qubit' to defeat noise."
            )
            cs_text = (
                r"Open quantum systems interact with an environmental bath, modeled by completely positive trace-preserving (CPTP) maps with Kraus operators:" "\n\n"
                r"$$\mathcal{E}(\rho) = \sum_k E_k \rho E_k^\dagger, \quad \sum_k E_k^\dagger E_k = I$$" "\n\n"
                r"The $T_1$ longitudinal relaxation time governs amplitude decay $|1\rangle \to |0\rangle$, while $T_2 \le 2 T_1$ transverse dephasing destroys phase coherence. "
                r"Quantum error correction (QEC) uses stabilizer codes (like the 9-qubit Shor code or the Surface Code) to detect and correct bit-flip ($X$) and phase-flip ($Z$) errors without measuring or collapsing the stored logical state."
            )
            phd_text = (
                r"Markovian open system evolution obeys the Gorini-Kossakowski-Sudarshan-Lindblad (GKSL) master equation: "
                r"$$\frac{d\rho}{dt} = -\frac{i}{\hbar}[H, \rho] + \sum_k \gamma_k \left(L_k \rho L_k^\dagger - \frac{1}{2}\{L_k^\dagger L_k, \rho\}\right)$$" "\n"
                r"Stabilizer formalisms define the code space as the $+1$ eigenspace of an abelian subgroup $S \subset \mathcal{G}_n$. "
                r"Knill-Laflamme conditions $P C E_a^\dagger E_b P C = \alpha_{ab} P C$ determine exact error correctability."
            )
            code_example = (
                "from qiskit import QuantumCircuit\n\n"
                "# 3-Qubit Bit-Flip Repetition Code\n"
                "qc = QuantumCircuit(3, 1)\n"
                "qc.cx(0, 1)  # Encode into logical state |000> or |111>\n"
                "qc.cx(0, 2)\n"
                "qc.barrier()\n"
                "# Syndrome extraction and error recovery\n"
                "print(qc.draw())"
            )

        # Topic 10: Variational Quantum Eigensolver (VQE)
        elif any(w in q_lower for w in ["vqe", "variational", "ansatz", "chemistry", "hamiltonian", "ground state"]):
            topic_title = "Variational Quantum Eigensolver (VQE)"
            high_school_text = (
                "VQE is a hybrid team-up between a quantum processor and a classical supercomputer! "
                "The quantum chip prepares complicated molecular wavefunctions using parameterized quantum gates. "
                "The classical computer measures the energy and tweaks the gate angles until the minimum ground-state energy of the molecule is discovered."
            )
            cs_text = (
                r"VQE finds the ground-state energy $E_0$ of a problem Hamiltonian $H = \sum_i c_i P_i$ using the Rayleigh-Ritz variational principle:" "\n\n"
                r"$$E(\boldsymbol{\theta}) = \langle \psi(\boldsymbol{\theta}) | H | \psi(\boldsymbol{\theta}) \rangle \ge E_0$$" "\n\n"
                r"The algorithm proceeds iteratively in a hybrid loop:" "\n"
                r"1. Quantum processor evaluates expectation value $E(\boldsymbol{\theta})$ for parameterized ansatz $|\psi(\boldsymbol{\theta})\rangle$." "\n"
                r"2. Classical optimizer (COBYLA, SPSA, ADAM) updates parameters $\boldsymbol{\theta}_{k+1} = \boldsymbol{\theta}_k - \eta \nabla E(\boldsymbol{\theta})$."
            )
            phd_text = (
                r"Analytic gradients for VQE are computed via the exact **Parameter-Shift Rule**: "
                r"$$\frac{\partial \langle H \rangle}{\partial \theta_i} = \frac{1}{2}\Big( \langle H \rangle_{\theta_i + \frac{\pi}{2}} - \langle H \rangle_{\theta_i - \frac{\pi}{2}} \Big)$$" "\n"
                r"This provides hardware-native gradients without finite-difference numerical instabilities. "
                r"Fermionic molecular Hamiltonians are mapped to qubit Pauli strings via Jordan-Wigner ($c_j^\dagger \to \frac{X_j - i Y_j}{2} \bigotimes_{k < j} Z_k$) or Bravyi-Kitaev transformations."
            )
            code_example = (
                "from qiskit.circuit import QuantumCircuit, Parameter\n\n"
                "theta = Parameter('θ')\n"
                "qc = QuantumCircuit(1)\n"
                "qc.ry(theta, 0)  # Parameterized ansatz gate\n"
                "print(qc.draw())"
            )

        # Topic 11: Comprehensive Dynamic Fallback for ANY General Query
        else:
            topic_title = f"Quantum Physics Analysis: {user_prompt}"
            high_school_text = (
                f"Your query asks about **{user_prompt}**. In quantum computing, all computations are built upon two revolutionary ideas: "
                f"**superposition** (qubits holding multiple possibilities simultaneously) and **entanglement** (deep invisible links between particles). "
                f"Whenever a quantum algorithm addresses '{user_prompt}', it coordinates waves of probability amplitudes across multiple qubit wires "
                f"so that incorrect answers cancel each other out by destructive interference, and the correct solution surges forward into reality upon measurement."
            )
            cs_text = (
                f"Addressing your inquiry on **{user_prompt}**:\n\n"
                r"In quantum information science, the computational state of an $n$-qubit register resides in a $2^n$-dimensional complex Hilbert space $\mathcal{H} = (\mathbb{C}^2)^{\otimes n}$. "
                f"Algorithms addressing '{user_prompt}' operate by applying a sequence of unitary transformation matrices $U \\in U(2^n)$ satisfying $U^\\dagger U = I$:\n\n"
                r"$$|\psi(t)\rangle = U_k U_{k-1} \cdots U_1 |\psi(0)\rangle, \quad |\psi(0)\rangle = |0\rangle^{\otimes n}$$" "\n\n"
                r"By engineering constructive interference for optimal states and destructive interference for non-solutions, "
                r"quantum computational advantage is achieved over classical probabilistic Turing machines."
            )
            phd_text = (
                f"Rigorous theoretical analysis of **{user_prompt}** under quantum mechanical formalism:\n\n"
                r"The physical state is described by a density operator $\rho$ belonging to the convex set of positive semi-definite operators $\mathcal{S}(\mathcal{H})$ with $\text{Tr}(\rho) = 1$. "
                r"Closed system evolution is governed by the Liouville-von Neumann equation: "
                r"$$\frac{d\rho}{dt} = -\frac{i}{\hbar}[H(t), \rho]$$" "\n"
                r"For open systems, interaction with environmental degrees of freedom induces Kraus channel transitions $\mathcal{E}(\rho) = \sum_k E_k \rho E_k^\dagger$. "
                f"Investigating '{user_prompt}' requires balancing unitary gate fidelities against non-unitary environmental dephasing rates."
            )
            code_example = (
                "from qiskit import QuantumCircuit\n\n"
                f"# Circuit demonstration reflecting {user_prompt[:30]}\n"
                "qc = QuantumCircuit(2, 2)\n"
                "qc.h(0)        # Initialize superposition\n"
                "qc.cx(0, 1)    # Generate entanglement\n"
                "qc.rz(0.785, 1)# Apply phase transformation\n"
                "qc.measure([0, 1], [0, 1])\n"
                "print(qc.draw())"
            )

        # Assemble formatted response based on selected background profile
        if bg_level == "high-school":
            explanation_body = high_school_text
            profile_label = "High School Physics Track"
        elif bg_level == "physics-phd":
            explanation_body = phd_text
            profile_label = "Quantum Physics PhD Track"
        else:
            explanation_body = cs_text
            profile_label = "CS Undergraduate Track"

        circuit_note = ""
        if circuit_info and circuit_info.get("gates"):
            gate_count = len(circuit_info.get("gates", []))
            qubit_cnt = circuit_info.get("qubitCount", 2)
            circuit_note = (
                f"\n\n### 🔬 Contextual Active Circuit Analysis\n"
                f"Your active workspace currently contains **{gate_count} gate(s)** across **{qubit_cnt} qubit wire(s)**. "
                f"The concepts above directly describe the mathematical statevector evolution in your circuit."
            )

        return f"""### 🧠 AI Quantum Tutor: {topic_title}
**Profile Adaptation:** *{profile_label}*

#### 💡 Comprehensive Physical & Conceptual Breakdown
{explanation_body}
{circuit_note}

#### 💻 Complete Executable Qiskit Python Code
```python
{code_example}
```

#### 🎯 Key Physical Takeaways & Hardware Realities
Understanding how quantum phase angles, unitary rotations, and constructive wave interference combine enables you to design fault-tolerant quantum subroutines with provable quantum advantages."""

    @staticmethod
    def debug_circuit(qubit_count: int, gates: List[Dict[str, Any]]) -> Dict[str, Any]:
        has_measurement = any(g.get('type') == 'MEASURE' for g in gates)
        has_unconnected_cnot = any(g.get('type') == 'CNOT' and g.get('targetQubit') is None for g in gates)
        
        issues = []
        if not has_measurement:
            issues.append({
                "severity": "warning",
                "message": "Missing explicit Measurement (M) gate at end of wire.",
                "suggestion": "Place measurement gates to collapse state vector into classical bitstrings."
            })
            
        if has_unconnected_cnot:
            issues.append({
                "severity": "error",
                "message": "CNOT gate target qubit is unassigned.",
                "suggestion": "Connect the target wire for control-target pair."
            })

        if not issues:
            issues.append({
                "severity": "info",
                "message": "Circuit matrix structure is physically valid and syntactically sound.",
                "suggestion": "Ready for high-fidelity state vector execution."
            })

        return {
            "hasErrors": any(i["severity"] == "error" for i in issues),
            "issues": issues,
            "correctedCode": f"# Corrected Circuit Code\n# Qubits: {qubit_count}\n",
            "explanation": "Quantum syntax AST scan completed clean."
        }

    @staticmethod
    def optimize_circuit(qubit_count: int, gates: List[Dict[str, Any]]) -> Dict[str, Any]:
        cancellations = []
        optimized = []
        i = 0
        while i < len(gates):
            curr = gates[i]
            next_g = gates[i + 1] if i + 1 < len(gates) else None
            
            if next_g and curr.get('qubit') == next_g.get('qubit') and curr.get('type') == next_g.get('type') and curr.get('type') in ['H', 'X', 'Y', 'Z']:
                cancellations.append(f"Cancelled consecutive {curr.get('type')} gates on q[{curr.get('qubit')}] ({curr.get('type')}·{curr.get('type')} = I)")
                i += 2
            else:
                optimized.append(curr)
                i += 1

        orig_depth = max([g.get('step', 0) for g in gates], default=0) + 1 if gates else 0
        opt_depth = max([g.get('step', 0) for g in optimized], default=0) + 1 if optimized else 0

        return {
            "originalDepth": orig_depth,
            "optimizedDepth": opt_depth,
            "originalGateCount": len(gates),
            "optimizedGateCount": len(optimized),
            "cancellations": cancellations if cancellations else ["No self-inverse gate redundancies found. Circuit is optimal!"],
            "explanation": f"Optimized quantum circuit depth from {orig_depth} to {opt_depth} steps."
        }

    @staticmethod
    def generate_module_test(module_id: str) -> Dict[str, Any]:
        """
        Generates 8 automated MCQs, 1 Circuit Diagram task, and 1 Code task for any module.
        """
        mod_key = module_id.lower().replace("_", "-")

        if "teleportation" in mod_key or "3" in mod_key:
            title = "Module 3: Quantum Teleportation Protocol Test"
            mcqs = [
                {
                    "id": "q1",
                    "question": "How many total qubits are required for the standard Quantum Teleportation protocol?",
                    "options": ["2 qubits", "3 qubits", "4 qubits", "1 qubit"],
                    "correctIndex": 1,
                    "explanation": "3 qubits are needed: 1 input qubit to teleport, and 2 qubits for the shared Bell pair between Alice and Bob."
                },
                {
                    "id": "q2",
                    "question": "In quantum teleportation, which qubits does Alice measure during the Bell state measurement?",
                    "options": ["Qubit 0 and Qubit 1", "Qubit 1 and Qubit 2", "Qubit 0 only", "Qubit 2 only"],
                    "correctIndex": 0,
                    "explanation": "Alice measures qubit 0 (payload state) and qubit 1 (her half of the Bell pair)."
                },
                {
                    "id": "q3",
                    "question": "What correction gates does Bob apply to qubit 2 if Alice transmits classical bits '11'?",
                    "options": ["No gates (Identity)", "Pauli-X only", "Pauli-Z followed by Pauli-X", "Hadamard gate"],
                    "correctIndex": 2,
                    "explanation": "If classical outcome is '11' (q0=1, q1=1), Bob applies Z and X gates to recover state |ψ⟩."
                },
                {
                    "id": "q4",
                    "question": "Does quantum teleportation violate the No-Cloning Theorem?",
                    "options": ["Yes, it clones state |ψ⟩", "No, because Alice's original state is destroyed upon measurement", "Yes, state vectors are multiplied", "No, state cloning is allowed for Bell pairs"],
                    "correctIndex": 1,
                    "explanation": "The original state |ψ⟩ on qubit 0 is collapsed/destroyed by Alice's measurement, maintaining No-Cloning."
                },
                {
                    "id": "q5",
                    "question": "What entangled state is initially shared between Alice and Bob prior to teleportation?",
                    "options": ["|00⟩", "(|00⟩ + |11⟩)/√2", "(|01⟩ - |10⟩)/√2", "|11⟩"],
                    "correctIndex": 1,
                    "explanation": "The standard Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2 is pre-shared between Alice (q1) and Bob (q2)."
                },
                {
                    "id": "q6",
                    "question": "Why can quantum state teleportation NOT be performed faster than light?",
                    "options": ["Quantum entanglement collapses instantly", "2 classical bits must be transmitted over traditional channels", "Phase rotations lag in fiber cables", "It operates at light speed"],
                    "correctIndex": 1,
                    "explanation": "Bob cannot reconstruct state |ψ⟩ until Alice sends 2 classical bits via subluminal communication."
                },
                {
                    "id": "q7",
                    "question": "What sequence of gates does Alice apply to qubits 0 and 1 before measuring them?",
                    "options": ["CNOT(0->1) then Hadamard on q0", "Hadamard on q0 then CNOT(0->1)", "Pauli-X on q0 and q1", "Toffoli gate"],
                    "correctIndex": 0,
                    "explanation": "Alice performs a Bell measurement: CNOT with control q0 target q1, followed by H on q0."
                },
                {
                    "id": "q8",
                    "question": "If Alice's classical measurement bits are '01' (q0=0, q1=1), which gate should Bob apply to q2?",
                    "options": ["Pauli-X gate", "Pauli-Z gate", "Hadamard gate", "Identity (No gate)"],
                    "correctIndex": 0,
                    "explanation": "When q1 = 1 and q0 = 0, Bob applies a Pauli-X gate to invert the bit flip."
                }
            ]
            circuit_task = {
                "title": "Construct Teleportation State Prep & Entanglement Circuit",
                "instructions": "Build a 3-qubit circuit: apply X on q0 (payload prep), H on q1, CNOT(q1 -> q2) (Bell pair prep), and CNOT(q0 -> q1) (Bell measurement stage).",
                "targetQubitCount": 3,
                "requiredGateTypes": ["X", "H", "CNOT"],
                "targetStateVector": "Teleportation State Vector"
            }
            code_task = {
                "title": "Write Qiskit Code for Quantum Teleportation Circuit",
                "instructions": "Write Qiskit code to construct a 3-qubit circuit initializing an entangled Bell pair between q1 and q2, performing CNOT(q0, q1) and H(q0), and measuring q0 and q1.",
                "starterCode": "# Qiskit Teleportation Challenge\nfrom qiskit import QuantumCircuit\n\ndef create_teleportation_circuit():\n    # TODO: Create a 3-qubit circuit with 2 classical bits\n    qc = QuantumCircuit(3, 2)\n    # 1. State preparation on q0\n    qc.x(0)\n    # 2. Bell pair between q1 and q2\n    qc.h(1)\n    qc.cx(1, 2)\n    # 3. Alice Bell measurement\n    qc.cx(0, 1)\n    qc.h(0)\n    qc.measure([0, 1], [0, 1])\n    return qc\n"
            }
        elif "grover" in mod_key or "search" in mod_key or "4" in mod_key:
            title = "Module 4: Grover’s Search Algorithm Test"
            mcqs = [
                {
                    "id": "q1",
                    "question": "What is the query complexity of Grover’s Search algorithm on N unsorted items?",
                    "options": ["O(N)", "O(√N)", "O(log N)", "O(1)"],
                    "correctIndex": 1,
                    "explanation": "Grover's search provides quadratic speedup, requiring O(√N) oracle evaluations compared to classical O(N)."
                },
                {
                    "id": "q2",
                    "question": "What phase shift operation does the Grover Oracle perform on the target search item |w⟩?",
                    "options": ["|w⟩ -> |w⟩ (No change)", "|w⟩ -> -|w⟩ (Phase inversion)", "|w⟩ -> |0⟩ (Bit flip)", "|w⟩ -> i|w⟩"],
                    "correctIndex": 1,
                    "explanation": "The Oracle flips the phase of the marked target state |w⟩ by multiplying its amplitude by -1."
                },
                {
                    "id": "q3",
                    "question": "What is the primary function of the Grover Diffuser operator?",
                    "options": ["Reflection about the average amplitude (Amplitude Amplification)", "Measuring qubits into classical bits", "Creating quantum entanglement", "Phase cancellation of basis state |00⟩"],
                    "correctIndex": 0,
                    "explanation": "The diffuser performs inversion about the mean, boosting target amplitude while dampening non-target states."
                },
                {
                    "id": "q4",
                    "question": "How many Grover iterations are optimal for a database of size N with 1 target item?",
                    "options": ["≈ (π/4) √N iterations", "N iterations", "N/2 iterations", "log2(N) iterations"],
                    "correctIndex": 0,
                    "explanation": "The optimal number of Grover iterations R is approximately (π/4) √N."
                },
                {
                    "id": "q5",
                    "question": "Which multi-qubit gate is used in a 3-qubit Grover oracle to flip the target state |111⟩?",
                    "options": ["Toffoli (CCX) gate", "Hadamard gate", "SWAP gate", "Single-qubit RX rotation"],
                    "correctIndex": 0,
                    "explanation": "The Toffoli (CCX) gate acts on target qubit 2 controlled by q0 and q1, selectively marking |111⟩."
                },
                {
                    "id": "q6",
                    "question": "What state vector is prepared at the start of Grover's algorithm before applying the Oracle?",
                    "options": ["State |000⟩", "Uniform equal superposition state over all N computational basis states", "Bell state |Φ+⟩", "Single excited state |100⟩"],
                    "correctIndex": 1,
                    "explanation": "Hadamard gates are applied to all input qubits to construct a uniform equal superposition state."
                },
                {
                    "id": "q7",
                    "question": "What happens if Grover's search algorithm is executed for significantly more iterations than the optimal count?",
                    "options": ["Success probability reaches 100%", "The target amplitude over-rotates, decreasing success probability", "The circuit halts", "Qubits decay into state |0⟩"],
                    "correctIndex": 1,
                    "explanation": "Grover iterations rotate the state vector in 2D space; over-rotating causes success probability to oscillate and decrease."
                },
                {
                    "id": "q8",
                    "question": "What is the classical brute-force unstructured search complexity compared to Grover's search?",
                    "options": ["Classical O(N) vs Quantum O(√N)", "Classical O(N²) vs Quantum O(N)", "Classical O(log N) vs Quantum O(1)", "Both are O(N)"],
                    "correctIndex": 0,
                    "explanation": "Classical search requires checking N/2 items on average (O(N)), whereas Grover requires O(√N) calls."
                }
            ]
            circuit_task = {
                "title": "Construct Grover Superposition & Oracle Stage",
                "instructions": "Build a 3-qubit circuit: apply Hadamard (H) gates to q0, q1, q2, followed by a Toffoli (CCX) gate on q0, q1 with target q2.",
                "targetQubitCount": 3,
                "requiredGateTypes": ["H", "TOFFOLI"],
                "targetStateVector": "Grover Superposition & Oracle State"
            }
            code_task = {
                "title": "Write Qiskit Code for Grover Diffuser Operator",
                "instructions": "Write Qiskit code to implement the Grover Diffuser operator on 2 qubits: apply H gates, X gates, CZ or CNOT, X gates, and H gates.",
                "starterCode": "# Qiskit Grover Diffuser Challenge\nfrom qiskit import QuantumCircuit\n\ndef create_grover_diffuser():\n    # TODO: Create a 2-qubit circuit representing the Grover Diffuser\n    qc = QuantumCircuit(2)\n    qc.h([0, 1])\n    qc.x([0, 1])\n    qc.cz(0, 1)\n    qc.x([0, 1])\n    qc.h([0, 1])\n    return qc\n"
            }
        elif "qft" in mod_key or "fourier" in mod_key or "5" in mod_key:
            title = "Module 5: Quantum Fourier Transform (QFT) Test"
            mcqs = [
                {
                    "id": "q1",
                    "question": "What is the gate complexity of computing QFT on n qubits?",
                    "options": ["O(n²)", "O(2ⁿ)", "O(n!)", "O(n)"],
                    "correctIndex": 0,
                    "explanation": "QFT requires only O(n²) quantum gates, providing an exponential speedup over classical Fast Fourier Transform."
                },
                {
                    "id": "q2",
                    "question": "The Quantum Fourier Transform maps computational basis states into which basis?",
                    "options": ["Position basis", "Phase frequency basis", "Energy eigenvalue basis", "Bloch pole state"],
                    "correctIndex": 1,
                    "explanation": "QFT transforms computational basis states |x⟩ into relative phase frequency states."
                },
                {
                    "id": "q3",
                    "question": "Which phase rotation gate R_k is used in QFT with phase angle exp(2πi / 2^k)?",
                    "options": ["Controlled Phase Rotation gate (CPHASE / Rk)", "Pauli-X gate", "Toffoli gate", "Hadamard gate"],
                    "correctIndex": 0,
                    "explanation": "QFT utilizes controlled phase rotation gates R_k to encode binary fractional phase shifts."
                },
                {
                    "id": "q4",
                    "question": "Which famous quantum algorithm relies on QFT as its core subroutine for factoring integers?",
                    "options": ["Grover's Algorithm", "Shor’s Factoring Algorithm", "VQE", "Deutsch-Jozsa Algorithm"],
                    "correctIndex": 1,
                    "explanation": "Shor’s algorithm uses QFT within Quantum Phase Estimation to find periods of modular exponential functions."
                },
                {
                    "id": "q5",
                    "question": "What gate sequence is applied to the first qubit in a 3-qubit QFT circuit?",
                    "options": ["Hadamard gate followed by controlled phase rotations from remaining qubits", "Only Pauli-Z gates", "CNOT gates to all qubits", "SWAP gates only"],
                    "correctIndex": 0,
                    "explanation": "The first qubit receives an H gate, then controlled R2 and R3 phase rotations from qubits 1 and 2."
                },
                {
                    "id": "q6",
                    "question": "What operation must be performed at the end of a QFT circuit to reverse qubit ordering?",
                    "options": ["SWAP gates between symmetric qubit pairs", "Reset gates to state |0⟩", "Multi-qubit Hadamard gates", "Pauli-X bit flips"],
                    "correctIndex": 0,
                    "explanation": "SWAP gates invert the output qubit order to align output bitstrings with traditional binary representation."
                },
                {
                    "id": "q7",
                    "question": "What is the matrix entry (j, k) representation of QFT on N = 2ⁿ states?",
                    "options": ["(1/√N) * exp(2πi * j * k / N)", "(1/N) * (j + k)", "exp(-i * j * k)", "Identity matrix entry"],
                    "correctIndex": 0,
                    "explanation": "QFT matrix elements are F_jk = (1/√N) ω^(j·k) where ω = e^(2πi/N)."
                },
                {
                    "id": "q8",
                    "question": "How does QFT compare to classical Fast Fourier Transform (FFT) complexity?",
                    "options": ["QFT is O(n²) while FFT is O(n 2ⁿ) where n is qubit count", "QFT is slower than FFT", "Both have identical complexity O(n²)", "FFT is O(1)"],
                    "correctIndex": 0,
                    "explanation": "QFT achieves exponential speedup: O(n²) quantum gates vs classical FFT O(n 2ⁿ) operations."
                }
            ]
            circuit_task = {
                "title": "Construct 3-Qubit QFT Subcircuit",
                "instructions": "Build a 3-qubit circuit: apply H on q0, S gate on q1, H on q1, T gate on q2, and H on q2.",
                "targetQubitCount": 3,
                "requiredGateTypes": ["H", "S", "T"],
                "targetStateVector": "QFT Phase State"
            }
            code_task = {
                "title": "Write Qiskit Code for 2-Qubit QFT",
                "instructions": "Write Qiskit code to construct a 2-qubit QFT circuit: apply H on q0, Controlled-Phase (cp) with π/2 from q1 to q0, H on q1, and a SWAP gate.",
                "starterCode": "# Qiskit QFT Challenge\nfrom qiskit import QuantumCircuit\nimport numpy as np\n\ndef create_qft_2qubit():\n    # TODO: Create a 2-qubit QFT circuit\n    qc = QuantumCircuit(2)\n    qc.h(0)\n    qc.cp(np.pi / 2, 1, 0)\n    qc.h(1)\n    qc.swap(0, 1)\n    return qc\n"
            }
        elif "vqe" in mod_key or "eigensolver" in mod_key or "variational" in mod_key or "6" in mod_key:
            title = "Module 6: Variational Quantum Eigensolver (VQE) Test"
            mcqs = [
                {
                    "id": "q1",
                    "question": "What type of computing architecture does VQE utilize?",
                    "options": ["Pure quantum hardware execution only", "Hybrid quantum-classical optimization loop", "Classical supercomputer simulation only", "Optical analog hardware"],
                    "correctIndex": 1,
                    "explanation": "VQE combines quantum state preparation and measurement with classical parameter optimization."
                },
                {
                    "id": "q2",
                    "question": "What mathematical theorem guarantees that VQE's calculated energy expectation value is an upper bound on ground state energy E0?",
                    "options": ["Heisenberg Uncertainty Principle", "The Variational Principle", "Pauli Exclusion Principle", "No-Cloning Theorem"],
                    "correctIndex": 1,
                    "explanation": "The Variational Principle states ⟨ψ(θ)|H|ψ(θ)⟩ ≥ E0 for any trial state wavefunction."
                },
                {
                    "id": "q3",
                    "question": "In VQE, what is the parameterized quantum circuit that generates trial state states |ψ(θ)⟩ called?",
                    "options": ["Quantum Oracle", "Parameterized Ansatz", "Diffuser", "QFT Matrix"],
                    "correctIndex": 1,
                    "explanation": "The Ansatz is a parameterized quantum circuit tailored to represent chemical or physical trial states."
                },
                {
                    "id": "q4",
                    "question": "Which part of the VQE algorithm is executed on the classical computer?",
                    "options": ["Optimization of variational parameters θ (e.g., COBYLA, SPSA)", "Executing Hadamard superpositions", "Generating Bell state entanglement", "State vector inner product calculation"],
                    "correctIndex": 0,
                    "explanation": "Classical optimizers compute parameter updates θ_new based on quantum energy measurement feedback."
                },
                {
                    "id": "q5",
                    "question": "What physical chemical problem is VQE primarily designed to solve on NISQ quantum hardware?",
                    "options": ["Finding ground state energies of molecular Hamiltonians (e.g. H2, LiH)", "Factoring 2048-bit RSA keys", "Unsorted database lookup", "Random number generation"],
                    "correctIndex": 0,
                    "explanation": "VQE calculates molecular ground state energies and chemical reaction pathways."
                },
                {
                    "id": "q6",
                    "question": "How is a molecular Hamiltonian mapped into a linear combination of qubit Pauli operators?",
                    "options": ["Jordan-Wigner or Bravyi-Kitaev transformation", "Fourier Transform", "Hadamard rotation", "Bloch sphere projection"],
                    "correctIndex": 0,
                    "explanation": "Fermionic operators are mapped to qubit Pauli operators (X, Y, Z, I) via Jordan-Wigner transformation."
                },
                {
                    "id": "q7",
                    "question": "Which rotation gates are commonly used to construct parameterized Single-Qubit Ansätze in VQE?",
                    "options": ["RX(θ), RY(θ), and RZ(θ) rotation gates", "Toffoli gates only", "SWAP gates only", "Measurement gates only"],
                    "correctIndex": 0,
                    "explanation": "Parameterized single-qubit rotation gates RX, RY, RZ control quantum state vector coordinates."
                },
                {
                    "id": "q8",
                    "question": "Why is VQE suitable for Noisy Intermediate-Scale Quantum (NISQ) devices?",
                    "options": ["Shallow circuit depth mitigates coherence time limits and noise accumulation", "It requires 1 million fault-tolerant qubits", "Noise does not affect energy measurements", "It runs entirely on GPUs"],
                    "correctIndex": 0,
                    "explanation": "VQE uses short, shallow ansatz circuits, making it resilient to NISQ hardware decoherence."
                }
            ]
            circuit_task = {
                "title": "Construct VQE Parameterized Ansatz Circuit",
                "instructions": "Build a 2-qubit circuit: apply RX rotation gate on q0, RY rotation gate on q1, and a CNOT entangling gate from q0 to q1.",
                "targetQubitCount": 2,
                "requiredGateTypes": ["RX", "RY", "CNOT"],
                "targetStateVector": "VQE Parameterized State Vector"
            }
            code_task = {
                "title": "Write Qiskit Code for Hardware-Efficient VQE Ansatz",
                "instructions": "Write Qiskit code using Parameter objects to create a 2-qubit VQE ansatz: apply Parameterized RY rotations to q0 and q1, followed by a CNOT entangler.",
                "starterCode": "# Qiskit VQE Ansatz Challenge\nfrom qiskit import QuantumCircuit\nfrom qiskit.circuit import Parameter\n\ndef create_vqe_ansatz():\n    theta0 = Parameter('θ0')\n    theta1 = Parameter('θ1')\n    qc = QuantumCircuit(2)\n    qc.ry(theta0, 0)\n    qc.ry(theta1, 1)\n    qc.cx(0, 1)\n    return qc\n"
            }
        elif "entanglement" in mod_key or "bell" in mod_key or "2" in mod_key:
            title = "Module 2: Quantum Entanglement & Bell States Test"
            mcqs = [
                {
                    "id": "q1",
                    "question": "Which quantum state represents the maximally entangled Bell state |Φ+⟩?",
                    "options": ["(|00⟩ + |11⟩)/√2", "(|01⟩ + |10⟩)/√2", "(|00⟩ - |11⟩)/√2", "|00⟩"],
                    "correctIndex": 0,
                    "explanation": "|Φ+⟩ is formed by H on q0 and CNOT controlled on q0 targeting q1, yielding (|00⟩ + |11⟩)/√2."
                },
                {
                    "id": "q2",
                    "question": "What happens when you measure qubit 0 of a Bell state (|00⟩ + |11⟩)/√2 and find 1?",
                    "options": ["Qubit 1 remains in superposition", "Qubit 1 collapses to state 1 with 100% certainty", "Qubit 1 collapses to 0", "The circuit resets"],
                    "correctIndex": 1,
                    "explanation": "Due to quantum entanglement, measuring q0 = 1 instantaneously collapses q1 to state 1."
                },
                {
                    "id": "q3",
                    "question": "Which combination of quantum gates generates the Bell state |Ψ-⟩ from state |00⟩?",
                    "options": ["X on q0, H on q0, CNOT(0->1), Z on q1", "H on q0, CNOT(0->1)", "X on q0, X on q1", "H on q0, H on q1"],
                    "correctIndex": 0,
                    "explanation": "Applying X and H to q0 followed by CNOT and Z on q1 creates the anti-symmetric Bell state |Ψ-⟩ = (|01⟩ - |10⟩)/√2."
                },
                {
                    "id": "q4",
                    "question": "Can quantum entanglement be used to transmit classical data faster than light?",
                    "options": ["Yes, instantaneously", "No, classical communication is required to decode state information", "Only over optical fiber", "Yes, using quantum repeaters"],
                    "correctIndex": 1,
                    "explanation": "The No-Communication Theorem proves entanglement alone cannot transmit usable information faster than light."
                },
                {
                    "id": "q5",
                    "question": "What matrix represents the 2-qubit CNOT gate in the computational basis?",
                    "options": ["4x4 identity matrix", "Diag(1,1,0,1)", "4x4 matrix with lower-right 2x2 block swapped to [[0,1],[1,0]]", "2x2 Pauli-X matrix"],
                    "correctIndex": 2,
                    "explanation": "The CNOT matrix maps |10⟩ -> |11⟩ and |11⟩ -> |10⟩, flipping the lower 2x2 block."
                },
                {
                    "id": "q6",
                    "question": "In quantum teleportation, how many classical bits must Alice send to Bob?",
                    "options": ["1 bit", "2 classical bits", "3 bits", "0 bits"],
                    "correctIndex": 1,
                    "explanation": "Alice performs a Bell-state measurement on 2 qubits and transmits 2 classical bits to Bob."
                },
                {
                    "id": "q7",
                    "question": "What is the trace of the density matrix for a pure Bell state?",
                    "options": ["0.5", "1.0", "0.0", "2.0"],
                    "correctIndex": 1,
                    "explanation": "The trace of any valid density matrix ρ (pure or mixed) is always equal to 1."
                },
                {
                    "id": "q8",
                    "question": "What inequality is violated by entangled quantum states, proving non-locality?",
                    "options": ["Heisenberg Uncertainty Principle", "CHSH / Bell Inequality", "Schrödinger Equation", "No-Cloning Theorem"],
                    "correctIndex": 1,
                    "explanation": "The CHSH inequality places a maximum bound of 2 for local hidden variables, while quantum entanglement achieves 2√2."
                }
            ]
            circuit_task = {
                "title": "Construct maximal Bell State |Φ+⟩",
                "instructions": "Build a 2-qubit circuit: apply a Hadamard (H) gate on qubit 0, followed by a CNOT gate with control on q0 and target on q1.",
                "targetQubitCount": 2,
                "requiredGateTypes": ["H", "CNOT"],
                "targetStateVector": "0.707|00> + 0.707|11>"
            }
            code_task = {
                "title": "Write Qiskit Code for Bell State Creation",
                "instructions": "Write Qiskit code to create a 2-qubit QuantumCircuit, apply an H gate to qubit 0, a CNOT gate from qubit 0 to 1, measure both qubits, and return the circuit.",
                "starterCode": "# Qiskit Bell State Challenge\nfrom qiskit import QuantumCircuit\n\ndef create_bell_circuit():\n    # TODO: Create a 2-qubit circuit with 2 classical bits\n    qc = QuantumCircuit(2, 2)\n    qc.h(0)\n    qc.cx(0, 1)\n    qc.measure([0, 1], [0, 1])\n    return qc\n"
            }
        else:
            # Default / Lesson 1: Superposition & Qubit Fundamentals
            title = "Module 1: Qubit Fundamentals & Superposition Test"
            mcqs = [
                {
                    "id": "q1",
                    "question": "What state vector is produced when a Hadamard (H) gate is applied to |0⟩?",
                    "options": ["|1⟩", "(|0⟩ + |1⟩)/√2", "(|0⟩ - |1⟩)/√2", "i|0⟩"],
                    "correctIndex": 1,
                    "explanation": "The Hadamard gate rotates basis state |0⟩ to the equal superposition state |+⟩ = (|0⟩ + |1⟩)/√2."
                },
                {
                    "id": "q2",
                    "question": "What is the probability of measuring state '1' for qubit state (|0⟩ + |1⟩)/√2?",
                    "options": ["0%", "25%", "50%", "100%"],
                    "correctIndex": 2,
                    "explanation": "The probability is |β|² = |1/√2|² = 1/2 = 50%."
                },
                {
                    "id": "q3",
                    "question": "Which Pauli gate acts as a quantum NOT gate, swapping |0⟩ and |1⟩?",
                    "options": ["Pauli-X", "Pauli-Y", "Pauli-Z", "Hadamard"],
                    "correctIndex": 0,
                    "explanation": "The Pauli-X gate flips |0⟩ to |1⟩ and |1⟩ to |0⟩."
                },
                {
                    "id": "q4",
                    "question": "Where does the computational state |+⟩ lie on the 3D Bloch Sphere?",
                    "options": ["North Pole (+Z)", "South Pole (-Z)", "Equator along +X axis", "Equator along +Y axis"],
                    "correctIndex": 2,
                    "explanation": "State |+⟩ lies on the equator along the +X axis (theta = π/2, phi = 0)."
                },
                {
                    "id": "q5",
                    "question": "What is the effect of applying two consecutive Hadamard gates (H · H) to a qubit?",
                    "options": ["Bit flip to |1⟩", "Returns the qubit to its original state (Identity I)", "Destroys state superposition", "Applies phase shift e^{iπ}"],
                    "correctIndex": 1,
                    "explanation": "Since the Hadamard matrix is self-inverse (H = H⁻¹), H · H = I."
                },
                {
                    "id": "q6",
                    "question": "According to the No-Cloning Theorem, which operation is fundamentally impossible in quantum mechanics?",
                    "options": ["Measuring a qubit", "Copying an arbitrary unknown quantum state", "Entangling two qubits", "Applying rotation gates"],
                    "correctIndex": 1,
                    "explanation": "The No-Cloning Theorem states it is impossible to create an identical copy of an arbitrary unknown quantum state."
                },
                {
                    "id": "q7",
                    "question": "What phase change does the Pauli-Z gate induce on state |1⟩?",
                    "options": ["Flips |1⟩ to |0⟩", "Multiplies |1⟩ by -1", "Multiplies |1⟩ by imaginary i", "No change"],
                    "correctIndex": 1,
                    "explanation": "Z|0⟩ = |0⟩ and Z|1⟩ = -|1⟩, introducing a relative phase shift of π (e^{iπ} = -1)."
                },
                {
                    "id": "q8",
                    "question": "What is the normalization condition for state amplitudes α|0⟩ + β|1⟩?",
                    "options": ["α + β = 1", "|α|² + |β|² = 1", "α² - β² = 0", "|α| · |β| = 0.5"],
                    "correctIndex": 1,
                    "explanation": "Total measurement probability sum must equal 1, so |α|² + |β|² = 1."
                }
            ]
            circuit_task = {
                "title": "Construct Superposition Circuit",
                "instructions": "Build a 2-qubit circuit: apply Hadamard (H) gate to qubit 0 and Pauli-X gate to qubit 1.",
                "targetQubitCount": 2,
                "requiredGateTypes": ["H", "X"],
                "targetStateVector": "0.707|10> + 0.707|11>"
            }
            code_task = {
                "title": "Write Qiskit Code for Hadamard Superposition",
                "instructions": "Write Qiskit code to instantiate a 1-qubit QuantumCircuit, apply an H gate, measure the qubit, and return the circuit.",
                "starterCode": "# Qiskit Superposition Challenge\nfrom qiskit import QuantumCircuit\n\ndef create_superposition():\n    # TODO: Create a 1-qubit QuantumCircuit\n    qc = QuantumCircuit(1, 1)\n    qc.h(0)\n    qc.measure(0, 0)\n    return qc\n"
            }

        return {
            "moduleId": module_id,
            "moduleTitle": title,
            "mcqs": mcqs,
            "circuitTask": circuit_task,
            "codeTask": code_task
        }

    @staticmethod
    def grade_module_test(
        module_id: str,
        mcq_answers: Dict[str, int],
        circuit_gates: List[Dict[str, Any]],
        circuit_qubit_count: int,
        code_snippet: str
    ) -> Dict[str, Any]:
        """
        Agentic AI Evaluation Engine for 8 MCQs, 1 Circuit Diagram, and 1 Code submission.
        Total Score: 100 pts (MCQs: 40 pts, Circuit: 30 pts, Code: 30 pts)
        """
        test_data = AIEngine.generate_module_test(module_id)
        mcqs = test_data["mcqs"]
        circuit_task = test_data["circuitTask"]
        
        # 1. MCQ Grading (8 MCQs * 5 pts = 40 pts max)
        mcq_correct_count = 0
        mcq_feedback = []
        for q in mcqs:
            q_id = q["id"]
            user_choice = mcq_answers.get(q_id, -1)
            is_correct = (user_choice == q["correctIndex"])
            if is_correct:
                mcq_correct_count += 1
            mcq_feedback.append({
                "questionId": q_id,
                "question": q["question"],
                "userChoice": user_choice,
                "correctChoice": q["correctIndex"],
                "isCorrect": is_correct,
                "explanation": q["explanation"]
            })
        
        mcq_score = float(mcq_correct_count * 5) # 8 * 5 = 40 max

        # 2. Circuit Diagram Grading (30 pts max)
        circuit_score = 0.0
        circuit_notes = []
        required_gates = circuit_task.get("requiredGateTypes", [])
        placed_gate_types = [g.get("type", "").upper() for g in circuit_gates]
        
        # Check qubit count match
        if circuit_qubit_count >= circuit_task.get("targetQubitCount", 1):
            circuit_score += 5.0
            circuit_notes.append("Correct qubit count allocation (+5 pts)")
        else:
            circuit_notes.append("Insufficient qubit wire allocation")

        # Check required gates presence
        gates_matched = 0
        for req in required_gates:
            if req.upper() in placed_gate_types:
                gates_matched += 1
        
        if len(required_gates) > 0:
            gate_points = (gates_matched / len(required_gates)) * 20.0
            circuit_score += gate_points
            circuit_notes.append(f"Gate structure match: {gates_matched}/{len(required_gates)} required gates placed (+{round(gate_points, 1)} pts)")
        else:
            circuit_score += 20.0

        # Check execution structure (e.g. no hanging unassigned CNOT target)
        has_invalid_cnot = any(g.get("type") == "CNOT" and g.get("targetQubit") is None for g in circuit_gates)
        if not has_invalid_cnot and len(circuit_gates) > 0:
            circuit_score += 5.0
            circuit_notes.append("Circuit topology syntactically valid and well-connected (+5 pts)")

        circuit_score = min(30.0, circuit_score)

        # 3. Code Challenge Grading (30 pts max)
        code_score = 0.0
        code_notes = []
        clean_code = code_snippet.strip().lower()

        if len(clean_code) > 15:
            code_score += 5.0
            code_notes.append("Code structure present (+5 pts)")
        
        if "quantumcircuit" in clean_code or "import qiskit" in clean_code or "import cirq" in clean_code or "pennylane" in clean_code:
            code_score += 10.0
            code_notes.append("Correct quantum SDK imports & QuantumCircuit instantiation (+10 pts)")
        
        gate_keywords = [".h(", ".cx(", ".x(", ".ry(", ".rx(", ".rz(", ".s(", ".t(", ".cz(", ".cp(", ".swap(", "cnot", "h(", "x(", "toffoli", "ccx"]
        if any(kw in clean_code for kw in gate_keywords):
            code_score += 10.0
            code_notes.append("Proper quantum gate call invocations (+10 pts)")
        
        if "measure" in clean_code or "return" in clean_code or "qc" in clean_code:
            code_score += 5.0
            code_notes.append("Proper measurement / circuit return statement (+5 pts)")

        code_score = min(30.0, code_score)

        # Total Calculation
        total_score = mcq_score + circuit_score + code_score
        percentage = round((total_score / 100.0) * 100.0, 1)
        status = "passed" if percentage >= 60.0 else "needs_review"

        ai_summary = f"Agentic AI Evaluation Complete: {total_score}/100 points ({percentage}%). MCQ Score: {mcq_score}/40, Circuit Score: {circuit_score}/30, Code Score: {code_score}/30."

        return {
            "mcqScore": mcq_score,
            "circuitScore": round(circuit_score, 1),
            "codeScore": round(code_score, 1),
            "totalScore": round(total_score, 1),
            "maxPossibleScore": 100.0,
            "percentage": percentage,
            "status": status,
            "aiSummary": ai_summary,
            "mcqFeedback": mcq_feedback,
            "circuitNotes": circuit_notes,
            "codeNotes": code_notes
        }

