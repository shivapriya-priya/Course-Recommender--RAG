import requests
import pandas as pd
import time
import os

OUT = "backend/data/raw"
os.makedirs(OUT, exist_ok=True)

# ══════════════════════════════════════════════════════
# 1. MIT OpenCourseWare — Direct API
# ══════════════════════════════════════════════════════
print("Fetching MIT OpenCourseWare...")
try:
    url = "https://ocw.mit.edu/api/v0/courses/"
    response = requests.get(url, timeout=30)
    data = response.json()
    
    records = []
    for course in data:
        records.append({
            "title": course.get("title", ""),
            "description": course.get("description", ""),
            "category": str(course.get("topics", [])),
            "level": "University",
            "platform": "MIT OCW",
            "is_free": True,
            "price": 0,
            "certificate": False,
            "course_url": "https://ocw.mit.edu" + course.get("url", ""),
            "num_reviews": 0,
            "avg_rating": 0,
            "duration_hours": ""
        })
    
    df_mit = pd.DataFrame(records)
    df_mit.to_csv(f"{OUT}/mit_ocw.csv", index=False)
    print(f"  ✅ MIT OCW: {len(df_mit)} courses saved")

except Exception as e:
    print(f"  ❌ MIT OCW failed: {e}")

# ══════════════════════════════════════════════════════
# 2. Coursera Public API — No Key Needed
# ══════════════════════════════════════════════════════
print("\nFetching Coursera via public API...")
try:
    base = "https://api.coursera.org/api/courses.v1"
    params = {
        "fields": "name,description,slug,primaryLanguages,workload",
        "limit": 100,
        "start": 0
    }
    
    all_courses = []
    page = 0
    
    while page < 30:  # Max 3000 courses
        params["start"] = page * 100
        r = requests.get(base, params=params, timeout=15)
        
        if r.status_code != 200:
            print(f"  Stopped at page {page}: status {r.status_code}")
            break
        
        data = r.json()
        courses = data.get("elements", [])
        
        if not courses:
            break
        
        all_courses.extend(courses)
        print(f"  Page {page+1}: {len(all_courses)} courses so far...")
        page += 1
        time.sleep(0.5)
    
    records = []
    for c in all_courses:
        records.append({
            "title": c.get("name", ""),
            "description": c.get("description", ""),
            "category": "General",
            "level": "All Levels",
            "platform": "Coursera",
            "is_free": False,
            "price": 49.0,
            "certificate": True,
            "course_url": "https://www.coursera.org/learn/" + c.get("slug", ""),
            "num_reviews": 0,
            "avg_rating": 0,
            "duration_hours": c.get("workload", "")
        })
    
    df_coursera_api = pd.DataFrame(records)
    df_coursera_api.to_csv(f"{OUT}/coursera_api.csv", index=False)
    print(f"  ✅ Coursera API: {len(df_coursera_api)} courses saved")

except Exception as e:
    print(f"  ❌ Coursera API failed: {e}")

# ══════════════════════════════════════════════════════
# 3. edX Public API — No Key Needed
# ══════════════════════════════════════════════════════
print("\nFetching edX via public API...")
try:
    url = "https://discovery.edx.org/api/v1/courses/?limit=50"
    all_courses = []
    
    while url and len(all_courses) < 2000:
        r = requests.get(url, timeout=15)
        if r.status_code != 200:
            break
        data = r.json()
        all_courses.extend(data.get("results", []))
        url = data.get("next")
        print(f"  Fetched {len(all_courses)} edX courses...")
        time.sleep(0.3)
    
    records = []
    for c in all_courses:
        records.append({
            "title": c.get("title", ""),
            "description": c.get("short_description", ""),
            "category": str([s.get("name") for s in c.get("subjects", [])]),
            "level": c.get("level_type", "All Levels"),
            "platform": "edX",
            "is_free": True,
            "price": 0,
            "certificate": True,
            "course_url": "https://www.edx.org/course/" + c.get("slug", ""),
            "num_reviews": 0,
            "avg_rating": 0,
            "duration_hours": ""
        })
    
    df_edx_api = pd.DataFrame(records)
    df_edx_api.to_csv(f"{OUT}/edx_api.csv", index=False)
    print(f"  ✅ edX API: {len(df_edx_api)} courses saved")

except Exception as e:
    print(f"  ❌ edX API failed: {e}")

# ══════════════════════════════════════════════════════
# 4. Khan Academy — Public API
# ══════════════════════════════════════════════════════
print("\nFetching Khan Academy...")
try:
    url = "https://www.khanacademy.org/api/v1/topics/library"
    r = requests.get(url, timeout=15)
    data = r.json()
    
    records = []
    def extract_topics(node, parent=""):
        if isinstance(node, dict):
            title = node.get("title", "")
            desc = node.get("description", "")
            url = "https://www.khanacademy.org" + node.get("url", "")
            kind = node.get("kind", "")
            
            if kind in ["Topic", "Course"] and title:
                records.append({
                    "title": title,
                    "description": desc,
                    "category": parent or "General",
                    "level": "Beginner",
                    "platform": "Khan Academy",
                    "is_free": True,
                    "price": 0,
                    "certificate": False,
                    "course_url": url,
                    "num_reviews": 0,
                    "avg_rating": 0,
                    "duration_hours": ""
                })
            
            for child in node.get("children", []):
                extract_topics(child, title)
    
    extract_topics(data)
    
    df_khan = pd.DataFrame(records)
    df_khan.to_csv(f"{OUT}/khan_academy.csv", index=False)
    print(f"  ✅ Khan Academy: {len(df_khan)} courses saved")

except Exception as e:
    print(f"  ❌ Khan Academy failed: {e}")

# ══════════════════════════════════════════════════════
# 5. FutureLearn — Public Course Listing
# ══════════════════════════════════════════════════════
print("\nFetching FutureLearn...")
try:
    headers = {"User-Agent": "Mozilla/5.0"}
    url = "https://www.futurelearn.com/api/courses"
    r = requests.get(url, headers=headers, timeout=15)
    data = r.json()
    
    records = []
    courses = data if isinstance(data, list) else data.get("courses", [])
    
    for c in courses:
        records.append({
            "title": c.get("name", c.get("title", "")),
            "description": c.get("summary", c.get("description", "")),
            "category": c.get("category", "General"),
            "level": c.get("level", "All Levels"),
            "platform": "FutureLearn",
            "is_free": c.get("is_free", False),
            "price": c.get("price", 0),
            "certificate": True,
            "course_url": "https://www.futurelearn.com" + c.get("url", ""),
            "num_reviews": 0,
            "avg_rating": c.get("rating", 0),
            "duration_hours": c.get("duration", "")
        })
    
    df_fl = pd.DataFrame(records)
    df_fl.to_csv(f"{OUT}/futurelearn.csv", index=False)
    print(f"  ✅ FutureLearn: {len(df_fl)} courses saved")

except Exception as e:
    print(f"  ❌ FutureLearn failed: {e}")

print("\n✅ All platform collection done!")
print("Now run: python scripts/fix_merge.py")