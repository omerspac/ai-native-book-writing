import os
from typing import List, Dict, Optional
from dotenv import load_dotenv
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from qdrant_client import models

# Assuming qdrant_client and postgres_client are in sibling directories or properly imported
from app.db.qdrant_client import QdrantVectorClient
from app.db.postgres_client import PostgresClient

load_dotenv()

class RAGPipeline:
    """
    Manages the Retrieval-Augmented Generation (RAG) pipeline for book chapters.
    Handles document loading, chunking, embedding generation, and storage in Qdrant
    with metadata in PostgreSQL.
    """
    def __init__(self,
                 qdrant_collection_name: str = "book_embeddings",
                 embedding_model_name: str = "models/embedding-001"):
        self.qdrant_client = QdrantVectorClient(collection_name=qdrant_collection_name)
        self.postgres_client = PostgresClient()
        self.google_api_key = os.getenv("GOOGLE_API_KEY")
        if not self.google_api_key:
            raise ValueError("GOOGLE_API_KEY must be set in .env file")
        self.embeddings_model = GoogleGenerativeAIEmbeddings(model=embedding_model_name, google_api_key=self.google_api_key)
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            length_function=len,
            is_separator_regex=False,
        )

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
            
            # Store overall chapter metadata in Postgres
            self.postgres_client.store_chapter_metadata(
                chapter_id=chapter_id,
                file_path=file_path,
                title=title,
                subtitle=subtitle,
                word_count=len(documents[0].page_content.split()) # Total word count of chapter
            )
            
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

    async def ingest_chapter(self, file_path: str):
        """
        Ingests a single book chapter: loads, chunks, generates embeddings,
        and stores them in Qdrant, with metadata in Postgres.
        """
        print(f"Ingesting chapter: {file_path}")
        chunks_data = await self._load_and_split_chapter(file_path)
        if not chunks_data:
            print(f"No chunks to ingest for {file_path}.")
            return

        texts = [chunk["text"] for chunk in chunks_data]
        metadatas = [chunk["metadata"] for chunk in chunks_data]
        
        embeddings = await self._generate_embeddings(texts)
        
        if embeddings and len(embeddings) == len(texts):
            # Qdrant upsert expects list of vectors and list of payloads
            # Extract chunk_id for Qdrant point IDs if available
            qdrant_ids = [metadata["chunk_id"] for metadata in metadatas]
            self.qdrant_client.upsert_vectors(
                vectors=embeddings,
                payloads=metadatas,
                ids=qdrant_ids
            )
            print(f"Successfully ingested {len(embeddings)} chunks from {file_path} into Qdrant.")
        else:
            print(f"Failed to generate embeddings for all chunks in {file_path}.")

    async def retrieve_relevant_chunks(self, query: str, limit: int = 5) -> List[Dict]:
        """
        Generates an embedding for a query and retrieves relevant text chunks from Qdrant.
        """
        print(f"Retrieving relevant chunks for query: '{query}'")
        query_embedding = (await self.embeddings_model.aembed_documents([query]))[0]
        if not query_embedding:
            print("Failed to generate embedding for the query.")
            return []

        search_results = self.qdrant_client.query_vectors(query_embedding, limit=limit)
        
        # Format results for consumption
        relevant_chunks = []
        for hit in search_results:
            relevant_chunks.append({
                "text": hit.payload.get("text"),
                "chapter_id": hit.payload.get("chapter_id"),
                "chunk_id": hit.payload.get("chunk_id"),
                "score": hit.score
            })
        return relevant_chunks

if __name__ == "__main__":
    import asyncio

    # Ensure .env has GOOGLE_API_KEY, QDRANT_URL, QDRANT_API_KEY, NEON_DB_URL
    # For testing, you might want to point to specific local files or mock dependencies
    
    # Example usage:
    async def main():
        try:
            rag_pipeline = RAGPipeline()

            # Ingest a dummy chapter (replace with actual path)
            dummy_chapter_path = "frontend/my-book/docs/chapter1.md"
            if not os.path.exists(dummy_chapter_path):
                print(f"Dummy chapter not found at {dummy_chapter_path}. Skipping ingestion test.")
            else:
                await rag_pipeline.ingest_chapter(dummy_chapter_path)

            # Perform a dummy query
            query = "What is Physical AI?"
            relevant_chunks = await rag_pipeline.retrieve_relevant_chunks(query)

            print("\n--- Retrieved Chunks for Query ---")
            for chunk in relevant_chunks:
                print(f"Score: {chunk['score']:.2f}, Chapter: {chunk['chapter_id']}, Text: {chunk['text'][:150]}...")
        except ValueError as e:
            print(f"Configuration error: {e}")
        except Exception as e:
            print(f"An unexpected error occurred: {e}")

    asyncio.run(main())
