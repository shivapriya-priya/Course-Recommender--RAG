import pandas as pd
import os

RAW = "backend/data/raw"
OUT = "backend/data/processed"
os.makedirs(OUT, exist_ok=True)

all_dfs = []

# ── 1. Udemy Full (200K courses) ─────────────────────────────────────
print("Loading Udemy full dataset...")
try:
    df = pd.read_csv(f"{RAW}/udemy_full/Course_info.csv", encoding="utf-8", on_bad_lines="skip")
    print(f"  Columns: {df.columns.tolist()}")
    
    # Rename columns to standard names
    df = df.rename(columns={
        "course_title": "title",
        "Title": "title",
        "NAME": "title",
        "url": "course_url",
        "URL": "course_url",
        "is_paid": "is_paid",
        "price": "price",
        "Price": "price",
        "subject": "category",
        "Subject": "category",
        "level": "level",
        "Level": "level",
        "num_reviews": "num_reviews",
        "content_duration": "duration_hours"
    })
    
    df["platform"] = "Udemy"
    if "is_paid" in df.columns:
        df["is_free"] = ~df["is_paid"].astype(bool)
    else:
        df["is_free"] = False
    df["certificate"] = True
    df["description"] = df.get("description", pd.Series("", index=df.index)).fillna("")
    
    all_dfs.append(df)
    print(f"  ✅ Udemy full: {len(df)} courses")
except Exception as e:
    print(f"  ❌ Udemy full error: {e}")

# ── 2. Udemy Original (your file) ────────────────────────────────────
print("Loading Udemy original...")
try:
    df = pd.read_csv(f"{RAW}/udemy_original/udemy_courses.csv")
    df = df.rename(columns={
        "course_title": "title",
        "url": "course_url",
        "subject": "category",
        "content_duration": "duration_hours"
    })
    df["platform"] = "Udemy"
    df["is_free"] = ~df["is_paid"].astype(bool)
    df["certificate"] = True
    df["description"] = ""
    all_dfs.append(df)
    print(f"  ✅ Udemy original: {len(df)} courses")
except Exception as e:
    print(f"  ❌ Udemy original error: {e}")

# ── 3. Coursera Rich (your file) ─────────────────────────────────────
print("Loading Coursera rich...")
try:
    df = pd.read_csv(f"{RAW}/coursera_rich.csv")
    df = df.rename(columns={
        "workload": "duration_hours",
        "organizations": "category"
    })
    df["platform"] = "Coursera"
    df["is_free"] = False
    df["price"] = 49.0
    df["certificate"] = True
    all_dfs.append(df)
    print(f"  ✅ Coursera rich: {len(df)} courses")
except Exception as e:
    print(f"  ❌ Coursera rich error: {e}")

# ── 4. Coursera Extra (clean version) ────────────────────────────────
print("Loading Coursera extra...")
try:
    df = pd.read_csv(f"{RAW}/coursera_extra/CourseraDataset-Clean.csv")
    print(f"  Columns: {df.columns.tolist()}")
    df["platform"] = "Coursera"
    df["is_free"] = False
    df["price"] = 49.0
    df["certificate"] = True
    all_dfs.append(df)
    print(f"  ✅ Coursera extra: {len(df)} courses")
except Exception as e:
    print(f"  ❌ Coursera extra error: {e}")

# ── 5. edX ───────────────────────────────────────────────────────────
print("Loading edX...")
try:
    df = pd.read_csv(f"{RAW}/edx/EdX.csv")
    print(f"  Columns: {df.columns.tolist()}")
    df["platform"] = "edX"
    df["is_free"] = True
    df["price"] = 0
    df["certificate"] = True
    all_dfs.append(df)
    print(f"  ✅ edX: {len(df)} courses")
except Exception as e:
    print(f"  ❌ edX error: {e}")

# ── Merge All ─────────────────────────────────────────────────────────
print("\nMerging all datasets...")
combined = pd.concat(all_dfs, ignore_index=True)

# Standardize title column
for col in ["title", "Title", "NAME", "course_title", "name"]:
    if col in combined.columns and col != "title":
        combined["title"] = combined["title"].fillna(combined[col])

# Clean up
combined = combined.dropna(subset=["title"])
combined["title"] = combined["title"].astype(str).str.strip()
combined = combined.drop_duplicates(subset=["title", "platform"])
combined["level"] = combined.get("level", pd.Series("All Levels")).fillna("All Levels")
combined["description"] = combined.get("description", pd.Series("")).fillna("")
combined["category"] = combined.get("category", pd.Series("General")).fillna("General")
combined["price"] = pd.to_numeric(combined.get("price", 0), errors="coerce").fillna(0)
combined["is_free"] = combined.get("is_free", False).fillna(False)
combined["course_url"] = combined.get("course_url", pd.Series("")).fillna("")
combined["certificate"] = combined.get("certificate", True).fillna(True)
combined["num_reviews"] = pd.to_numeric(combined.get("num_reviews", 0), errors="coerce").fillna(0)
combined["duration_hours"] = combined.get("duration_hours", pd.Series("")).fillna("")

# ── Create embed_text for RAG ─────────────────────────────────────────
combined["embed_text"] = (
    "Title: " + combined["title"] + ". "
    "Platform: " + combined["platform"].fillna("") + ". "
    "Level: " + combined["level"].astype(str) + ". "
    "Category: " + combined["category"].astype(str) + ". "
    "Free: " + combined["is_free"].astype(str) + ". "
    "Description: " + combined["description"].astype(str).str[:300]
)

# ── Save ──────────────────────────────────────────────────────────────
combined.to_csv(f"{OUT}/courses_combined.csv", index=False)

print(f"\n{'='*50}")
print(f"✅ FINAL DATASET READY!")
print(f"   Total courses  : {len(combined):,}")
print(f"\n   Platform breakdown:")
print(combined["platform"].value_counts().to_string())
print(f"\n   Free courses   : {combined['is_free'].sum():,}")
print(f"   Paid courses   : {(~combined['is_free']).sum():,}")
print(f"\n   Saved to: backend/data/processed/courses_combined.csv")
print(f"{'='*50}")