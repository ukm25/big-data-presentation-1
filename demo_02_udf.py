"""
DEMO 02 – Extending Pig: UDF (User-Defined Functions)
======================================================
Input:  data/demographics.csv  (student_id, gender, race, parent_edu, lunch, test_prep)
        data/scores.csv         (student_id, math, reading, writing)
Step 0: JOIN 2 file theo student_id → full dataset
Step 1-4: Áp dụng 4 UDF lên dataset đó

Chạy: python3 demo_02_udf.py
"""
import pandas as pd

DATA = "data"

print("=" * 60)
print("DEMO 02: EXTENDING PIG – USER-DEFINED FUNCTIONS (UDF)")
print("=" * 60)

# ── Load 2 file tách biệt ────────────────────────────────
demographics = pd.read_csv(f"{DATA}/demographics.csv")
scores       = pd.read_csv(f"{DATA}/scores.csv")

print(f"\n[Files đầu vào]")
print(f"  demographics.csv : {len(demographics)} dòng, cols={list(demographics.columns)}")
print(f"  scores.csv       : {len(scores)} dòng, cols={list(scores.columns)}")

# ── JOIN 2 file trước khi áp dụng UDF ───────────────────
# Pig: joined = JOIN demographics BY student_id, scores BY student_id;
df = demographics.merge(scores, on="student_id", how="inner")
print(f"\n  Sau JOIN: {len(df)} dòng, {df.shape[1]} cột")

# ----------------------------------------------------------
# Định nghĩa 4 UDF
# Pig: REGISTER 'student_udfs.py' USING jython AS student_lib;
# ----------------------------------------------------------
def calc_avg(math, reading, writing):
    """UDF 1: Tính điểm trung bình 3 môn"""
    return round((math + reading + writing) / 3.0, 2)

def get_grade(avg):
    """UDF 2: Xếp loại học lực"""
    if avg >= 90: return "Xuat Sac"
    if avg >= 80: return "Gioi"
    if avg >= 65: return "Kha"
    if avg >= 50: return "Trung Binh"
    return "Yeu"

def find_strength(math, reading, writing):
    """UDF 3: Phát hiện năng khiếu"""
    verbal = (reading + writing) / 2.0
    if math - verbal > 10:   return "Strong in Math"
    if verbal - math > 10:   return "Strong in Reading/Writing"
    return "Balanced"

def needs_test_prep(avg, prep_status):
    """UDF 4: Khuyến nghị ôn thi thêm"""
    return avg < 65 and prep_status.strip().lower() == "none"

# ── Áp dụng UDF ─────────────────────────────────────────
# Pig:
#   with_udf = FOREACH joined GENERATE
#       student_id, gender,
#       student_lib.calc_avg(math, reading, writing) AS avg_score,
#       student_lib.get_grade(avg_score)              AS grade,
#       student_lib.find_strength(math, reading, writing) AS strength,
#       student_lib.needs_test_prep(avg_score, test_prep)  AS needs_prep;
df["avg_score"]  = df.apply(lambda r: calc_avg(r["math"], r["reading"], r["writing"]), axis=1)
df["grade"]      = df["avg_score"].apply(get_grade)
df["strength"]   = df.apply(lambda r: find_strength(r["math"], r["reading"], r["writing"]), axis=1)
df["needs_prep"] = df.apply(lambda r: needs_test_prep(r["avg_score"], r["test_prep"]), axis=1)

print("\n[1] Mẫu 8 học sinh sau 4 UDF:")
print("-" * 60)
print(df[["student_id","gender","math","reading","writing","avg_score","grade","strength"]].head(8).to_string(index=False))

print("\n[2] Phân bố xếp loại (get_grade):")
print("-" * 40)
for g in ["Xuat Sac","Gioi","Kha","Trung Binh","Yeu"]:
    n   = (df["grade"] == g).sum()
    pct = n / len(df) * 100
    bar = "█" * int(pct / 2)
    print(f"  {g:<12}: {n:>4} ({pct:5.1f}%) {bar}")

print("\n[3] Phân bố năng khiếu (find_strength):")
print("-" * 40)
for s, n in df["strength"].value_counts().items():
    print(f"  {s:<30}: {n} học sinh")

n_prep = df["needs_prep"].sum()
print(f"\n[4] Học sinh cần ôn thi thêm (needs_test_prep): {n_prep} em")
print(f"    Điều kiện: avg < 65 VÀ test_prep == 'none'")
print(f"    Trong đó: {df[df['needs_prep']]['gender'].value_counts().to_dict()}")

print("\nDone! UDF cho phép Pig tùy biến logic mà built-in không có.")
