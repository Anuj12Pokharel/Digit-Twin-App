import os
from typing import Optional


class KnowledgeService:
    """
    RAG knowledge store backed by ChromaDB + OpenAI embeddings.
    Uses lazy initialisation so the app starts even without OPENAI_API_KEY set
    (the key is only required when ingest_document / query_brain is actually called).
    """

    def __init__(self):
        self._client = None
        self._collection = None
        self._embeddings = None
        self._splitter = None
        self.persist_directory = "./chroma_db"

    # ── lazy helpers ────────────────────────────────────────────────────────────

    def _get_client(self):
        if self._client is None:
            import chromadb
            self._client = chromadb.PersistentClient(path=self.persist_directory)
        return self._client

    def _get_collection(self):
        if self._collection is None:
            self._collection = self._get_client().get_or_create_collection(
                name="digital_twin_brain",
                metadata={"hnsw:space": "cosine"},
            )
        return self._collection

    def _get_embeddings(self):
        if self._embeddings is None:
            from langchain_openai import OpenAIEmbeddings
            api_key = os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise RuntimeError("OPENAI_API_KEY is not set")
            self._embeddings = OpenAIEmbeddings(api_key=api_key)
        return self._embeddings

    def _get_splitter(self):
        if self._splitter is None:
            from langchain.text_splitter import RecursiveCharacterTextSplitter
            self._splitter = RecursiveCharacterTextSplitter(
                chunk_size=600,
                chunk_overlap=60,
                length_function=len,
            )
        return self._splitter

    # ── public API ──────────────────────────────────────────────────────────────

    def ingest_document(self, doc_id: str, content: str, metadata: Optional[dict] = None):
        """Chunk a document and add it to the vector store."""
        chunks = self._get_splitter().split_text(content)
        if not chunks:
            return 0

        ids = [f"{doc_id}_{i}" for i in range(len(chunks))]
        metadatas = [metadata or {} for _ in chunks]
        embeddings = self._get_embeddings().embed_documents(chunks)

        self._get_collection().add(
            ids=ids,
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas,
        )
        return len(chunks)

    def query_brain(self, query: str, n_results: int = 4) -> str:
        """Search the brain and return a context string for the LLM."""
        query_embedding = self._get_embeddings().embed_query(query)
        results = self._get_collection().query(
            query_embeddings=[query_embedding],
            n_results=n_results,
        )
        docs = results.get("documents", [[]])[0]
        return "\n\n".join(docs) if docs else ""

    def delete_document(self, doc_id: str):
        """Remove all chunks for a given document ID."""
        try:
            collection = self._get_collection()
            # Fetch IDs that match the prefix pattern
            existing = collection.get()
            ids_to_delete = [
                eid for eid in existing["ids"]
                if eid.startswith(f"{doc_id}_")
            ]
            if ids_to_delete:
                collection.delete(ids=ids_to_delete)
        except Exception as e:
            print(f"[KnowledgeService] delete_document error: {e}")


# Singleton — initialised lazily, safe to import at startup
knowledge_base = KnowledgeService()
