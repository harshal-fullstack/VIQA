import chromadb
import uuid

class VectorDBWrapper:
    """
    Manages ChromaDB collections for storing frame vectors and retrieving them via similarity search.
    """
    def __init__(self, db_dir: str = "./chroma_db"):
        self.client = chromadb.PersistentClient(path=db_dir)
        # Using a unified collection for the app
        self.collection = self.client.get_or_create_collection(
            name="viqa_frames",
            metadata={"hnsw:space": "cosine"}
        )
        
    def reset_collection(self):
        """Clear out old entries before processing a new video."""
        try:
            self.client.delete_collection("viqa_frames")
        except Exception:
            pass
        self.collection = self.client.get_or_create_collection(
            name="viqa_frames",
            metadata={"hnsw:space": "cosine"}
        )

    def store_frame(self, frame_id: str, embedding: list, metadata: dict):
        self.collection.add(
            ids=[frame_id],
            embeddings=[embedding],
            metadatas=[metadata]
        )
        
    def search(self, query_embedding: list, n_results: int = 1):
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        return results
