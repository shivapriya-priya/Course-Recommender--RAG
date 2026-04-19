import numpy as np
import hashlib
import os

os.environ["TOKENIZERS_PARALLELISM"] = "false"

DIMS = 384

def get_embedding(text: str) -> list:
    tokens = str(text).lower().split()
    embedding = np.zeros(DIMS)

    for token in tokens:
        for i in range(DIMS):
            hash_val = hashlib.md5(
                f"{token}_{i}".encode()
            ).hexdigest()
            val = int(hash_val[:8], 16) / (16**8)
            embedding[i] += val * 2 - 1

    if len(tokens) > 0:
        embedding = embedding / len(tokens)

    norm = np.linalg.norm(embedding)
    if norm > 0:
        embedding = embedding / norm

    return embedding.tolist()

def get_embeddings_batch(texts: list) -> list:
    return [get_embedding(t) for t in texts]

print("✅ Embedder loaded!")