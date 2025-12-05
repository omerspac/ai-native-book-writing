# Quickstart: AI-Native Book Platform

This guide provides the essential steps to set up the development environment for this project.

## Prerequisites

- **Python 3.10+** and `pip`
- **Node.js 18+** and `npm`
- **Docker** and **Docker Compose**
- Access to **Neon**, **Qdrant**, and **Gemini** API keys.

## Backend Setup (FastAPI)

1.  **Navigate to the backend directory** (once it is created):
    ```bash
    cd backend
    ```

2.  **Create a virtual environment**:
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

3.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure environment variables**:
    - Create a `.env` file in the `backend` directory.
    - Add the following variables with your credentials:
      ```env
      DATABASE_URL="your_neon_postgres_connection_string"
      QDRANT_API_KEY="your_qdrant_api_key"
      QDRANT_HOST="your_qdrant_host"
      GEMINI_API_KEY="your_gemini_api_key"
      BETTER_AUTH_SECRET="a_secure_random_string"
      ```

5.  **Run the development server**:
    ```bash
    uvicorn main:app --reload
    ```
    The API will be available at `http://127.0.0.1:8000`.

## Frontend Setup (Docusaurus)

1.  **Navigate to the frontend directory** (once it is created):
    ```bash
    cd frontend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    ```bash
    npm start
    ```
    The Docusaurus website will be available at `http://localhost:3000`.
