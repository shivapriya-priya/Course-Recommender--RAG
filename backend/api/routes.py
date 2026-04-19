from fastapi import APIRouter, HTTPException
from backend.api.schemas import QueryRequest, CourseResponse
from backend.rag.retriever import retrieve_courses
from backend.rag.generator import generate_recommendation
import pandas as pd

router = APIRouter()

try:
    df = pd.read_csv("backend/data/processed/courses_combined.csv")
    PLATFORMS = sorted(df["platform"].dropna().unique().tolist())
    LEVELS = sorted(df["level"].dropna().unique().tolist())
    LANGUAGES = sorted(df["language"].dropna().unique().tolist())[:80]
    TOTAL_COURSES = len(df)
    print(f"✅ Loaded {TOTAL_COURSES:,} courses")
except Exception as e:
    print(f"❌ Dataset error: {e}")
    PLATFORMS, LEVELS, LANGUAGES, TOTAL_COURSES = [], [], [], 0
    df = pd.DataFrame()

PLATFORM_BASE_URLS = {
    "Udemy": "https://www.udemy.com",
    "Coursera": "https://www.coursera.org",
    "edX": "https://www.edx.org",
    "MIT OCW": "https://ocw.mit.edu",
    "Alison": "https://alison.com",
    "FutureLearn": "https://www.futurelearn.com",
    "Stanford University": "https://online.stanford.edu",
    "Harvard University": "https://online-learning.harvard.edu",
    "University of Oxford": "https://www.ox.ac.uk",
    "Pluralsight": "https://www.pluralsight.com",
    "Udacity": "https://www.udacity.com",
    "SWAYAM": "https://swayam.gov.in",
}

def fix_url(url: str, platform: str) -> str:
    if not url or url in ["nan", "None", "none", ""]:
        base = PLATFORM_BASE_URLS.get(platform, "")
        return base
    url = url.strip()
    if url.startswith("http://") or url.startswith("https://"):
        return url
    # Relative URL — prepend platform base
    base = PLATFORM_BASE_URLS.get(platform, "https://")
    if url.startswith("/"):
        return base + url
    return base + "/" + url

def format_courses(matches, max_price=None, is_free=None):
    courses = []
    seen_titles = set()
    for match in matches:
        meta = match.get("metadata", {})
        try:
            title = str(meta.get("title", "")).strip()
            if not title or title in seen_titles:
                continue
            seen_titles.add(title)
            price = float(meta.get("price", 0) or 0)
            free = bool(meta.get("is_free", False))
            if is_free is True and not free:
                continue
            if max_price is not None and price > max_price:
                continue
            platform = str(meta.get("platform", ""))
            url = fix_url(str(meta.get("course_url", "") or ""), platform)
            courses.append(CourseResponse(
                title=title,
                platform=platform,
                level=str(meta.get("level", "All Levels")),
                price=price,
                is_free=free,
                certificate=bool(meta.get("certificate", True)),
                avg_rating=float(meta.get("avg_rating", 0) or 0),
                num_reviews=float(meta.get("num_reviews", 0) or 0),
                duration_hours=str(meta.get("duration_hours", "") or ""),
                category=str(meta.get("category", "") or ""),
                skills=str(meta.get("skills", "") or ""),
                language=str(meta.get("language", "English") or "English"),
                course_url=url,
                description=str(meta.get("description", "") or "")[:200]
            ))
        except Exception as e:
            continue
    courses.sort(key=lambda x: (not x.is_free, -x.avg_rating))
    return courses

@router.post("/recommend")
async def recommend(req: QueryRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    filters = {}
    if req.platform and req.platform != "All":
        filters["platform"] = req.platform
    if req.level and req.level != "All":
        filters["level"] = req.level
    if req.is_free is not None:
        filters["is_free"] = req.is_free
    if req.max_price is not None:
        filters["max_price"] = req.max_price
    if req.language and req.language != "All":
        filters["language"] = req.language
    matches = retrieve_courses(
        query=req.query, top_k=50,
        platform=req.platform, level=req.level,
        is_free=None, max_price=None, language=req.language
    )
    courses = format_courses(matches, max_price=req.max_price, is_free=req.is_free)
    if len(courses) == 0:
        matches = retrieve_courses(query=req.query, top_k=100)
        courses = format_courses(matches, max_price=req.max_price, is_free=req.is_free)
    courses = courses[:10]
    ai_response = generate_recommendation(
        req.query, [{"metadata": c.dict()} for c in courses], filters
    )
    return {
        "courses": [c.dict() for c in courses],
        "ai_recommendation": ai_response,
        "total_found": len(courses),
        "query": req.query,
        "filters_applied": filters
    }

@router.get("/platforms")
async def get_platforms():
    return {"platforms": PLATFORMS, "total_courses": TOTAL_COURSES}

@router.get("/filters")
async def get_filters():
    return {
        "platforms": ["All"] + PLATFORMS,
        "levels": ["All"] + LEVELS,
        "languages": ["All"] + LANGUAGES
    }

@router.get("/health")
async def health():
    return {"status": "ok", "total_courses": TOTAL_COURSES}