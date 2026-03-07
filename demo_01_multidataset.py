"""
DEMO 01 – Multi-Dataset Operations
===================================
Pig operations: UNION, SPLIT, JOIN, LEFT OUTER JOIN

Chạy: python3 demo_01_multidataset.py

Files sử dụng (trong thư mục data/):
  students_program_A.csv  – 358 hs đã tham gia ôn thi (test_prep = completed)
  students_program_B.csv  – 642 hs chưa ôn thi       (test_prep = none)
  demographics.csv        – Thông tin cá nhân học sinh (student_id, gender, race...)
  scores.csv              – Điểm thi                   (student_id, math, reading, writing)
  scholarships.csv        – Bảng học bổng theo race    (5 dòng)
"""
import pandas as pd

DATA = "data"  # thư mục chứa các file

print("=" * 60)
print("DEMO 01: MULTI-DATASET OPERATIONS")
print("=" * 60)

# ──────────────────────────────────────────────────────────
# Giới thiệu các file đầu vào
# ──────────────────────────────────────────────────────────
prog_a = pd.read_csv(f"{DATA}/students_program_A.csv")
prog_b = pd.read_csv(f"{DATA}/students_program_B.csv")
demo   = pd.read_csv(f"{DATA}/demographics.csv")
scores = pd.read_csv(f"{DATA}/scores.csv")
schol  = pd.read_csv(f"{DATA}/scholarships.csv")

print("\n[Files đầu vào]")
print(f"  students_program_A.csv  : {len(prog_a):>4} dòng  (học sinh ĐÃ ôn thi)")
print(f"  students_program_B.csv  : {len(prog_b):>4} dòng  (học sinh CHƯA ôn thi)")
print(f"  demographics.csv        : {len(demo):>4} dòng  (thông tin cá nhân)")
print(f"  scores.csv              : {len(scores):>4} dòng  (kết quả thi)")
print(f"  scholarships.csv        : {len(schol):>4} dòng   (bảng tra cứu học bổng)")

# ──────────────────────────────────────────────────────────
# [1] UNION – Gộp 2 chương trình thành 1 tập duy nhất
# ──────────────────────────────────────────────────────────
# Pig:
#   prog_a = LOAD 'data/students_program_A.csv' USING PigStorage(',') AS (...);
#   prog_b = LOAD 'data/students_program_B.csv' USING PigStorage(',') AS (...);
#   all    = UNION prog_a, prog_b;
print("\n[1] UNION – Gộp 2 file chương trình thành 1 tập")
print("-" * 55)

all_students = pd.concat([prog_a, prog_b], ignore_index=True)

print(f"  Program A (ôn thi)  : {len(prog_a)} dòng")
print(f"  Program B (không ôn): {len(prog_b)} dòng")
print(f"  Sau UNION           : {len(all_students)} dòng")
print(f"\n  Kiểm tra tổng avg_math:")
print(f"    Program A avg_math = {prog_a['math'].mean():.1f}")
print(f"    Program B avg_math = {prog_b['math'].mean():.1f}")
print(f"    All students avg   = {all_students['math'].mean():.1f}")

# ──────────────────────────────────────────────────────────
# [2] SPLIT – Chia học sinh thành 3 nhóm học lực
# ──────────────────────────────────────────────────────────
# Pig:
#   SPLIT all_students INTO
#       excellent  IF math >= 80,
#       good       IF math >= 60 AND math < 80,
#       needs_help IF math < 60;
print("\n[2] SPLIT – Chia 3 nhóm học lực theo điểm Toán")
print("-" * 55)

excellent  = all_students[all_students["math"] >= 80]
good       = all_students[(all_students["math"] >= 60) & (all_students["math"] < 80)]
needs_help = all_students[all_students["math"] < 60]

for label, grp in [("Excellent (>=80)", excellent),
                   ("Good      (60-79)", good),
                   ("Needs Help (<60) ", needs_help)]:
    bar = "█" * int(len(grp)/10)
    print(f"  {label}: {len(grp):>4} ({len(grp)/len(all_students)*100:.1f}%) {bar}")

assert len(excellent) + len(good) + len(needs_help) == len(all_students)
print(f"  Tổng: {len(all_students)} ✓")

# ──────────────────────────────────────────────────────────
# [3] JOIN – Ghép demographics + scores theo student_id
# ──────────────────────────────────────────────────────────
# Pig:
#   demo   = LOAD 'data/demographics.csv' USING PigStorage(',') AS (...);
#   scores = LOAD 'data/scores.csv'       USING PigStorage(',') AS (...);
#   joined = JOIN demo BY student_id, scores BY student_id;
print("\n[3] JOIN – Ghép demographics.csv + scores.csv theo student_id")
print("-" * 55)

print(f"  demographics.csv columns : {list(demo.columns)}")
print(f"  scores.csv columns       : {list(scores.columns)}")

full = demo.merge(scores, on="student_id", how="inner")
print(f"\n  Sau JOIN: {len(full)} dòng, {len(full.columns)} cột")
print(f"  Columns: {list(full.columns)}")
print(f"\n  Mẫu 3 dòng đầu:")
print(full[["student_id","gender","race","math","reading","writing"]].head(3).to_string(index=False))

# ──────────────────────────────────────────────────────────
# [4] LEFT OUTER JOIN – Ghép học sinh giỏi với học bổng
#     Học sinh thuộc group D/E vẫn được giữ (scholarship = null)
# ──────────────────────────────────────────────────────────
# Pig:
#   partial_schol = LOAD 'data/scholarships.csv' USING PigStorage(',') AS (...);
#   result = JOIN excellent BY race LEFT OUTER, partial_schol BY race;
print("\n[4] LEFT OUTER JOIN – Excellent students + Scholarships")
print("-" * 55)

print(f"  scholarships.csv:")
print(schol.to_string(index=False))

left = excellent.merge(schol, on="race", how="left")
has     = left[left["scholarship"].notna()]
missing = left[left["scholarship"].isna()]

print(f"\n  Excellent students tổng  : {len(left)}")
print(f"  Có học bổng (A/B/C/D/E)  : {len(has)}  — scholarship = giá trị thực")
print(f"  KHÔNG có học bổng        : {len(missing)} — scholarship = NULL")
if len(missing) > 0:
    print(f"  (Các race chưa có học bổng: {sorted(missing['race'].unique())})")

print(f"\n  Mẫu 5 học sinh có học bổng:")
print(has[["gender","race","math","scholarship","amount_usd"]].head(5).to_string(index=False))

print("\nDone! Pig dùng cùng logic, chỉ khác syntax Pig Latin.")
print("Pig script tương ứng: pig_part2_students_demo.pig")
