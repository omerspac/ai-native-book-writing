from backend.app.db.session import engine
from backend.app.models.user import Base # Import Base from your models

def create_db_and_tables():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")

if __name__ == "__main__":
    create_db_and_tables()
