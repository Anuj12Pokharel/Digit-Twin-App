import os
from typing import List, Optional
import chromadb
from chromadb.config import Settings
from langchain_openai import OpenAIEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter

class KnowledgeService:
    def __init__(self):
        # Initialize persistent ChromaDB client
        self.persist_directory = "./chroma_db"
        self.client = chromadb.PersistentClient(path=self.persist_directory)
        
        # Initialize Embedding function
        self.embeddings = OpenAIEmbeddings(api_key=os.getenv("OPENAI_API_KEY"))
        
        # Get or create the 'brain' collection
        self.collection = self.client.get_or_create_collection(
            name="digital_twin_brain",
            metadata={"hnsw:space": "cosine"}
        )
        
        # Text splitter for chunking
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=600,
            chunk_overlap=60,
            length_function=len,
        )

    def ingest_document(self, doc_id: str, content: str, metadata: dict = None):
        """Chunks a document and adds it to the vector store."""
        # Split text into chunks
        chunks = self.text_splitter.split_text(content)
        
        # Prepare data for Chroma
        ids = [f"{doc_id}_{i}" for i in range(len(chunks))]
        metadatas = [metadata or {} for _ in chunks]
        
        # Generate embeddings and add to collection
        # ChromaDB can handle embeddings automatically if we pass the embedding function, 
        # but manual control is often more reliable in these environments.
        embeddings = self.embeddings.embed_documents(chunks)
        
        self.collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=chunks,
            metadatas=metadatas
        )
        return len(chunks)

    def query_brain(self, query: str, n_results: int = 4):
        """Searches the brain for relevant context."""
        query_embedding = self.embeddings.embed_query(query)
        
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results
        )
        
        # Format results into a single string for LLM context
        context = "\n\n".join(results["documents"][0])
        return context

    def delete_document(self, doc_id: str):
        """Removes all chunks associated with a document ID."""
        # This is simplified - in production we'd use metadata filtering
        self.collection.delete(where={"source_id": doc_id})

knowledge_base = KnowledgeService()
