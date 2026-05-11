# CourseAI — RAG-Based Multi-Platform Course Recommendation System

## Overview

CourseAI is an AI-powered Retrieval-Augmented Generation (RAG) based recommendation system designed to help learners discover the best online courses across multiple MOOC platforms using conversational AI and semantic search.

The system indexes 246,718+ courses from 14 learning platforms including Coursera, Udemy, Harvard, MIT, Stanford, and more using vector embeddings and Pinecone vector database.

CourseAI solves the cold-start recommendation problem by providing intelligent personalized recommendations without requiring previous user interaction history.

---

# Features

- Conversational AI chatbot for course recommendations
- Semantic search using vector embeddings
- Retrieval-Augmented Generation (RAG) pipeline
- Multi-platform course aggregation
- Pinecone vector database integration
- Ollama local LLM integration (gemma3:1b)
- Metadata filtering
- Course comparison across platforms
- Free/Paid course filtering
- Language and level filtering
- Real-time conversational recommendations

---

# Tech Stack

## Frontend
- React.js
- Vite
- Axios

## Backend
- FastAPI
- Python

## AI / ML
- Retrieval-Augmented Generation (RAG)
- Ollama
- gemma3:1b
- Pinecone
- Semantic Search
- Vector Embeddings
- NLP

---

# System Architecture

1. User enters learning query
2. Query converted into embeddings
3. Semantic search performed in Pinecone vector database
4. Relevant courses retrieved
5. Ollama local LLM generates conversational recommendations
6. Results displayed through React.js frontend

---

# Key Highlights

- Indexed 246,718+ courses
- Aggregated data from 14 platforms
- Privacy-preserving local LLM inference
- Explainable conversational recommendations
- Solves information overload problem in MOOCs
- Solves cold-start recommendation challenge

---

# Screenshots

## Home Interface

<img width="1919" height="1012" alt="Screenshot 2026-05-05 125041 - Copy" src="https://github.com/user-attachments/assets/90568a81-f5cb-4093-bdd4-08c8082753e1" />


## Conversational Recommendation System

<img width="1919" height="1006" alt="Screenshot 2026-05-05 125107 - Copy" src="https://github.com/user-attachments/assets/569c6f00-2a0c-4aa9-b17f-ddd72e53e8e7" />


## Recommended Courses

<img width="1919" height="1007" alt="Screenshot 2026-05-05 125307 - Copy" src="https://github.com/user-attachments/assets/8441c917-3c69-4e1c-8f7c-ae8960ffb0be" />


## Direct Course Redirection

<img width="1919" height="1016" alt="Screenshot 2026-05-05 125357 - Copy" src="https://github.com/user-attachments/assets/9f0721c0-5850-428d-8752-28d274fc7ef9" />


## Cross-Platform Comparison

<img width="1894" height="1003" alt="Screenshot 2026-05-05 125514" src="https://github.com/user-attachments/assets/0c71986f-6857-4763-852d-5e48c4af7ada" />


---

# Example Query

```text
Web development from scratch
