# Unified AI-Driven Book & RAG Platform — Master Plan

## 1. Project Overview
This project is a unified AI-driven documentation and learning platform built using Docusaurus, Gemini CLI, FastAPI, and Retrieval-Augmented Generation (RAG). The system delivers an interactive book experience with AI-powered question answering, user authentication, personalization, and dynamic Urdu translation.

The solution replaces Claude Code with Gemini CLI while preserving all intelligent agent workflows.

---

## 2. Core Objectives
- Generate a complete technical book using Gemini CLI
- Publish the book on GitHub Pages using Docusaurus
- Implement a RAG chatbot for book-based Q&A
- Support selected-text-only question answering
- Enable secure authentication and user profiling
- Provide chapter-level personalization
- Provide one-click Urdu translation for every chapter

---

## 3. Technology Stack

### Frontend:
- Docusaurus (React)
- Custom JS widgets for chatbot & controls

### Backend:
- FastAPI (Python)
- OpenAI Agents SDK
- Gemini CLI (for content & subagents)

### Databases:
- Neon Serverless PostgreSQL (User profiles & auth)
- Qdrant Cloud Free Tier (Vector embeddings)

### Authentication:
- Better-Auth

### Deployment:
- GitHub Pages (Docusaurus)
- Railway / Render (FastAPI backend)

---

## 4. System Architecture Overview

1. Gemini CLI generates book content
2. Content is stored in Docusaurus Markdown files
3. Book embeddings are created and stored in Qdrant
4. User queries go to FastAPI
5. Relevant context is retrieved from Qdrant
6. OpenAI Agent generates answers
7. User authentication flows via Better-Auth
8. User profile personalizes content per chapter
9. Urdu translation is generated on-demand and cached

---

## 5. AI & Subagent Strategy (Bonus Component)

Gemini-based Subagents:
- Book Writer Agent
- RAG Optimization Agent
- Quiz Generator Agent
- Urdu Translator Agent
- Personalization Adapter Agent

Each agent operates using well-defined prompt workflows and outputs reusable intelligence.

---

## 6. Personalization Strategy

Based on the user's background:
- Beginner users receive more basic explanations
- Advanced users receive deeper technical material
- Personalization is triggered via chapter-level button

---

## 7. Urdu Translation Strategy

- On-demand translation via AI
- Caching in database
- Right-to-Left rendering in UI

---

## 8. Security Considerations

- JWT authentication
- Secure API routes
- Rate-limiting on chatbot endpoint
- Input sanitization

---

## 9. Deployment Strategy

- GitHub Pages for static docs
- FastAPI on Railway or Render
- Neon Cloud PostgreSQL
- Qdrant Cloud free-tier instance

---

## 10. Final Deliverables

- Live Book URL
- Live Chatbot
- GitHub Repository
- Project Report
