import pandas as pd
import os

RAW = "backend/data/raw"
OUT = "backend/data/processed"
os.makedirs(OUT, exist_ok=True)

all_dfs = []

# ══════════════════════════════════════════════════════════════
# 1. Udemy Full (200K+ courses from Kaggle)
# ══════════════════════════════════════════════════════════════
print("Loading Udemy full dataset...")
try:
    df1 = pd.read_csv(f"{RAW}/udemy_full/Course_info.csv", on_bad_lines="skip")
    df1 = df1.rename(columns={"headline": "description"})
    df1["platform"] = "Udemy"
    df1["is_free"] = ~df1["is_paid"].astype(bool)
    df1["certificate"] = True
    df1["level"] = df1["level"].fillna("All Levels") if "level" in df1.columns else "All Levels"
    df1["duration_hours"] = (df1["content_length_min"] / 60).round(1).astype(str) + " hrs"
    df1["skills"] = df1.get("topic", pd.Series("", index=df1.index)).fillna("")
    df1["provider"] = "Udemy"
    df1["language"] = df1.get("language", pd.Series("English", index=df1.index)).fillna("English")
    all_dfs.append(df1[[
        "title", "description", "category", "level", "platform",
        "price", "is_free", "duration_hours", "num_reviews",
        "course_url", "certificate", "avg_rating", "skills",
        "provider", "language"
    ]])
    print(f"  ✅ Udemy full     : {len(df1):,} courses")
except Exception as e:
    print(f"  ❌ Udemy full error: {e}")


# ══════════════════════════════════════════════════════════════
# 2. Udemy Original (your uploaded file)
# ══════════════════════════════════════════════════════════════
print("Loading Udemy original...")
try:
    df2 = pd.read_csv(f"{RAW}/udemy_original/udemy_courses.csv")
    df2 = df2.rename(columns={
        "course_title": "title",
        "url": "course_url",
        "subject": "category",
        "content_duration": "duration_hours"
    })
    df2["platform"] = "Udemy"
    df2["is_free"] = ~df2["is_paid"].astype(bool)
    df2["certificate"] = True
    df2["description"] = ""
    df2["avg_rating"] = 0.0
    df2["skills"] = ""
    df2["provider"] = "Udemy"
    df2["language"] = "English"
    all_dfs.append(df2[[
        "title", "description", "category", "level", "platform",
        "price", "is_free", "duration_hours", "num_reviews",
        "course_url", "certificate", "avg_rating", "skills",
        "provider", "language"
    ]])
    print(f"  ✅ Udemy original  : {len(df2):,} courses")
except Exception as e:
    print(f"  ❌ Udemy original error: {e}")


# ══════════════════════════════════════════════════════════════
# 3. Coursera Rich (your uploaded file)
# ══════════════════════════════════════════════════════════════
print("Loading Coursera rich...")
try:
    df3 = pd.read_csv(f"{RAW}/coursera_rich.csv")
    df3 = df3.rename(columns={
        "workload": "duration_hours",
        "organizations": "category",
        "instructors": "provider"
    })
    df3["platform"] = "Coursera"
    df3["is_free"] = False
    df3["price"] = 49.0
    df3["certificate"] = True
    df3["avg_rating"] = 0.0
    df3["num_reviews"] = 0
    df3["skills"] = df3.get("skills", pd.Series("", index=df3.index)).fillna("")
    df3["language"] = df3.get("languages", pd.Series("English", index=df3.index)).fillna("English")
    df3["provider"] = df3.get("provider", pd.Series("Coursera", index=df3.index)).fillna("Coursera")
    df3["course_url"] = df3.get("course_url", pd.Series("", index=df3.index)).fillna("")
    all_dfs.append(df3[[
        "title", "description", "category", "level", "platform",
        "price", "is_free", "duration_hours", "num_reviews",
        "course_url", "certificate", "avg_rating", "skills",
        "provider", "language"
    ]])
    print(f"  ✅ Coursera rich   : {len(df3):,} courses")
except Exception as e:
    print(f"  ❌ Coursera rich error: {e}")


