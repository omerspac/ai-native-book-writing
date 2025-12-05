# Implementation Plan: AI-Native Book Platform

**Feature**: [AI-Native Book Platform](./spec.md)
**Version**: 1.0
**Status**: In Progress

---

## 1. Technical Context & Architecture

This plan outlines the development of the AI-Native Book Platform, a system designed to generate technical books using AI, provide interactive RAG-based chat, and deliver personalized content.

The proposed architecture consists of:
- **Frontend**: A Docusaurus-based static site for displaying book content. This will be enhanced with custom React componentsS for authentication, chat, and other interactive features.
- **Backend**: A FastAPI application serving as the system's core. It will manage user authentication, orchestrate AI sub-agents, handle chat requests, and serve personalized content.
- **AI Layer**: A suite of Gemini-powered sub-agents, invoked via the backend, for specialized tasks: content generation (Book Writer), chat optimization (RAG Optimizer), translation (Translator), and content personalization (Personalization Agent).
- **Data Layer**:
    - **User Data**: Neon Serverless Postgres for storing user profiles, authentication details, and personalization survey responses.
    - **Vector Embeddings**: Qdrant Cloud for storing and retrieving vector embeddings of the book content to power the RAG chatbot.
- **Authentication**: Better-Auth will be integrated into the FastAPI backend to manage user signup and sign-in.

## 2. Constitution Check

This plan has been reviewed against the `constitution.md` document.

- **[✅] Code Quality**: Adherence to PEP 8 for the FastAPI backend and standard frontend style guides is required. All PRs will undergo review.
- **[✅] Testing Standards**: Each phase will include the development of unit and integration tests. The goal is to achieve >80% coverage for all new backend logic.
- **[✅] User Experience Consistency**: Docusaurus provides a consistent UI foundation. Custom components will follow a unified design language.
- **[✅] Performance Requirements**: API endpoints will be designed for low latency (<500ms p95). Chat responses are expected within 5 seconds.

## 3. Phased Execution Plan

### Phase 1: Foundation & Core Backend (1-2 weeks)

**Goal**: Establish the project's foundation, including the backend server, user database, and authentication system.

**Tech Stack**: FastAPI, Neon Postgres, Better-Auth, Pydantic, Docker.

**Key Tasks**:
1.  Initialize FastAPI backend project with a modular structure.
2.  Define Pydantic models for `User` and `UserProfileSurvey`.
3.  Integrate Better-Auth for user signup and sign-in endpoints.
4.  Set up the Neon Serverless Postgres database and connect it to the FastAPI backend using an ORM (e.g., SQLAlchemy).
5.  Create a `UserRepository` for CRUD operations on user data.
6.  Implement basic unit tests for authentication endpoints and user repository.
7.  Containerize the FastAPI application using Docker for consistent development and deployment environments.

**Exit Criteria**:
- Users can successfully sign up, log in, and log out.
- User data is correctly persisted in the Neon Postgres database.
- The project is containerized and has a basic CI pipeline for running tests.

### Phase 2: AI Content Generation & Frontend Scaffolding (1 week)

**Goal**: Implement the initial AI book generation logic and set up the Docusaurus frontend to display it.

**Tech Stack**: Gemini CLI, Docusaurus, React.

**Key Tasks**:
1.  Set up a new Docusaurus project.
2.  Develop a "Book Writer" sub-agent (as a Python module) that uses the Gemini API to generate a chapter of a book based on a prompt.
3.  Create a CLI command or script to invoke the Book Writer agent and save the output as a Markdown file in the Docusaurus project directory.
4.  Customize the Docusaurus theme and navigation to support a book structure.
5.  Manually generate a sample chapter to verify the display and formatting on the Docusaurus site.

**Exit Criteria**:
- A sample book chapter can be generated via an AI agent.
- The generated Markdown file is correctly rendered by the Docusaurus frontend.

### Phase 3: RAG Chatbot & Vector Search (2 weeks)

**Goal**: Implement the RAG-based chatbot for answering questions on the book's content.

**Tech Stack**: Qdrant, FastAPI, Gemini.

