# Modified according to SPEC: The user's prompt (pgvector)
# Backend (FastAPI)

This directory contains the FastAPI backend for the AI-Native Book Platform.

## Setup

1.  **Navigate to the backend directory**:
    ```bash
    cd backend
    ```

2.  **Create a virtual environment**:
    ```bash
    python -m venv venv
    # On Windows:
    .\venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
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
      GEMINI_API_KEY="your_gemini_api_key"
      BETTER_AUTH_SECRET="a_secure_random_string"
      RAG_RETRIEVAL_LIMIT=5 # Number of relevant chunks to retrieve for RAG
      ```

## Running the Application

1.  **Run migrations (if applicable)**:
    ```bash
    # Command to run migrations if using alembic or similar
    # python create_db_tables.py
    ```

2.  **Run the development server**:
    ```bash
    uvicorn app.main:app --reload
    ```
    The API will be available at `http://127.0.0.1:8000`.

## RAG Pipeline Management

### Ingest Documents

To ingest documents (e.g., Markdown chapters from `frontend/my-book/docs/`) into the RAG pipeline:

```bash
python scripts/embed_content.py
```

### Run Tests

To run the backend tests:

```bash
pytest backend/tests
```
