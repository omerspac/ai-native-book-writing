import os
from qdrant_client import QdrantClient, models
from dotenv import load_dotenv

load_dotenv()

class QdrantVectorClient:
    """
    A client for connecting to Qdrant Cloud and managing book embeddings.
    """
    def __init__(self, collection_name: str = "book_embeddings"):
        self.collection_name = collection_name
        self.qdrant_url = os.getenv("QDRANT_URL")
        self.qdrant_api_key = os.getenv("QDRANT_API_KEY")

        if not self.qdrant_url or not self.qdrant_api_key:
            raise ValueError("QDRANT_URL and QDRANT_API_KEY must be set in .env file")

        self.client = QdrantClient(
            url=self.qdrant_url,
            api_key=self.qdrant_api_key,
        )
        self._create_collection_if_not_exists()

    def _create_collection_if_not_exists(self):
        """
        Creates the Qdrant collection if it does not already exist.
        The vector size (dimension) is set to 768, which is common for models like all-MiniLM-L6-v2.
        Adjust this dimension if using a different embedding model.
        """
        try:
            self.client.get_collection(collection_name=self.collection_name)
            print(f"Collection '{self.collection_name}' already exists.")
        except Exception: # qdrant_client.http.exceptions.UnexpectedResponse as e
            print(f"Collection '{self.collection_name}' does not exist. Creating it...")
            self.client.recreate_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(size=768, distance=models.Distance.COSINE),
            )
            print(f"Collection '{self.collection_name}' created.")

    def upsert_vectors(self, vectors, payloads, ids=None):
        """
        Inserts or updates vectors and their corresponding payloads into the collection.

        Args:
            vectors (list[list[float]]): A list of embedding vectors.
            payloads (list[dict]): A list of dictionaries, where each dictionary is the payload
                                    (metadata) for the corresponding vector.
            ids (list[str], optional): A list of unique IDs for the vectors. If None, Qdrant will
                                       generate UUIDs.
        """
        if not vectors or not payloads:
            print("No vectors or payloads to upsert.")
            return

        points = [
            models.PointStruct(id=ids[i] if ids else None, vector=vectors[i], payload=payloads[i])
            for i, (vectors[i], payloads[i]) in enumerate(zip(vectors, payloads))
        ]

        self.client.upsert(
            collection_name=self.collection_name,
            wait=True,
            points=points
        )
        print(f"Upserted {len(vectors)} vectors into collection '{self.collection_name}'.")

    def query_vectors(self, query_vector, limit: int = 5, min_score: float = 0.7):
        """
        Queries the collection for similar vectors.

        Args:
            query_vector (list[float]): The embedding vector of the query.
            limit (int): The maximum number of similar vectors to return.
            min_score (float): The minimum similarity score for results to be returned.

        Returns:
            list: A list of search results, each containing the vector, payload, and score.
        """
        if not query_vector:
            return []

        search_result = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_vector,
            limit=limit,
            score_threshold=min_score,
            with_payload=True,
            with_vectors=False, # Usually don't need to return the vectors themselves
        )
        print(f"Found {len(search_result)} results for query.")
        return search_result

    def count_vectors(self):
        """
        Returns the number of vectors in the collection.
        """
        count_result = self.client.count(
            collection_name=self.collection_name,
            exact=True
        )
        return count_result.count

    def delete_collection(self):
        """
        Deletes the entire collection. Use with caution.
        """
        self.client.delete_collection(collection_name=self.collection_name)
        print(f"Collection '{self.collection_name}' deleted.")

if __name__ == "__main__":
    # Example Usage (requires .env with QDRANT_URL and QDRANT_API_KEY)
    try:
        qdrant_client = QdrantVectorClient()

        # Dummy vectors and payloads for demonstration
        # In a real scenario, these would come from an embedding model and your data
        dummy_vectors = [
            [0.1, 0.2, 0.3, 0.4] * 192, # 768 dimensions
            [0.5, 0.6, 0.7, 0.8] * 192,
            [0.11, 0.22, 0.33, 0.44] * 192,
        ]
        dummy_payloads = [
            {"chapter_id": "chapter1", "chunk_id": "ch1_c1", "text": "This is a chunk about physical AI."},
            {"chapter_id": "chapter2", "chunk_id": "ch2_c1", "text": "Another chunk discussing humanoid robotics."},
            {"chapter_id": "chapter1", "chunk_id": "ch1_c2", "text": "More details on embodied intelligence."},
        ]
        dummy_ids = ["point1", "point2", "point3"]

        # Upsert vectors
        qdrant_client.upsert_vectors(dummy_vectors, dummy_payloads, dummy_ids)

        # Count vectors
        print(f"Total vectors in collection: {qdrant_client.count_vectors()}")

        # Query a vector (in a real app, this would be an embedding of a query text)
        query_vec = [0.12, 0.23, 0.34, 0.45] * 192
        search_results = qdrant_client.query_vectors(query_vec, limit=2)

        print("\nSearch Results:")
        for hit in search_results:
            print(f"  Score: {hit.score:.2f}, Payload: {hit.payload}")

        # Uncomment to delete the collection after testing
        # qdrant_client.delete_collection()

    except ValueError as e:
        print(f"Configuration error: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")
