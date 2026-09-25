import faiss
import numpy as np


def create_vector_store(embeddings):

    embeddings = np.array(embeddings).astype("float32")

    dimension = embeddings.shape[1]

    index = faiss.IndexFlatL2(dimension)

    index.add(embeddings)

    return index


def search(index, question_embedding, chunks, k=3):

    question_embedding = np.array(
        [question_embedding]
    ).astype("float32")

    distances, indices = index.search(
        question_embedding,
        k
    )

    results = []

    for index_value in indices[0]:

        if index_value != -1:
            results.append(chunks[index_value])

    return results