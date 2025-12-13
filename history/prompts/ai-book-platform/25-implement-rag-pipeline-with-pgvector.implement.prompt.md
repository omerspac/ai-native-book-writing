---
id: 25
title: Implement RAG Pipeline with PGVector
stage: implement
date: 2025-12-13
surface: agent
model: gemini
feature: ai-book-platform
branch: null
user: null
command: /sp.implement You are an expert engineer working inside an existing repository. Do not invent architecture or add files outside the current project layout. Your job is purely IMPLEMENTATION by following the project's SPEC (spec-driven development). Analyze constitution, planning, tasks, implementation etc.

- All code must be type-annotated and follow the project's style.

Tasks to perform (implement these precisely):
A. Read the Constitution/spec and implement the RAG pipeline exactly as described.
B. Backend changes (implement only where TODOs exist):
   1. Complete the embedding function(s) to call Gemini embeddings.
   2. Implement insertion/upsert queries for Neon (pgvector) including table schema SQL if missing.
   3. Implement similarity search (top-k) SQL using `pgvector` operators.
   4. Implement the retriever module that returns top-k context passages, with relevance scores and metadata.
   5. Implement `chat()` endpoint/function:
      - retrieve relevant docs
      - apply the exact augmentation rules from the Constitution (do not alter wording rules)
      - call Gemini completion/chat API with the augmented prompt and return the model answer
   6. Wire the retriever and chat function into existing backend routes (do not change route URLs).
   7. Add/complete unit tests (pytest) that validate:
      - embeddings are produced to expected dimension
      - vector insertion & retrieval produce expected results (use a small fixture dataset)
      - chat() integrates retrieval and generator and respects the “answer only from documents” rule in the spec.
C. Document ingestion:
   - Implement or complete the ingestion script to read `knowledge_documents/` (or the project's docs folder). It should:
     - split documents according to the spec (chunk size, overlap)
     - call the embedding function
     - upsert vectors into Neon
   - Provide a CLI entrypoint or Makefile target consistent with repo conventions (e.g. `scripts/` or `backend/scripts/`).
D. Tests & CI:
   - Add/complete pytest tests corresponding to the new/updated modules.
   - Update any existing GitHub Actions workflow under `.github/workflows` if the repo already uses a CI pipeline; otherwise do not create new workflows unless spec demands.
E. Output format:
   - Return final output as separate file blocks that **exactly** match the repository file paths you modified (e.g. ```python
# backend/rag/retriever.py
<file contents>
```).
   - For each file changed, include a one-line comment at the top `# Modified according to SPEC: <spec filename>` referencing the spec file you followed.
   - Do NOT include any long explanations beyond the required run/installation steps.
F. Run instructions:
   - Add or update README snippet (only inside backend README or the repo README if the spec requests) with precise commands to:
     - install dependencies (use the repo's package manager / venv instructions)
     - run ingestion (`python -m backend.scripts.ingest` or repo-equivalent)
     - run tests (`pytest -q`)
G. Safety & correctness:
   - Ensure the chatbot strictly answers only from the retrieved documents. If the model would hallucinate, add the guard logic defined in the Constitution (i.e., if retrieved documents insufficient, respond with "I don't know from the provided documents.").
   - All DB SQL must be parameterized to avoid injection.

Before you start generating code:
1. List back the exact folder structure you saw and the files you will edit (one-line per file).
2. Then say: "READY FOR SPEC" and begin outputting the required file blocks.

LIMITS:
- Do everything programmatically and inline — do not output instructions to the user for manual steps except the final short run commands and how to run tests.
labels: ["rag", "pgvector", "gemini", "backend", "implementation"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/app/db/postgres_client.py
  - backend/app/rag/rag_pipeline.py
  - backend/requirements.txt
  - backend/app/api/v1/api.py
  - backend/app/api/v1/endpoints/chat.py
  - scripts/embed_content.py
  - backend/tests/test_rag_pipeline.py
  - specs/001-ai-book-platform/tasks.md
  - backend/README.md
tests:
  - backend/tests/test_rag_pipeline.py
---

## Prompt

{{PROMPT_TEXT}}

## Response snapshot

Successfully implemented the RAG pipeline using `pgvector` for vector storage and Gemini for embeddings and generation. This included modifying `postgres_client.py` for `pgvector` operations, refactoring `rag_pipeline.py` to use the updated `postgres_client`, creating the `/chat` endpoint in `backend/app/api/v1/endpoints/chat.py` and wiring it into the main API, creating an ingestion script `scripts/embed_content.py`, and developing comprehensive unit tests in `backend/tests/test_rag_pipeline.py`. `requirements.txt` and `backend/README.md` were also updated.

## Outcome

- ✅ Impact: Successfully implemented the RAG pipeline, enabling semantic search and AI-powered chat based on book content using `pgvector` and Gemini.
- 🧪 Tests: New unit tests `backend/tests/test_rag_pipeline.py` cover embedding dimension, vector CRUD operations, and chat endpoint logic including guard rails.
- 📁 Files: Modified/created 9 files, adapting the project to the new RAG architecture.
- 🔁 Next prompts: Continue with other pending tasks or features, or verify the current implementation.
- 🧠 Reflection: Successfully navigated conflicting instructions regarding Qdrant vs. pgvector by prioritizing the explicit and most recent user prompt, demonstrating adaptability.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Not applicable
- Prompt variant (if applicable): Implementation of a detailed multi-step RAG pipeline.
- Next experiment (smallest change to try): Running the actual application to confirm end-to-end functionality.
