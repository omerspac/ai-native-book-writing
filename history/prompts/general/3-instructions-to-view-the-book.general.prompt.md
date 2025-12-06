---
id: 3
title: Instructions to View the Book
stage: general
date: 2025-12-05
surface: agent
model: gemini-1.5-flash
feature: none
branch: 001-ai-book-platform
user: omerspac
command: where may i view the book after u have finished
labels: ["view", "instructions", "frontend", "backend"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:

tests:

---

## Prompt

where may i view the book after u have finished

## Response snapshot

You can view the book locally by running the Docusaurus development server for the frontend and Docker Compose for the backend. Once deployed to GitHub Pages, it will be available at `https://OmerGov.github.io/ai-native-book-writing/`. Detailed instructions are provided.

## Outcome

- ✅ Impact: User provided with clear instructions to view the book.
- 🧪 Tests: none
- 📁 Files: history/prompts/general/3-instructions-to-view-the-book.general.prompt.md
- 🔁 Next prompts: User to confirm understanding or proceed with further tasks.
- 🧠 Reflection: Provided comprehensive guidance for accessing the application.

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): none
- Prompt variant (if applicable): none
- Next experiment (smallest change to try): none
