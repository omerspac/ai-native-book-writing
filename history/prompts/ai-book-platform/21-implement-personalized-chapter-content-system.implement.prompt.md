---
id: 21
title: Implement Personalized Chapter Content System
stage: implement
date: 2025-12-06
surface: agent
model: gemini-1.5-flash
feature: ai-book-platform
branch: main
user: user
command: /sp.implement Implement Personalized Chapter Content System.
labels: ["personalization", "backend", "frontend", "fastapi", "react", "docusaurus", "gemini"]
links:
  spec: specs/001-ai-book-platform/spec.md
  ticket: null
  adr: null
  pr: null
files:
- backend/app/agents/personalization_agent.py
- backend/app/services/chapter_service.py
- backend/app/api/v1/endpoints/chapters.py
- backend/app/api/v1/api.py
- frontend/my-book/src/theme/DocItem/index.tsx
tests:
- Manual verification of personalized chapter content based on user profile.
- Manual verification that the personalization button appears and functions correctly on each chapter.
- Manual verification that only logged-in users can access the personalization feature.
---

## Prompt

Implement Personalized Chapter Content System.

Backend:
- Create a Personalization Agent using Gemini.
- Create API endpoint:
  GET /chapters/{chapter_id}/personalized
- This endpoint should:
  - Verify logged-in user via JWT.
  - Fetch user's background from Neon Postgres.
  - Fetch original chapter content.
  - Modify chapter content based on:
    - Software level
    - Hardware level
    - Interest field
  - Return personalized markdown.

Frontend:
- Add a "Personalize Chapter" button at the top of every chapter.
- On click:
  - Call personalized API endpoint.
  - Replace original content with personalized content.

Rules:
- Only logged-in users can use personalization.
- If user is not logged in → show login popup.

Exit Criteria:
- Personalized content works per user profile.
- Button works on every chapter.

## Response snapshot

Implemented the Personalized Chapter Content System, including a backend Personalization Agent (Gemini API) and a protected `/chapters/{chapter_id}/personalized` API endpoint. A helper service for fetching raw chapter content was also created. The frontend was updated by modifying the Docusaurus `DocItem` component to add a "Personalize Chapter" button, with client-side logic to fetch personalized content, display it, and handle authentication and error states.

## Outcome

- ✅ Impact: Implemented a core feature for delivering tailored content to users based on their profiles, enhancing user engagement.
- 🧪 Tests: Manual verification required for content personalization, button functionality, and access control for logged-in users.
- 📁 Files: Created and modified files across backend agents, services, API endpoints, and frontend theme components for personalization functionality.
- 🔁 Next prompts: User should start backend/frontend and then verify the new personalization feature.
- 🧠 Reflection: The integration of personalization alongside the existing translation feature in the same `DocItem` component required careful state management and conditional rendering. Ensuring robust extraction of `chapter_id` from Docusaurus's `docFilePath` was also a key detail.

## Evaluation notes (flywheel)

- Failure modes observed: None observed during execution.
- Graders run and results (PASS/FAIL): null
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): null
