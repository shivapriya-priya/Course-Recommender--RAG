from pydantic import BaseModel
from typing import Optional, List

class QueryRequest(BaseModel):
    query: str
    platform: Optional[str] = None
    level: Optional[str] = None
    is_free: Optional[bool] = None
    max_price: Optional[float] = None
    language: Optional[str] = None
    certificate: Optional[bool] = None
    top_k: Optional[int] = 10

class CourseResponse(BaseModel):
    course_id: Optional[str] = None
    title: str
    platform: str
    level: Optional[str] = None
    price: Optional[float] = 0
    is_free: Optional[bool] = False
    certificate: Optional[bool] = True
    avg_rating: Optional[float] = 0
    num_reviews: Optional[float] = 0
    duration_hours: Optional[str] = None
    category: Optional[str] = None
    skills: Optional[str] = None
    language: Optional[str] = None
    course_url: Optional[str] = None
    description: Optional[str] = None

class RecommendResponse(BaseModel):
    courses: List[CourseResponse]
    ai_recommendation: str
    total_found: int
    query: str
    filters_applied: dict