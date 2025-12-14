import os
import numpy as np
from dotenv import load_dotenv
from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.core.database import AsyncSessionLocal, engine, Base
from backend.app.models.book_embedding import BookEmbedding

# Load environment variables from .env file
load_dotenv()

class PostgresClient:
    """
    A client for connecting to Neon Serverless Postgres and managing book embeddings using SQLAlchemy AsyncSession.
    """
    def __init__(self):
        # The session will be managed by FastAPI's dependency injection or passed directly to methods
        pass

    async def _create_embeddings_table(self):
        """Creates the book_embeddings table if it doesn't exist. This should ideally be called once on startup."""
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector;"))
        print("Table 'book_embeddings' and 'vector' extension checked/created successfully.")

    async def upsert_embedding(self, session: AsyncSession, chunk_text: str, embedding: np.ndarray):
        """
        Stores a text chunk and its corresponding embedding.

        Args:
            session (AsyncSession): The SQLAlchemy async session.
            chunk_text (str): The text chunk from the book.
            embedding (np.ndarray): The embedding vector for the chunk.
        """
        try:
            new_embedding = BookEmbedding(chunk_text=chunk_text, embedding=embedding)
            session.add(new_embedding)
            await session.commit()
            await session.refresh(new_embedding)
            return True
        except Exception as e:
            print(f"Error storing embedding: {e}")
            await session.rollback()
            return False

    async def search_embeddings(self, session: AsyncSession, query_embedding: np.ndarray, top_k: int = 5):
        """
        Searches for the most similar text chunks based on a query embedding.

        Args:
            session (AsyncSession): The SQLAlchemy async session.
            query_embedding (np.ndarray): The embedding of the user's query.
            top_k (int): The number of similar chunks to retrieve.

        Returns:
            list or None: A list of dictionaries, each containing the chunk_text and similarity_score.
        """
        try:
            # Use the pgvector operator for similarity search
            # 'embedding.max_inner_product(query_embedding)' is for cosine similarity when normalized
            # For exact cosine distance, it's 'embedding.cosine_distance(query_embedding)'
            # Let's use cosine distance for now. Lower distance is better.
            
            # Ensure the vector extension is created before running queries that use it
            # This is already handled in _create_embeddings_table

            # The query_embedding from the model is already a numpy array, ensure it's compatible
            
            stmt = (
                select(
                    BookEmbedding.chunk_text,
                    (BookEmbedding.embedding.cosine_distance(query_embedding)).label("distance")
                )
                .order_by(BookEmbedding.embedding.cosine_distance(query_embedding))
                .limit(top_k)
            )
            
            result = await session.execute(stmt)
            rows = result.fetchall()
            
            return [{"text": row.chunk_text, "score": 1 - row.distance} for row in rows] # 1 - distance to get similarity score
        except Exception as e:
            print(f"Error searching embeddings: {e}")
            return None

if __name__ == "__main__":
    import asyncio

    async def main():
        db_client = PostgresClient()
        
        # This part should ideally be handled by create_db_and_tables on startup
        # await db_client._create_embeddings_table() 

        async with AsyncSessionLocal() as session:
            # Example: Upsert some dummy embeddings
            dummy_text_1 = "This is the first sentence for the test about AI."
            dummy_embedding_1 = np.random.rand(768)
            await db_client.upsert_embedding(session, dummy_text_1, dummy_embedding_1)

            dummy_text_2 = "This is a second, different sentence about machine learning."
            dummy_embedding_2 = np.random.rand(768)
            await db_client.upsert_embedding(session, dummy_text_2, dummy_embedding_2)

            # Example: Search for similar embeddings
            query_embedding = np.random.rand(768)
            search_results = await db_client.search_embeddings(session, query_embedding, top_k=2)

            if search_results:
                print("\nSearch Results:")
                for result in search_results:
                    print(f"Text: {result['text']}, Similarity Score: {result['score']:.4f}")
            else:
                print("No search results found.")

    asyncio.run(main())
