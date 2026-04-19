from pinecone import Pinecone
from backend.rag.embedder import get_embedding
from dotenv import load_dotenv
import os

load_dotenv()

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index(os.getenv("PINECONE_INDEX"))

def retrieve_courses(
    query: str,
    top_k: int = 20,
    platform: str = None,
    level: str = None,
    is_free: bool = None,
    max_price: float = None,
    language: str = None,
    certificate: bool = None
) -> list:

    query_vector = get_embedding(query)

    # Only add filters that are strictly needed
    filters = {}

    if platform and platform != "All":
        filters["platform"] = {"$eq": platform}

    if level and level != "All" and level != "":
        filters["level"] = {"$eq": level}

    if language and language != "All" and language != "":
        filters["language"] = {"$eq": language}

    # Do NOT filter by is_free or price in Pinecone
    # We do that manually after retrieval for accuracy

    try:
        results = index.query(
            vector=query_vector,
            top_k=top_k,
            include_metadata=True,
            filter=filters if filters else None
        )
        return results.get("matches", [])
    except Exception as e:
        print(f"Pinecone query error: {e}")
        return []