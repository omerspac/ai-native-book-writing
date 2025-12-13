import sys
import os

# Add the project root to the sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import asyncio
from sqlalchemy import text
from backend.app.core.database import engine, AsyncSessionLocal, create_db_and_tables

async def test_db_connection():
    """
    Tests the asynchronous database connection by executing a simple query.
    """
    print("Attempting to connect to the database and execute a test query...")
    try:
        # Ensure tables are created (idempotent operation)
        await create_db_and_tables()

        async with AsyncSessionLocal() as session:
            result = await session.execute(text("SELECT 1"))
            if result.scalar_one() == 1:
                print("Successfully connected to the database and executed 'SELECT 1'.")
            else:
                print("Test query failed: Unexpected result.")
    except Exception as e:
        print(f"Error connecting to PostgreSQL: {e}")
    finally:
        # Close the engine to release resources
        await engine.dispose()
        print("Database engine disposed.")

if __name__ == "__main__":
    asyncio.run(test_db_connection())
