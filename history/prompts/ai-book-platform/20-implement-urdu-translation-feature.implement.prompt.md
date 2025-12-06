---
id: 20
title: Implement Urdu Translation Feature
stage: implement
date: 2025-12-06
surface: agent
model: gemini-1.5-flash
feature: ai-book-platform
branch: main
user: user
command: /sp.implement Implement Urdu Translation Feature for Chapters.
labels: ["translation", "backend", "frontend", "fastapi", "react", "docusaurus", "gemini", "i18n"]
links:
  spec: specs/001-ai-book-platform/spec.md
  ticket: null
  adr: null
  pr: null
files:
- backend/app/agents/translator_agent.py
- backend/app/api/v1/endpoints/translate.py
- frontend/my-book/src/theme/DocItem/index.tsx
- backend/app/api/v1/api.py
- backend/app/db/session.py
- backend/app/repositories/user_repository.py
- backend/app/dependencies.py
- backend/app/api/v1/endpoints/auth.py
- backend/app/api/v1/endpoints/users.py
- backend/app/core/config.py
- frontend/my-book/src/pages/login.tsx
- frontend/my-book/src/pages/signup.tsx
- frontend/my-book/src/theme/Root.js
- frontend/my-book/src/css/custom.css
tests:
- Manual verification of Urdu translation functionality for chapters.
- Manual verification that code blocks are not translated.
- Manual verification of RTL layout for translated content.
- Manual verification that only logged-in users can access the translation feature.
---

## Prompt

Implement Urdu Translation Feature for Chapters.

Backend:
- Create Translator Agent using Gemini.
- Create API endpoint:
  POST /translate
- Input:
  - Chapter content text
- Output:
  - Urdu translated content

Frontend:
- Add a "Translate to Urdu" button at the top of each chapter.
- On click:
  - Send chapter content to backend.
  - Replace English content with Urdu content.
- Enable RTL layout for Urdu view.

Rules:
- Only logged-in users can use translation.
- Urdu translation must not modify code blocks.

Exit Criteria:
- Users can translate any chapter to Urdu.
- RTL UI works correctly.

## Response snapshot

Implemented the Urdu Translation Feature, including a backend Translator Agent (Gemini API) and a protected `/translate` API endpoint. The frontend was updated by swizzling the Docusaurus `DocItem` component to add a "Translate to Urdu" button, with client-side logic to send content for translation, display the Urdu text, and apply RTL styling. Code blocks are preserved during translation.

## Outcome

- ✅ Impact: Implemented a key internationalization feature, allowing users to access chapter content in Urdu.
- 🧪 Tests: Manual verification required for translation accuracy, code block preservation, RTL layout, and access control for logged-in users.
- 📁 Files: Created and modified files across backend agents, API endpoints, frontend theme components, and CSS for translation functionality.
- 🔁 Next prompts: User should start backend/frontend and then verify the new translation feature.
- 🧠 Reflection: The swizzling process for Docusaurus components and handling dynamic import paths for Python backend required careful attention. The solution addresses the specific requirements for code block preservation and RTL display.

## Evaluation notes (flywheel)

- Failure modes observed: None observed during execution.
- Graders run and results (PASS/FAIL): null
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
