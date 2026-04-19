import pandas as pd
from pinecone import Pinecone
from dotenv import load_dotenv
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from backend.rag.embedder import get_embedding, get_embeddings_batch

load_dotenv()

# Connect to Pinecone
print("Connecting to Pinecone...")
pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index(os.getenv("PINECONE_INDEX"))
print("✅ Connected to Pinecone!")

# Load dataset
print("Loading course dataset...")
df = pd.read_csv("backend/data/processed/courses_combined.csv")
df = df.fillna("")
print(f"✅ Loaded {len(df):,} courses")

# Index in batches
BATCH_SIZE = 100
total = len(df)
indexed = 0
errors = 0

print(f"\nStarting indexing {total:,} courses...")
print("This will take 30-60 minutes. Do not close this terminal.\n")

for start in range(0, total, BATCH_SIZE):
    batch = df.iloc[start:start + BATCH_SIZE]
    vectors = []

    for _, row in batch.iterrows():
        try:
            embed_text = str(row.get("embed_text", ""))
            if not embed_text:
                embed_text = str(row.get("title", ""))

            embedding = get_embedding(embed_text)

            metadata = {
                "title":          str(row.get("title", ""))[:500],
                "platform":       str(row.get("platform", "")),
                "level":          str(row.get("level", "All Levels")),
                "is_free":        bool(row.get("is_free", False)),
                "price":          float(row.get("price", 0) or 0),
                "certificate":    bool(row.get("certificate", True)),
                "avg_rating":     float(row.get("avg_rating", 0) or 0),
                "num_reviews":    float(row.get("num_reviews", 0) or 0),
                "duration_hours": str(row.get("duration_hours", ""))[:100],
                "category":       str(row.get("category", ""))[:200],
                "skills":         str(row.get("skills", ""))[:300],
                "language":       str(row.get("language", "English")),
                "course_url":     str(row.get("course_url", ""))[:500],
                "description":    str(row.get("description", ""))[:500],
                "provider":       str(row.get("provider", ""))[:200],
            }

            vectors.append({
                "id":       f"course_{int(row.get('course_id', start))}",
                "values":   embedding,
                "metadata": metadata
            })

        except Exception as e:
            errors += 1

    # Upload batch to Pinecone
    if vectors:
        try:
            index.upsert(vectors=vectors)
            indexed += len(vectors)
        except Exception as e:
            print(f"  ❌ Batch upload error: {e}")
            errors += len(vectors)

    # Progress update every 1000 courses
    if (start // BATCH_SIZE) % 10 == 0:
        pct = (indexed / total) * 100
        print(f"  Progress: {indexed:,}/{total:,} ({pct:.1f}%) | Errors: {errors}")

print(f"\n{'='*50}")
print(f"🎉 INDEXING COMPLETE!")
print(f"   Indexed : {indexed:,} courses")
print(f"   Errors  : {errors}")
print(f"   Total   : {total:,}")
print(f"{'='*50}")

# Verify count in Pinecone
stats = index.describe_index_stats()
print(f"\n✅ Pinecone index stats:")
print(f"   Total vectors: {stats['total_vector_count']:,}")