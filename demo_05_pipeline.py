"""
DEMO 05 – Full Pipeline (Demo tổng hợp)
=========================================
Kết hợp TẤT CẢ các file dữ liệu và kỹ thuật vào 1 pipeline hoàn chỉnh

Chạy: python3 demo_05_pipeline.py
"""
import pandas as pd
import time

DATA = "data"

print("=" * 60)
print("DEMO 05: FULL PIPELINE – KẾT HỢP TẤT CẢ FILE DATA")
print("=" * 60)

start_time = time.perf_counter()

# ──────────────────────────────────────────────────────────
# PHASE 1: UNION & CLEAN (Troubleshooting)
# ──────────────────────────────────────────────────────────
print("[PHASE 1] LOAD & UNION (Program A + Program B)")
print("-" * 50)

prog_a = pd.read_csv(f"{DATA}/students_program_A.csv")
prog_b = pd.read_csv(f"{DATA}/students_program_B.csv")

# Gộp lại (UNION)
students = pd.concat([prog_a, prog_b], ignore_index=True)
print(f"  Gộp Program A ({len(prog_a)}) + Program B ({len(prog_b)}) = {len(students)} học sinh")

# Kiểm tra dữ liệu (Troubleshooting: lọc giá trị lỗi nếu có)
students = students[(students["math"] >= 0) & (students["math"] <= 100)]
print(f"  Sau khi validate điểm (0-100): {len(students)} học sinh")

# ──────────────────────────────────────────────────────────
# PHASE 2: JOIN (Demographics + Scores)
# ──────────────────────────────────────────────────────────
print("\n[PHASE 2] JOIN (Demographics + Scholarships Tra cứu)")
print("-" * 50)

schol = pd.read_csv(f"{DATA}/scholarships.csv")
# JOIN Replicated mô phỏng: Ghép học bổng vào danh sách
enriched = students.merge(schol, on="race", how="left")
print(f"  Đã ghép {len(schol)} loại học bổng vào {len(enriched)} học sinh")

# ──────────────────────────────────────────────────────────
# PHASE 3: UDF (Extending Pig)
# ──────────────────────────────────────────────────────────
print("\n[PHASE 3] UDF – Tính điểm TB & Xếp loại")
print("-" * 50)

def get_grade(avg):
    if avg >= 90: return "Xuat Sac"
    if avg >= 80: return "Gioi"
    if avg >= 65: return "Kha"
    if avg >= 50: return "Trung Binh"
    return "Yeu"

enriched["avg_score"] = ((enriched["math"] + enriched["reading"] + enriched["writing"]) / 3).round(2)
enriched["grade"] = enriched["avg_score"].apply(get_grade)

print(f"  Mẫu kết quả (3 học sinh đầu):")
print(enriched[["student_id", "gender", "avg_score", "grade", "scholarship"]].head(3).to_string(index=False))

# ──────────────────────────────────────────────────────────
# PHASE 4: SPLIT & AGGREGATE (Multi-Dataset)
# ──────────────────────────────────────────────────────────
print("\n[PHASE 4] SPLIT & THỐNG KÊ")
print("-" * 50)

# SPLIT thành TOP và OTHERS
top_students = enriched[enriched["avg_score"] >= 80]
others       = enriched[enriched["avg_score"] < 80]

print(f"  Nhóm TOP (>=80)     : {len(top_students)} học sinh")
print(f"  Nhóm còn lại (<80)  : {len(others)} học sinh")

# Thống kê cuối cùng
print("\n[KẾT QUẢ CUỐI CÙNG]")
final_stats = top_students.groupby("gender").agg(
    count=("student_id", "count"),
    avg_math=("math", "mean"),
    scholarship_count=("scholarship", "count")
).round(2)

print(final_stats)

end_time = time.perf_counter()
print(f"\n{'=' * 60}")
print(f"Pipeline hoàn thành trong {(end_time - start_time)*1000:.2f} ms")
print("=" * 60)