# ══════════════════════════════════════════════════════════════
# 4. Coursera Extra — Clean version (from Kaggle)
# ══════════════════════════════════════════════════════════════
print("Loading Coursera extra...")
try:
    df4 = pd.read_csv(f"{RAW}/coursera_extra/CourseraDataset-Clean.csv")
    df4 = df4.rename(columns={
        "Course Title": "title",
        "Level": "level",
        "What you will learn": "description",
        "Offered By": "provider",
        "Skill gain": "skills",
        "Course Url": "course_url",
        "Duration to complete (Approx.)": "duration_hours",
        "Number of Review": "num_reviews",
        "Rating": "avg_rating",
        "Keyword": "category"
    })
    df4["platform"] = "Coursera"
    df4["is_free"] = False
    df4["price"] = 49.0
    df4["certificate"] = True
    df4["language"] = "English"
    df4["avg_rating"] = pd.to_numeric(df4.get("avg_rating", 0), errors="coerce").fillna(0)
    df4["num_reviews"] = pd.to_numeric(df4.get("num_reviews", 0), errors="coerce").fillna(0)
    all_dfs.append(df4[[
        "title", "description", "category", "level", "platform",
        "price", "is_free", "duration_hours", "num_reviews",
        "course_url", "certificate", "avg_rating", "skills",
        "provider", "language"
    ]])
    print(f"  ✅ Coursera extra  : {len(df4):,} courses")
except Exception as e:
    print(f"  ❌ Coursera extra error: {e}")


# ══════════════════════════════════════════════════════════════
# 5. edX (from Kaggle)
# ══════════════════════════════════════════════════════════════
print("Loading edX...")
try:
    df5 = pd.read_csv(f"{RAW}/edx/EdX.csv")
    df5 = df5.rename(columns={
        "Name": "title",
        "University": "provider",
        "Difficulty Level": "level",
        "Link": "course_url",
        "About": "description",
        "Course Description": "skills"
    })
    df5["platform"] = "edX"
    df5["is_free"] = True
    df5["price"] = 0
    df5["certificate"] = True
    df5["avg_rating"] = 0.0
    df5["num_reviews"] = 0
    df5["duration_hours"] = ""
    df5["category"] = df5.get("provider", pd.Series("General")).fillna("General")
    df5["language"] = "English"
    all_dfs.append(df5[[
        "title", "description", "category", "level", "platform",
        "price", "is_free", "duration_hours", "num_reviews",
        "course_url", "certificate", "avg_rating", "skills",
        "provider", "language"
    ]])
    print(f"  ✅ edX             : {len(df5):,} courses")
except Exception as e:
    print(f"  ❌ edX error: {e}")


# ══════════════════════════════════════════════════════════════
# 6. ALL COURSES CSV (MIT OCW, Alison, FutureLearn, Oxford,
#    Stanford, Harvard, Pluralsight, Udacity, SWAYAM etc.)
# ══════════════════════════════════════════════════════════════
print("Loading all_courses.csv (12 platforms)...")
try:
    df6 = pd.read_csv(f"{RAW}/all_courses.csv")
    df6 = df6.rename(columns={
        "rating": "avg_rating",
        "duration": "duration_hours",
        "learners": "num_reviews"
    })
    df6["is_free"] = df6["price"] == 0
    df6["certificate"] = df6["certificate"].map(
        {"Yes": True, "No": False}
    ).fillna(True)
    df6["avg_rating"] = 0.0
    df6["num_reviews"] = 0
    df6["provider"] = df6.get("provider", df6["platform"]).fillna(df6["platform"])
    df6["language"] = df6.get("language", pd.Series("English", index=df6.index)).fillna("English")
    df6["course_url"] = df6.get("course_url", pd.Series("", index=df6.index)).fillna("")
    df6["description"] = df6.get("description", pd.Series("", index=df6.index)).fillna("")
    df6["skills"] = df6.get("skills", pd.Series("", index=df6.index)).fillna("")
    df6["level"] = df6.get("level", pd.Series("All Levels", index=df6.index)).fillna("All Levels")
    all_dfs.append(df6[[
        "title", "description", "category", "level", "platform",
        "price", "is_free", "duration_hours", "num_reviews",
        "course_url", "certificate", "avg_rating", "skills",
        "provider", "language"
    ]])
    print(f"  ✅ all_courses.csv : {len(df6):,} courses")
    print(f"     Platforms inside:")
    for plat, count in df6["platform"].value_counts().items():
        print(f"       {plat:<30} {count:,}")
