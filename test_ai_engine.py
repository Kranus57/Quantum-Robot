import sys
import io

# Ensure UTF-8 stdout encoding for Windows terminals
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from backend.ai_engine import AIEngine

def main():
    print("==================================================")
    print("TESTING STARK SENSEI (AI TUTOR ENGINE)")
    print("==================================================")

    test_queries = [
        "What is quantum superposition and how does a Hadamard gate create it?",
        "Write a Python function to perform binary search on a sorted list.",
        "Why is photosynthesis important and how does it relate to light energy?"
    ]

    for idx, query in enumerate(test_queries, 1):
        print(f"\n[Test {idx}] Query: \"{query}\"")
        print("-" * 50)
        try:
            response = AIEngine.explain_concept(query=query)
            preview = response[:250].strip().replace("\n", " ")
            print(f"Status: SUCCESS ({len(response)} characters generated)")
            print(f"Preview: {preview}...")
        except Exception as e:
            print(f"Status: ERROR - {e}")

    print("\n==================================================")
    print("All dynamic test queries completed successfully!")
    print("==================================================")

if __name__ == "__main__":
    main()
