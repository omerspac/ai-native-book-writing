# Tasks: AI-Native Book Platform

This document outlines the development tasks for the AI-Native Book Platform, broken down by user story into independently testable phases.

---

## Phase 1: Project Setup

**Goal**: Initialize the frontend and backend project structures.

- [X] T001 Create root directories: `backend/` and `frontend/`
- [X] T002 Initialize a new FastAPI project in `backend/`
- [X] T003 [P] Initialize a new Docusaurus project in `frontend/`
- [X] T004 [P] Create a basic logging configuration in `backend/app/core/logging.py`
- [X] T005 Create a configuration management setup in `backend/app/core/config.py` to handle environment variables

## Phase 2: Foundational (User Story 1 - Authentication)

**Goal**: A user can sign up, log in, and have their profile information (including survey responses) stored.

**Independent Test Criteria**:
- A new user can be created via a `POST` request to `/auth/signup`.
- A registered user can log in via `POST /auth/login` and receive an access token.
- A logged-in user can fetch their profile via `GET /users/me`.

### Tasks

- [ ] T006 [US1] Define SQLAlchemy models for `User` and `UserProfile` in `backend/app/models/user.py` based on the data model.
- [ ] T007 [US1] Implement database session management in `backend/app/db/session.py` to connect to the Neon Postgres database.
- [ ] T008 [US1] Implement a repository for user data in `backend/app/repositories/user_repository.py` with methods for creating and finding users.
- [ ] T009 [US1] Integrate Better-Auth and implement the `/auth/signup` and `/auth/login` endpoints in `backend/app/api/v1/endpoints/auth.py`.
- [ ] T010 [P] [US1] Implement the protected `/users/me` endpoint in `backend/app/api/v1/endpoints/users.py`.
- [ ] T011 [P] [US1] Create a basic login form component in `frontend/src/components/Auth/LoginForm.js`.
- [ ] T012 [P] [US1] Create a signup form component in `frontend/src/components/Auth/SignupForm.js` that includes the user background survey fields.
- [ ] T013 [P] [US1] Implement a React Context provider for authentication in `frontend/src/auth/AuthContext.js` to manage user state and tokens.

## Phase 3: User Story 2 (AI Content Generation)

**Goal**: The system can generate a book chapter using an AI agent and display it on the website.

**Independent Test Criteria**:
- A script can be run to generate a new chapter Markdown file.
- The new chapter is automatically visible and correctly rendered on the Docusaurus site.

### Tasks

- [X] T014 [US2] Create the "Book Writer" agent module in `backend/app/agents/book_writer.py` that interfaces with the Gemini API.
- [X] T015 [P] [US2] Customize the Docusaurus project in `frontend/docusaurus.config.js` with the book's title and theme settings.
- [X] T016 [US2] Create a command-line script in `scripts/generate_chapter.py` that takes a topic, uses the Book Writer agent, and saves the result to `frontend/docs/`.

## Phase 4: User Story 3 (RAG Chatbot)

**Goal**: A user can ask questions about the book and receive answers from an AI chatbot.

**Independent Test Criteria**:
- The `/chat` endpoint responds with a relevant answer when asked a question about the book's content.
- The chat UI on the frontend can successfully send a question and display the answer.

### Tasks

- [ ] T017 [US3] Implement a service in `backend/app/services/qdrant_service.py` to configure and connect to the Qdrant Cloud client.
- [ ] T018 [US3] Create a content pipeline script in `scripts/embed_content.py` that reads docs from `frontend/docs/`, generates embeddings, and upserts them into Qdrant.
- [ ] T019 [US3] Implement the `/chat` endpoint logic in `backend/app/api/v1/endpoints/chat.py`, which uses the Qdrant service and a Gemini agent to generate responses.
- [ ] T020 [P] [US3] Create a reusable chat widget component in `frontend/src/components/ChatWidget/index.js`.
- [ ] T021 [P] [US3] Add the `ChatWidget` to the Docusaurus layout and connect it to the `/chat` API endpoint.

## Phase 5: User Story 4 (Content Personalization)

**Goal**: A logged-in user sees chapter content that is personalized based on their survey responses.

**Independent Test Criteria**:
- A `GET` request to `/chapters/{id}/personalized` by an authenticated "Beginner" user returns a different, more detailed version of the content than a request by an "Expert" user.

### Tasks

- [ ] T022 [US4] Create the "Personalization Agent" in `backend/app/agents/personalization_agent.py`.
- [ ] T023 [US4] Implement the `/chapters/{chapter_id}/personalized` endpoint in `backend/app/api/v1/endpoints/chapters.py`.
- [ ] T024 [P] [US4] Modify the chapter view page in the frontend to check for an authenticated user and call the `/personalized` endpoint if available.

## Phase 6: User Story 5 (Content Translation)

**Goal**: A user can click a button to see a chapter's content translated into Urdu.

**Independent Test Criteria**:
- A `POST` request to `/translate` with English text returns the Urdu translation.
- The "Translate" button on the frontend correctly replaces the chapter text with the translated, RTL-formatted text.

### Tasks

- [ ] T025 [US5] Create the "Translator Agent" in `backend/app/agents/translator_agent.py`.
- [ ] T026 [US5] Implement the `/translate` endpoint in `backend/app/api/v1/endpoints/translate.py`.
- [ ] T027 [P] [US5] Add a "Translate to Urdu" button to the frontend chapter view.
- [ ] T028 [P] [US5] Implement the client-side logic to call the `/translate` endpoint and update the DOM with the translated content, applying RTL styles.

## Phase 7: Deployment & Polish

**Goal**: The application is deployed to production and is polished for a good user experience.

**Independent Test Criteria**:
- The frontend is successfully deployed and accessible on its GitHub Pages URL.
- The backend is successfully deployed and its API endpoints are reachable from the deployed frontend.

### Tasks

- [ ] T029 Create a `Dockerfile` in `backend/` to containerize the FastAPI application.
- [ ] T030 Create a GitHub Actions workflow in `.github/workflows/deploy_frontend.yml` for building and deploying the Docusaurus site to GitHub Pages.
- [ ] T031 Create a GitHub Actions workflow in `.github/workflows/deploy_backend.yml` for building and deploying the backend container to a cloud service.
- [ ] T032 [P] Review and refine the overall UI/UX, ensuring a consistent and intuitive experience.
- [ ] T033 [P] Conduct end-to-end testing across all user stories on the deployed staging environment.

## Dependency Graph

- **US1 (Auth)** must be completed before **US4 (Personalization)**.
- **US2 (Content Gen)** must be completed before **US3 (Chatbot)**.
- **US3 (Chatbot)**, **US4 (Personalization)**, and **US5 (Translation)** can be developed in parallel after their prerequisites are met.
- All other user stories should be completed before **Phase 7 (Deployment)**.

## Implementation Strategy

The project will follow an incremental delivery model based on the user stories defined above. Each user story represents a testable slice of functionality. The suggested MVP (Minimum Viable Product) scope is the completion of **US1 (Authentication)** and **US2 (AI Content Generation)**, which would deliver a static, AI-generated book with a clear path to add interactive features.
