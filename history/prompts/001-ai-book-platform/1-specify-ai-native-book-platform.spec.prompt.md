---
id: 1
title: Specify AI-Native Book Platform
stage: spec
date: 2025-12-05
surface: agent
model: gemini-pro-1.5
feature: ai-book-platform
branch: 001-ai-book-platform
user: user
command: |
  We are building a unified AI-driven book platform using:
  - Docusaurus for documentation website
  - Gemini CLI as the AI author and coding agent (instead of Claude)
  - FastAPI backend
  - OpenAI Agents SDK for chat responses
  - Neon Serverless Postgres for user authentication and profiles
  - Qdrant Cloud Free Tier for vector embeddings
  - Better-Auth for Signup and Signin

  Core Functionalities:
  1. AI-generated technical book
  2. Deployment on GitHub Pages
  3. RAG chatbot that answers questions using book content
  4. Selected-text-only question answering mode
  5. User authentication with signup background survey
  6. Personalized chapter content based on user background
  7. One-click Urdu translation per chapter (RTL supported)
  8. Gemini-based reusable subagents (book writer, RAG optimizer, translator, personalization agent)

  The specification must include:
  - System overview
  - User roles
  - Functional requirements
  - Non-functional requirements
  - Constraints
  - Risks
  - Assumptions
  - Success criteria
labels: ["specification", "feature", "AI-book"]
links:
  spec: ./specs/001-ai-book-platform/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-ai-book-platform/spec.md
  - specs/001-ai-book-platform/checklists/requirements.md
tests:
  null
---

## Prompt

We are building a unified AI-driven book platform using:
- Docusaurus for documentation website
- Gemini CLI as the AI author and coding agent (instead of Claude)
- FastAPI backend
- OpenAI Agents SDK for chat responses
- Neon Serverless Postgres for user authentication and profiles
- Qdrant Cloud Free Tier for vector embeddings
- Better-Auth for Signup and Signin

Core Functionalities:
1. AI-generated technical book
2. Deployment on GitHub Pages
3. RAG chatbot that answers questions using book content
4. Selected-text-only question answering mode
5. User authentication with signup background survey
6. Personalized chapter content based on user background
7. One-click Urdu translation per chapter (RTL supported)
8. Gemini-based reusable subagents (book writer, RAG optimizer, translator, personalization agent)

The specification must include:
- System overview
- User roles
- Functional requirements
- Non-functional requirements
- Constraints
- Risks
- Assumptions
- Success criteria

## Response snapshot

Successfully generated the feature specification for 'AI-Native Book Platform'. The spec was created at `specs/001-ai-book-platform/spec.md` and the corresponding checklist at `specs/001-ai-book-platform/checklists/requirements.md`. Clarification questions regarding 'Chat UI Component Integration' and 'Translation Quality' were presented and resolved with user input.

## Outcome

- ✅ Impact: Specification for 'AI-Native Book Platform' created and clarified.
- 🧪 Tests: No tests were executed for this command.
- 📁 Files: Created `spec.md` and `requirements.md` for feature `001-ai-book-platform`.
- 🔁 Next prompts: The next step is to proceed with planning (`/sp.plan`).
- 🧠 Reflection: Successfully generated feature specification and resolved clarifications after initial script execution issues. Manual file creation confirmed directory structure management with `write_file`.

## Evaluation notes (flywheel)

- Failure modes observed: Initial script execution failed due to PowerShell argument parsing; addressed by manual file creation and targeted `write_file` operations.
- Graders run and results (PASS/FAIL): null
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): Investigate PowerShell argument parsing for `create-new-feature.ps1` to prevent future script failures.
