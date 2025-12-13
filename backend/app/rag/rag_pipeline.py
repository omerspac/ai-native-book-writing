# Modified according to SPEC: The user's prompt (pgvector)
import os
from typing import List, Dict, Optional
from dotenv import load_dotenv
from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from sqlalchemy.ext.asyncio import AsyncSession # Import AsyncSession

import numpy as np # Added for embedding handling

from backend.app.db.postgres_client import PostgresClient
from backend.app.core.database import AsyncSessionLocal # Import AsyncSessionLocal

load_dotenv()

class RAGPipeline:
    """
    Manages the Retrieval-Augmented Generation (RAG) pipeline for book chapters.
    Handles document loading, chunking, embedding generation, and storage in PostgreSQL
    with pgvector.
    """
    def __init__(self, embedding_model_name: str = "models/embedding-001"):
        self.postgres_client = PostgresClient()
        self.google_api_key = os.getenv("GEMINI_API_KEY")
        if not self.google_api_key:
            raise ValueError("GOOGLE_API_KEY must be set in .env file")
        self.embeddings_model = GoogleGenerativeAIEmbeddings(model=embedding_model_name, google_api_key=self.google_api_key)
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            is_separator_regex=False,
        )

    async def answer_question(self, question: str, session: AsyncSession) -> str:
        """
        Full RAG flow:
        retrieve → augment → generate
        """
        chunks = await self.retrieve_relevant_chunks(session, question)

        if not chunks:
            return "I don't know from the provided documents."

        context = "\n\n".join(chunk["text"] for chunk in chunks)

        system_prompt = (
            "You are a helpful assistant. "
            "Answer ONLY using the provided context. "
            "If the answer is not present, say: "
            "'I don't know from the provided documents.'"
        )

        llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=self.google_api_key,
            temperature=0
        )

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Context:\n{context}\n\nQuestion:\n{question}")
        ]

        response = await llm.agenerate([messages])
        return response.generations[0][0].text

    async def _load_and_split_chapter(self, file_path: str) -> List[Dict]:
        """
        Loads a Markdown chapter file and splits it into chunks.
        Extracts chapter_id, title, and subtitle from the Docusaurus frontmatter.
        """
        try:
            loader = TextLoader(file_path)
            documents = loader.load()
            
            if not documents:
                print(f"No content found in {file_path}")
                return []

            # Extract frontmatter info for metadata
            chapter_id = os.path.basename(file_path).split('.')[0]
            title = None
            subtitle = None
            # Basic frontmatter parsing (assuming Docusaurus-like structure)
            content_lines = documents[0].page_content.splitlines()
            if content_lines and content_lines[0].strip() == '---':
                for i, line in enumerate(content_lines[1:], 1):
                    if line.strip() == '---':
                        break
                    if line.startswith('id:'):
                        chapter_id = line.split('id:', 1)[1].strip()
                    elif line.startswith('title:'):
                        title = line.split('title:', 1)[1].strip()
                    elif line.startswith('subtitle:'):
                        subtitle = line.split('subtitle:', 1)[1].strip()
            
            # Use Langchain's text splitter
            chunks = self.text_splitter.split_documents(documents)
            
            processed_chunks = []
            for i, chunk in enumerate(chunks):
                processed_chunks.append({
                    "text": chunk.page_content,
                    "metadata": {
                        "chapter_id": chapter_id,
                        "file_path": file_path,
                        "title": title,
                        "subtitle": subtitle,
                        "chunk_id": f"{chapter_id}_chunk_{i}",
                        "chunk_index": i,
                        "word_count": len(chunk.page_content.split())
                    }
                })
            
            return processed_chunks
        except Exception as e:
            print(f"Error loading and splitting chapter {file_path}: {e}")
            return []

    async def _generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Generates embeddings for a list of text chunks using the configured model.
        """
        try:
            embeddings = await self.embeddings_model.aembed_documents(texts)
            return embeddings
        except Exception as e:
            print(f"Error generating embeddings: {e}")
            return []

    async def ingest_chapter(self, session: AsyncSession, file_path: str):
        """
        Ingests a single book chapter: loads, chunks, generates embeddings,
        and stores them in PostgreSQL with pgvector.
        """
        print(f"Ingesting chapter: {file_path}")
        chunks_data = await self._load_and_split_chapter(file_path)
        if not chunks_data:
            print(f"No chunks to ingest for {file_path}.")
            return

        texts = [chunk["text"] for chunk in chunks_data]
        
        embeddings = await self._generate_embeddings(texts)
        
        if embeddings and len(embeddings) == len(texts):
            for text, embedding in zip(texts, embeddings):
                await self.postgres_client.upsert_embedding(session, chunk_text=text, embedding=np.array(embedding))
            print(f"Successfully ingested {len(embeddings)} chunks from {file_path} into PostgreSQL.")
        else:
            print(f"Failed to generate embeddings for all chunks in {file_path}.")

    async def retrieve_relevant_chunks(self, session: AsyncSession, query: str, limit: int = 5) -> List[Dict]:
        """
        Generates an embedding for a query and retrieves relevant text chunks from PostgreSQL.
        """
        print(f"Retrieving relevant chunks for query: '{query}'")
        query_embedding = (await self.embeddings_model.aembed_documents([query]))[0]
        if not query_embedding:
            print("Failed to generate embedding for the query.")
            return []

        search_results = await self.postgres_client.search_embeddings(session, np.array(query_embedding), top_k=limit)
        
        # Format results for consumption
        relevant_chunks = []
        if search_results:
            for result in search_results:
                relevant_chunks.append({
                    "text": result["text"],
                    "score": result["score"]
                })
        return relevant_chunks

if __name__ == "__main__":
    import asyncio

    async def main():
        try:
            rag_pipeline = RAGPipeline()
            db_client_instance = PostgresClient() # Instantiate PostgresClient for creating tables
            await db_client_instance._create_embeddings_table() # Ensure table exists

            async with AsyncSessionLocal() as session:
                # Ingest a dummy chapter (replace with actual path)
                dummy_chapter_path = "frontend/my-book/docs/chapter1.md"
                if not os.path.exists(dummy_chapter_path):
                    # Create a dummy file if it doesn't exist for testing
                    with open(dummy_chapter_path, "w", encoding="utf-8") as f:
                        f.write("---\nid: chapter1\ntitle: The Test Chapter\nsubtitle: A chapter for testing purposes\n---\n\nThis is the content of the test chapter. It talks about AI and its applications. This sentence is about robotics. And this is about machine learning.")
                    print(f"Created dummy chapter at {dummy_chapter_path}")

                await rag_pipeline.ingest_chapter(session, dummy_chapter_path)

                # Perform a dummy query
                query = "What is AI?"
                relevant_chunks = await rag_pipeline.retrieve_relevant_chunks(session, query)

                print("\n--- Retrieved Chunks for Query ---")
                for chunk in relevant_chunks:
                    print(f"Score: {chunk['score']:.2f}, Text: {chunk['text'][:150]}...")
                
                # Clean up dummy file if created
                if os.path.exists(dummy_chapter_path):
                    pass # For now, let's keep it for manual inspection
                    # os.remove(dummy_chapter_path) 
        except ValueError as e:
            print(f"Configuration error: {e}")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")

    asyncio.run(main())