**Key Tasks**:
1.  Set up a free-tier Qdrant Cloud instance.
2.  Create a "Content Pipeline" service that:
    - Ingests Markdown content from the book.
    - Chunks the text into manageable pieces.
    - Generates vector embeddings for each chunk using a Gemini embedding model.
    - Stores the chunks and their embeddings in Qdrant.
3.  Create a `/chat` endpoint in the FastAPI backend that:
    - Takes a user's question.
    - Generates an embedding for the question.
    - Queries Qdrant to find the most relevant text chunks from the book.
    - Passes the question and the retrieved chunks to a Gemini model to generate a conversational answer.
4.  Implement a basic chat interface component in the Docusaurus frontend.
5.  Integrate the chat component with the backend `/chat` endpoint.

**Exit Criteria**:
- The chatbot can successfully answer questions based on the content of the generated book.
- The chat interface is functional on the Docusaurus website.

### Phase 4: Personalization & Translation (1-2 weeks)

**Goal**: Add content personalization and one-click Urdu translation.

**Tech Stack**: FastAPI, Gemini.

**Key Tasks**:
1.  Develop a "Personalization Agent" that takes a chapter's content and a user's profile (e.g., "Beginner") and modifies the text accordingly.
2.  Create a `/chapters/{chapter_id}/personalized` endpoint that returns the personalized version of a chapter for the currently authenticated user.
3.  Develop a "Translator Agent" that translates a given text block into Urdu.
4.  Create a `/translate` endpoint that takes text content and returns the Urdu translation.
5.  Update the Docusaurus frontend to:
    - Fetch personalized content when a user is logged in.
    - Add a "Translate to Urdu" button that calls the translation endpoint and replaces the content on the page.

**Exit Criteria**:
- Logged-in users see chapter content tailored to their background survey responses.
- The "Translate to Urdu" button successfully translates and displays chapter content in RTL format.

### Phase 5: UI/UX Polish & Deployment (1 week)

**Goal**: Refine the user experience and deploy the full application.

**Tech Stack**: GitHub Actions, GitHub Pages, Cloud Service (Render/Vercel).

**Key Tasks**:
1.  Refine the UI/UX of the chat interface, authentication flow, and overall site design.
2.  Ensure seamless integration between all features.
3.  Create a GitHub Actions workflow to automatically deploy the Docusaurus frontend to GitHub Pages on pushes to the `main` branch.
4.  Create a second GitHub Actions workflow to build and deploy the containerized FastAPI backend to a cloud service like Render or Vercel.
5.  Conduct end-to-end testing of the deployed application.

**Exit Criteria**:
- The application is publicly accessible.
- Deployment pipelines are automated.
- All core features are functional in the production environment.

## 4. Risk Analysis & Mitigation

- **Risk 1 (High):** AI-generated content is low-quality or inconsistent.
  - **Mitigation:** Implement a human-in-the-loop review process for each chapter. Develop strong, iterative prompting strategies for the Book Writer agent.
- **Risk 2 (Medium):** Integration conflict between the chosen Chat UI library and the Gemini model.
  - **Mitigation:** Per the resolved specification, the UI library will be prioritized. The backend will be adapted, or if necessary, an alternative AI model will be explored to ensure compatibility.
- **Risk 3 (Low):** Cost overruns on cloud services.
  - **Mitigation:** Start with the free tiers for all services (Qdrant, Neon). Implement budget alerts and regularly monitor usage dashboards.

## 5. Stretch Goals ("Bonus Marks")

- **UI for Plan Management**: A user interface where authors can create, edit, and manage the execution "Plans" for the AI agents.
- **Real-time Chat Feedback**: Allow users to give a thumbs-up/thumbs-down on chat responses to create a feedback loop for improving the RAG agent.
- **Multi-language Support**: Extend the translation feature to support more languages.

## 6. Deployment Strategy

- **Frontend (Docusaurus)**: Deployed as a static site on **GitHub Pages**. A GitHub Actions workflow will trigger on merges to `main`, build the Docusaurus project, and push the static files to the `gh-pages` branch.
- **Backend (FastAPI)**: Deployed as a containerized web service on **Render** (or a similar PaaS). A second GitHub Actions workflow will build the Docker image, push it to a container registry (like Docker Hub or GitHub Container Registry), and trigger a deployment on Render.