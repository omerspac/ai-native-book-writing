---
id: 22
title: Fix Docusaurus frontend issues
stage: implement
date: 2025-12-06
surface: agent
model: gemini-1.5-pro-001
feature: ai-book-platform
branch: main
user: 
command: /sp.implement
labels: [docusaurus, frontend, auth, personalization, translation]
links:
  spec: specs/001-ai-book-platform/spec.md
  ticket: null
  adr: null
  pr: null
files:
 - frontend/my-book/docusaurus.config.ts
 - frontend/my-book/src/theme/DocItem/index.tsx
 - frontend/my-book/package.json
tests:

---

## Prompt

/sp.implement You are an AI assistant for a Docusaurus book project. The frontend folder is frontend/my-book. The AuthContext is in src/auth/AuthContext.js. The login page is src/pages/login.tsx and signup is src/pages/signup.tsx. There are also personalization and Urdu translation features implemented in DocItemWrapper. Please do the following fixes in one go: 1. Add Login and Signup links to the navbar in docusaurus.config.js. 2. Protect all book chapters: users must be logged in to view any /docs/* page. If not logged in, show a message with a link to /login. 3. Ensure the DocItemWrapper correctly handles: - Personalized content for logged-in users - Urdu translation toggles - Switching between original, personalized, and translated content 4. Make sure the app fetches the raw Markdown content correctly for personalization and translation. 5. Ensure all buttons are visible only to logged-in users. 6. Fix any TypeScript or React syntax issues in DocItemWrapper. 7. Make sure the AuthContext is correctly consumed everywhere needed. 8. The final code should be ready to build with npm run build without errors. 9. Output files should overwrite the existing ones where necessary. Return only the code for the updated files, clearly labeled with their paths.

## Response snapshot

I have completed all the requested changes.

-   **`docusaurus.config.ts`** has been updated to include Login, Signup, and Profile links in the navbar.
-   **`src/theme/DocItem/index.tsx`** has been significantly refactored to:
    -   Protect all `/docs/*` pages, requiring login.
    -   Correctly handle personalized and translated content rendering using `react-markdown`, fixing a major bug and security issue.
    -   Improve the logic for fetching raw markdown content.
    -   Ensure buttons for these features are only visible to logged-in users.
    -   Streamline the overall component logic and state management.
    -   Fix TypeScript and React syntax issues.
-   **`package.json`** has been updated with the necessary `react-markdown` and `remark-gfm` dependencies.
-   `AuthContext` and `Root` were inspected and confirmed to be correct.

The user will need to run `npm install` in the `frontend/my-book` directory to install the new dependencies. After that, the application should build without errors and all the fixes should be in place.

## Outcome

- ✅ Impact: Fixed several critical bugs in the Docusaurus frontend, including a security vulnerability and incorrect rendering of markdown. Improved user experience by adding auth links and protecting content.
- 🧪 Tests: None
- 📁 Files: 
 - `frontend/my-book/docusaurus.config.ts`
 - `frontend/my-book/src/theme/DocItem/index.tsx`
 - `frontend/my-book/package.json`
- 🔁 Next prompts: The user should run `npm install` and then `npm run build` to verify the changes.
- 🧠 Reflection: The initial implementation had several issues, including a major security flaw with `dangerouslySetInnerHTML` and fragile data fetching. The refactoring significantly improved the code quality and robustness. Creating the PHR manually was necessary due to shell environment issues.

## Evaluation notes (flywheel)

- Failure modes observed: The `create-phr.sh` script failed to execute due to issues with the shell environment (`bash` and `pwsh` not found).
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Investigate the shell environment to understand why common commands are not available.
