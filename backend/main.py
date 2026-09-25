from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import os

from pdf_processor import extract_text
from rag import split_text
from embeddings import create_embeddings
from vector_store import create_vector_store, search
from llm import generate_answer


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

index = None
stored_chunks = []

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


class QuestionRequest(BaseModel):
    question: str


@app.get("/")
def home():
    return {
        "message": "AI Study Assistant API is running"
    }


@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):

    global index, stored_chunks

    file_path = os.path.join(
        UPLOAD_DIR,
        file.filename
    )

    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    text = extract_text(file_path)

    chunks = split_text(text)

    embeddings = create_embeddings(chunks)

    index = create_vector_store(embeddings)

    stored_chunks = chunks

    return {
        "filename": file.filename,
        "characters": len(text),
        "chunks": len(chunks),
        "embedding_dimensions": len(embeddings[0]),
        "vectors_stored": index.ntotal,
        "message": "PDF processed successfully"
    }


@app.post("/ask")
def ask_question(request: QuestionRequest):

    if index is None:
        return {
            "error": "Please upload a PDF first."
        }

    question_embedding = create_embeddings(
        [request.question]
    )[0]

    results = search(
        index,
        question_embedding,
        stored_chunks,
        k=3
    )

    context = "\n\n".join(results)

    answer = generate_answer(
        request.question,
        context
    )

    return {
        "question": request.question,
        "answer": answer
    }