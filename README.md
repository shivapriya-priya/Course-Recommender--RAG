# CourseAI - AI-Powered Course Recommendation System

An intelligent course recommendation chatbot built with RAG (Retrieval Augmented Generation).

## Features
- 246,718 courses from 14 platforms
- AI-powered recommendations using Ollama
- Vector search using Pinecone
- Filter by platform, level, language, price
- Free vs paid course comparison
- Platform comparison table

## Tech Stack
- Frontend: React + Vite
- Backend: FastAPI + Python
- Vector DB: Pinecone
- LLM: Ollama (gemma3:1b)
- Embeddings: Hash-based (384 dims)

## Platforms Covered
Udemy, Coursera, edX, MIT OCW, Harvard, Stanford, Alison, FutureLearn, Pluralsight, Udacity, SWAYAM, Oxford, Berkeley, LSE

## How to Run

### Backend
```bash
cd course-recommender
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Prerequisites
- Ollama installed with gemma3:1b model
- Pinecone account with API key
- Python 3.10+
- Node.js 18+