except Exception as e:
    print(f"  ❌ all_courses.csv error: {e}")


# ══════════════════════════════════════════════════════════════
# MERGE ALL DATASETS
# ══════════════════════════════════════════════════════════════
print("\nMerging all datasets...")
combined = pd.concat(all_dfs, ignore_index=True)

# Clean title
combined = combined.dropna(subset=["title"])
combined["title"] = combined["title"].astype(str).str.strip()

# Remove duplicates (same title + same platform)
combined = combined.drop_duplicates(subset=["title", "platform"])

# Fill missing values
combined["level"]         = combined["level"].fillna("All Levels")
combined["description"]   = combined["description"].fillna("")
combined["category"]      = combined["category"].fillna("General")
combined["skills"]        = combined["skills"].fillna("")
combined["provider"]      = combined["provider"].fillna(combined["platform"])
combined["language"]      = combined["language"].fillna("English")
combined["price"]         = pd.to_numeric(combined["price"], errors="coerce").fillna(0)
combined["is_free"]       = combined["is_free"].fillna(False)
combined["num_reviews"]   = pd.to_numeric(combined["num_reviews"], errors="coerce").fillna(0)
combined["avg_rating"]    = pd.to_numeric(combined["avg_rating"], errors="coerce").fillna(0)
combined["duration_hours"]= combined["duration_hours"].fillna("")
combined["course_url"]    = combined["course_url"].fillna("")
combined["certificate"]   = combined["certificate"].fillna(True)

# Reset index as course_id
combined = combined.reset_index(drop=True)
combined.insert(0, "course_id", combined.index)

# ══════════════════════════════════════════════════════════════
# CREATE EMBED TEXT FOR RAG (this is what goes into Pinecone)
# ══════════════════════════════════════════════════════════════
combined["embed_text"] = (
    "Title: "       + combined["title"].astype(str)          + ". " +
    "Platform: "    + combined["platform"].astype(str)        + ". " +
    "Provider: "    + combined["provider"].astype(str)        + ". " +
    "Level: "       + combined["level"].astype(str)           + ". " +
    "Category: "    + combined["category"].astype(str)        + ". " +
    "Skills: "      + combined["skills"].astype(str).str[:200]+ ". " +
    "Free: "        + combined["is_free"].astype(str)         + ". " +
    "Price: $"      + combined["price"].astype(str)           + ". " +
    "Certificate: " + combined["certificate"].astype(str)     + ". " +
    "Language: "    + combined["language"].astype(str)        + ". " +
    "Description: " + combined["description"].astype(str).str[:300]
)

# ══════════════════════════════════════════════════════════════
# SAVE
# ══════════════════════════════════════════════════════════════
combined.to_csv(f"{OUT}/courses_combined.csv", index=False)

# ══════════════════════════════════════════════════════════════
# FINAL REPORT
# ══════════════════════════════════════════════════════════════
print(f"\n{'='*60}")
print(f"🎉 FINAL MASTER DATASET READY")
print(f"{'='*60}")
print(f"  Total courses     : {len(combined):,}")
print(f"\n  Platform breakdown:")
for plat, count in combined["platform"].value_counts().items():
    free_count = combined[combined["platform"]==plat]["is_free"].sum()
    paid_count = count - free_count
    print(f"    {plat:<30} {count:>7,}  (Free: {int(free_count):,} | Paid: {int(paid_count):,})")
print(f"\n  Free courses      : {int(combined['is_free'].sum()):,}")
print(f"  Paid courses      : {int((~combined['is_free']).sum()):,}")
print(f"  With ratings      : {int((combined['avg_rating']>0).sum()):,}")
print(f"  With reviews      : {int((combined['num_reviews']>0).sum()):,}")
print(f"  With certificate  : {int(combined['certificate'].sum()):,}")
print(f"  Languages         : {combined['language'].nunique()} unique")
print(f"\n  Columns           : {combined.columns.tolist()}")
print(f"{'='*60}")
print(f"  ✅ Saved to: backend/data/processed/courses_combined.csv")
print(f"{'='*60}")