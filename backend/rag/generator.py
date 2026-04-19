import ollama
import json
import os
from dotenv import load_dotenv

load_dotenv()
MODEL = os.getenv("OLLAMA_MODEL", "gemma3:1b")

def generate_recommendation(query: str, courses: list, filters: dict = {}) -> str:
    if not courses:
        return "I could not find any courses matching your request. Try different keywords or remove some filters."

    course_list = ""
    for i, course in enumerate(courses[:5], 1):
        meta = course.get("metadata", course)
        price_str = "Free" if meta.get("is_free") else f"${meta.get('price', 0)}"
        rating = float(meta.get("avg_rating", 0) or 0)
        course_list += f"{i}. {meta.get('title','Unknown')} | {meta.get('platform','Unknown')} | {price_str} | {meta.get('level','All Levels')} | Rating: {rating:.1f}\n"

    prompt = f"""You are CourseAI, a friendly course advisor.

User asked: "{query}"

Top courses found:
{course_list}

Give a SHORT friendly response (max 150 words):
- Greet warmly
- Recommend top 2-3 courses with reasons
- Mention which is free vs paid
- One quick learning tip

Use plain text. No asterisks (*). No markdown symbols. Use actual line breaks for sections.
"""

    try:
        response = ollama.chat(
            model=MODEL,
            messages=[
                {"role":"system","content":"You are CourseAI, a friendly course advisor. Be brief, warm, and helpful. Never use asterisks or markdown symbols."},
                {"role":"user","content":prompt}
            ],
            options={
                "temperature": 0.7,
                "num_predict": 250,
                "num_ctx": 1024
            }
        )
        text = response["message"]["content"]
        text = text.replace("**","").replace("##","").replace("###","").replace("* ","").replace("*","")
        return text
    except Exception as e:
        return f"Here are the top courses I found:\n\n{course_list}"