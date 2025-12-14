# backend/app/rag/rag_pipeline.py
import os
from typing import List, Dict, Optional
from dotenv import load_dotenv

from langchain_community.document_loaders import TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings # Import for HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document

load_dotenv()

class RAGPipeline:
    """
    Manages the Retrieval-Augmented Generation (RAG) pipeline for book chapters.
    Handles document loading, chunking, embedding generation, and storage in an in-memory FAISS vectorstore.
    """
    def __init__(self):
        self.embeddings_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2") # Use HuggingFaceEmbeddings
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50,
            length_function=len,
            is_separator_regex=False,
        )
        self.vectorstore: Optional[FAISS] = None

    def ingest_chapter(self, file_path: str):
        """
        Ingests a single book chapter: loads, chunks, generates embeddings,
        and stores them in the in-memory FAISS vectorstore.
        """
        print(f"Ingesting chapter: {file_path}")
        try:
            loader = TextLoader(file_path)
            documents = loader.load()
            
            if not documents:
                print(f"No content found in {file_path}")
                return

            # Extract frontmatter info for metadata (simplified for FAISS Document metadata)
            chapter_id = os.path.basename(file_path).split('.')[0]
            
            # Use Langchain's text splitter
            chunks = self.text_splitter.split_documents(documents)
            
            # Prepare documents for FAISS
            faiss_docs = []
            for i, chunk in enumerate(chunks):
                # Using page_content for text, and adding basic metadata
                doc = Document(
                    page_content=chunk.page_content,
                    metadata={
                        "chapter_id": chapter_id,
                        "file_path": file_path,
                        "chunk_index": i,
                        "word_count": len(chunk.page_content.split())
                    }
                )
                faiss_docs.append(doc)
            
            if not faiss_docs:
                print(f"No processable chunks for {file_path}.")
                return

            # Create or update FAISS vectorstore
            if self.vectorstore is None:
                self.vectorstore = FAISS.from_documents(faiss_docs, self.embeddings_model) # Pass HuggingFaceEmbeddings
            else:
                self.vectorstore.add_documents(faiss_docs) # add_documents uses the internally stored embeddings_model
            
            print(f"Successfully ingested {len(faiss_docs)} chunks from {file_path} into FAISS.")

        except Exception as e:
            print(f"Error ingesting chapter {file_path}: {e}")

    def answer_question(self, question: str) -> str:
        """
        Retrieves relevant text chunks from FAISS and returns a text answer.
        Filters results based on a relevance score threshold.
        """
        print(f"Answering question: '{question}'")

        # Handle simple greetings
        greetings = ["hello", "hi", "hey", "greetings"]
        # A simple check if any greeting word is in the question.
        if any(word in question.lower().split() for word in greetings):
            return "Hello! How can I help you today with the content of the book?"

        if self.vectorstore is None:
            return "No book content has been ingested yet. Please ingest chapters first."

        # Retrieve relevant documents from FAISS with their relevance scores
        # FAISS returns L2 distance; lower scores are better.
        results_with_scores = self.vectorstore.similarity_search_with_score(question, k=4)
        
        if not results_with_scores:
            return "I could not find any information related to your question in the book."

        # Define a relevance threshold for L2 distance. This may need tuning.
        relevance_threshold = 1.0  

        # Filter documents based on the score
        relevant_docs = [doc for doc, score in results_with_scores if score < relevance_threshold]

        if not relevant_docs:
            return "I searched the book content, but could not find a relevant answer to your question."

        # Concatenate relevant content to form an answer
        context = "\n\n".join([doc.page_content for doc in relevant_docs])
        
        # Present the found context clearly
        answer = f"Based on the book content, here is what I found related to your question:\n\n{context}"
        
        return answer
