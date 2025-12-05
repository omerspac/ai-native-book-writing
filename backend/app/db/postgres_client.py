import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class PostgresClient:
    """
    A client for connecting to Neon Serverless Postgres and managing book embedding metadata.
    """
    def __init__(self):
        self.conn = None
        self.db_url = os.getenv("NEON_DB_URL") # Example: "postgresql://user:password@host:port/dbname"
        # Or individual components if preferred:
        # self.db_host = os.getenv("PG_HOST")
        # self.db_user = os.getenv("PG_USER")
        # self.db_password = os.getenv("PG_PASSWORD")
        # self.db_name = os.getenv("PG_DBNAME")
        self.connect()

    def connect(self):
        """Establishes a connection to the PostgreSQL database."""
        if self.conn is None or self.conn.closed:
            try:
                if self.db_url:
                    self.conn = psycopg2.connect(self.db_url)
                # else: # If using individual components
                #     self.conn = psycopg2.connect(
                #         host=self.db_host,
                #         user=self.db_user,
                #         password=self.db_password,
                #         dbname=self.db_name
                #     )
                self.conn.autocommit = True
                print("Connected to PostgreSQL successfully!")
                self._create_metadata_table() # Ensure table exists
            except psycopg2.Error as e:
                print(f"Error connecting to PostgreSQL: {e}")
                self.conn = None

    def _create_metadata_table(self):
        """Creates the book_embedding_metadata table if it doesn't exist."""
        if not self.conn:
            print("Cannot create table: Not connected to database.")
            return

        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    CREATE TABLE IF NOT EXISTS book_embedding_metadata (
                        id SERIAL PRIMARY KEY,
                        chapter_id VARCHAR(255) NOT NULL UNIQUE,
                        file_path VARCHAR(512) NOT NULL,
                        title VARCHAR(512),
                        subtitle VARCHAR(512),
                        word_count INTEGER,
                        embedding_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    );
                """)
            print("Table 'book_embedding_metadata' checked/created successfully.")
        except psycopg2.Error as e:
            print(f"Error creating table 'book_embedding_metadata': {e}")

    def store_chapter_metadata(self, chapter_id: str, file_path: str, title: str = None, subtitle: str = None, word_count: int = None):
        """
        Stores or updates metadata for a book chapter.

        Args:
            chapter_id (str): Unique identifier for the chapter (e.g., "chapter1").
            file_path (str): The file path to the Markdown chapter.
            title (str, optional): The title of the chapter.
            subtitle (str, optional): The subtitle of the chapter.
            word_count (int, optional): The word count of the chapter.
        """
        if not self.conn:
            print("Cannot store metadata: Not connected to database.")
            return False

        try:
            with self.conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO book_embedding_metadata (chapter_id, file_path, title, subtitle, word_count)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (chapter_id) DO UPDATE SET
                        file_path = EXCLUDED.file_path,
                        title = EXCLUDED.title,
                        subtitle = EXCLUDED.subtitle,
                        word_count = EXCLUDED.word_count,
                        embedding_timestamp = CURRENT_TIMESTAMP;
                """, (chapter_id, file_path, title, subtitle, word_count))
            print(f"Metadata for chapter '{chapter_id}' stored/updated successfully.")
            return True
        except psycopg2.Error as e:
            print(f"Error storing metadata for chapter '{chapter_id}': {e}")
            return False

    def get_chapter_metadata(self, chapter_id: str):
        """
        Retrieves metadata for a specific book chapter.

        Args:
            chapter_id (str): Unique identifier for the chapter.

        Returns:
            dict or None: A dictionary containing chapter metadata, or None if not found.
        """
        if not self.conn:
            print("Cannot retrieve metadata: Not connected to database.")
            return None

        try:
            with self.conn.cursor() as cur:
                cur.execute(
                    "SELECT chapter_id, file_path, title, subtitle, word_count, embedding_timestamp FROM book_embedding_metadata WHERE chapter_id = %s;",
                    (chapter_id,)
                )
                result = cur.fetchone()
                if result:
                    return {
                        "chapter_id": result[0],
                        "file_path": result[1],
                        "title": result[2],
                        "subtitle": result[3],
                        "word_count": result[4],
                        "embedding_timestamp": result[5]
                    }
                return None
        except psycopg2.Error as e:
            print(f"Error retrieving metadata for chapter '{chapter_id}': {e}")
            return None

    def close(self):
        """Closes the database connection."""
        if self.conn:
            self.conn.close()
            print("PostgreSQL connection closed.")
            self.conn = None

if __name__ == "__main__":
    # Example Usage (requires .env with NEON_DB_URL or PG_HOST, PG_USER, PG_PASSWORD, PG_DBNAME)
    db_client = PostgresClient()

    # Store some dummy metadata
    db_client.store_chapter_metadata(
        chapter_id="chapter1",
        file_path="frontend/my-book/docs/chapter1.md",
        title="The Convergence",
        subtitle="Physical AI and Humanoid Robotics",
        word_count=1800
    )

    db_client.store_chapter_metadata(
        chapter_id="chapter2",
        file_path="frontend/my-book/docs/chapter2.md",
        title="Core AI for Embodied Systems",
        subtitle="Perception, Cognition, and Control",
        word_count=2000
    )

    # Retrieve metadata
    metadata = db_client.get_chapter_metadata("chapter1")
    if metadata:
        print("\nRetrieved Chapter 1 Metadata:")
        print(metadata)

    metadata = db_client.get_chapter_metadata("non_existent_chapter")
    if not metadata:
        print("\nRetrieved metadata for 'non_existent_chapter': Not found as expected.")

    db_client.close()
