from sqlalchemy import Column, Integer, Text
from pgvector.sqlalchemy import Vector
from backend.app.core.database import Base

class BookEmbedding(Base):
    __tablename__ = "book_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    chunk_text = Column(Text, nullable=False)
    embedding = Column(Vector(768))
