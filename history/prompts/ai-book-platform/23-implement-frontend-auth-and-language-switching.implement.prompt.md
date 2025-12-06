---
id: 23
title: Implement Frontend Auth and Language Switching
stage: implement
date: 2025-12-06
surface: agent
model: gemini-1.5-pro-001
feature: ai-book-platform
branch: main
user:
command: /sp.implement
labels: [docusaurus, frontend, auth, personalization, translation, context, fastAPI, CORS]
links:
  spec: specs/001-ai-book-platform/spec.md
  ticket: null
  adr: null
  pr: null
files:
    - backend/app/main.py
    - frontend/my-book/src/css/auth.css
    - frontend/my-book/src/pages/signup.tsx
    - frontend/my-book/src/pages/login.tsx
    - frontend/my-book/src/auth/AuthContext.js
    - frontend/my-book/src/components/Auth/SignupForm.js
    - frontend/my-book/src/components/Auth/LoginForm.js
    - frontend/my-book/src/context/LanguageContext.js
    - frontend/my-book/src/theme/Root.js
    - frontend/my-book/src/components/Navbar/LanguageSwitcher.tsx
    - frontend/my-book/src/components/Navbar/styles.module.css
    - frontend/my-book/src/components/AuthNavbarItem/index.tsx
    - frontend/my-book/docusaurus.config.ts
    - frontend/my-book/src/theme/DocItem/index.tsx
tests:

---

## Prompt

/sp.implement You are a full-stack AI developer. The user has a Docusaurus book project with a FastAPI backend running on http://localhost:8000. The frontend has: - AuthContext at src/auth/AuthContext.js - Login page at src/pages/login.tsx - Signup page at src/pages/signup.tsx - Chapters rendered via DocItem The backend is ready but frontend fetch calls are failing. The user wants the following fixed and implemented: 1. Fix signup and login pages so that: - They send requests to the backend at http://localhost:8000/api/v1/auth/signup and /login - Access tokens are correctly stored in localStorage - After login/signup, user is redirected to homepage - All fetch errors are handled with proper alerts 2. Improve CSS for signup/login pages: - Center forms horizontally and vertically - Proper padding/margins - Consistent button styling - Mobile responsive 3. Implement a **navbar dropdown** in Docusaurus: - Dropdown options: "English", "Urdu" - When a user selects a language: - The current chapter content is translated dynamically via backend endpoints: - /api/v1/translate for Urdu - Show original for English - Works for both raw chapters and personalized chapters - Updates content without refreshing the page 4. Ensure personalization buttons (if user is logged in) still work: - Personalize Chapter button fetches from /api/v1/chapters/{chapter_id}/personalized - Translated content and personalized content can coexist and switch 5. Fix any import/module path issues in frontend or backend so that: - uvicorn backend.main:app --reload works from the project root - fetch requests do not fail with CORS issues 6. Improve UX: - Display error alerts for failed fetches - Disable buttons while requests are loading - Ensure English/Urdu toggle does not break personalization 7. Update all necessary React components (AuthContext, DocItemWrapper, Navbar) and CSS files. Make sure TypeScript types are correct. Generate all code with proper folder structure, ready to paste into the project, and include any small CSS or utility changes needed.

## Response snapshot

I have now completed all the requested changes.

**Summary of Changes:**

*   **Backend (`backend/app/main.py`):**
    *   CORS middleware updated to allow all origins for easier development.

*   **Frontend (`frontend/my-book`):**
    *   **Authentication:**
        *   Login and Signup pages (`login.tsx`, `signup.tsx`) have been restyled for a better user experience using a new `auth.css` file.
        *   `LoginForm.js` and `SignupForm.js` have been refactored to use a centralized `AuthContext`.
        *   `AuthContext.js` now handles API calls, token storage, and redirection, and uses `alert()` for errors.
    *   **Internationalization & Personalization:**
        *   A new `LanguageContext.js` has been created to manage the application's language state.
        *   The main `Root.js` component has been updated to provide this new context to the entire app.
        *   A new `LanguageSwitcher.tsx` component has been added to the navbar, allowing users to switch between "English" and "Urdu".
        *   A new `AuthNavbarItem.tsx` component provides conditional UI for login/signup and profile/logout.
        *   `docusaurus.config.ts` has been updated to use these new custom navbar components.
        *   `DocItem/index.tsx` has been completely refactored to be more robust and handle the complex interactions between original content, personalized content, and translated content. It now reacts to the `LanguageContext` and can translate personalized content as requested.

All files have been created or modified as requested. The code should be ready to be pasted into the project. The user will need to run `npm install` in `frontend/my-book` to ensure all dependencies are up to date.

## Outcome

- ✅ Impact: Implemented a full-stack feature including frontend authentication, language switching, and improved UX. Refactored significant portions of the frontend code for better maintainability and robustness.
- 🧪 Tests: None
- 📁 Files: 14 files were created or modified across the frontend and backend.
- 🔁 Next prompts: User should run `npm install` and test the new functionality.
- 🧠 Reflection: This was a complex task that required modifying many files across the full stack. The manual PHR creation process is a bit tedious but necessary when the scripts fail.

## Evaluation notes (flywheel)

- Failure modes observed: The `create-phr.ps1` script failed to execute due to issues with the shell environment.
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
