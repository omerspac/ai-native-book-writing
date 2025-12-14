---
id: 29
title: Customize Docusaurus Homepage and Navbar
stage: implement
date: 2025-12-14
surface: agent
model: gemini-1.5-pro-001
feature: ai-book-platform
branch: main
user: "{{USER}}"
command: "/sp.implement"
labels: ["frontend", "docusaurus", "react", "homepage"]
links:
  spec: "specs/001-ai-book-platform/spec.md"
  ticket: "null"
  adr: "null"
  pr: "null"
files:
 - frontend/my-book/docusaurus.config.ts
 - frontend/my-book/src/pages/index.tsx
 - frontend/my-book/src/components/ChapterCard.tsx
 - frontend/my-book/src/components/ChapterCard.css
 - frontend/my-book/src/css/homepage.css
tests:
- "none"
---

## Prompt

/sp.implement You are a frontend software assistant. Do **not delete any files unnecessarily**. Only modify or add code needed for the tasks.

Tasks:

1. Remove the **Blog** button from the navbar of my Docusaurus site.

2. Replace the homepage layout:
   - Remove the default Docusaurus hero and tutorial sections.
   - Display **10 cards**, each representing a chapter of my book "Physical AI & Humanoid Robotics".
   - Each card should include:
     - Chapter title
     - A short description (use placeholder text if not available)
     - A "Read" button that links to the chapter page (use `/docs/chapterX` as link placeholders)
   - Arrange cards in a **grid layout** for desktop and a **responsive layout** for mobile.
   - Style cards with **soft shadows, rounded corners, hover effects**, and consistent book-themed colors.

3. Keep the rest of the site intact, including the navbar (except the Blog button) and footer.

4. Output ready-to-paste **React/TypeScript code** including any necessary CSS or styling.

5. Ensure code is clean, modular, and compatible with Docusaurus.

## Response snapshot

I have successfully customized the Docusaurus site as requested.

- The "Blog" link has been removed from the navbar and the footer in `docusaurus.config.ts`.
- The homepage has been completely redesigned.
- The new homepage (`src/pages/index.tsx`) now features a responsive grid of 10 cards, each representing a chapter of the book.
- A modular `ChapterCard` component was created, along with its own CSS for styling, to ensure the code is clean and reusable.
- Additional CSS was created for the homepage layout.

## Outcome

- ✅ Impact: The Docusaurus homepage and navigation are now customized to better fit the book-centric purpose of the site.
- 🧪 Tests: No new tests were added.
- 📁 Files: 
  - `frontend/my-book/docusaurus.config.ts` (modified)
  - `frontend/my-book/src/pages/index.tsx` (modified)
  - `frontend/my-book/src/components/ChapterCard.tsx` (created)
  - `frontend/my-book/src/components/ChapterCard.css` (created)
  - `frontend/my-book/src/css/homepage.css` (created)
- 🔁 Next prompts: The user can now ask to run the frontend to see the changes.
- 🧠 Reflection: The request was clear and involved multiple file changes. Breaking it down into modifying the config, creating a new component, and then creating the main page made the process straightforward.
