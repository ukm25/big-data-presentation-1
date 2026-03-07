"""
DEMO 03 – Pig Troubleshooting
==============================
Input:  data/StudentsPerformance.csv  – dùng để show lỗi header (đọc raw)
        data/demographics.csv          – show lỗi sai kiểu (race:int)
        data/scores.csv                – show lỗi giá trị biên (điểm 0)

Chạy: python3 demo_03_troubleshooting.py
"""
import pandas as pd

DATA = "data"

print("=" * 60)
print("DEMO 03: PIG TROUBLESHOOTING – 3 LỖI PHỔ BIẾN")
print("=" * 60)

# Load đúng chuẩn để biết con số thực
df_correct = pd.read_csv(f"{DATA}/StudentsPerformance.csv")
df_correct.columns = ["gender","race","parent_edu","lunch","test_prep","math","reading","writing"]
print(f"\nDataset gốc: {len(df_correct)} dòng, {df_correct.shape[1]} cột, 0 null")

# ----------------------------------------------------------
# LỖI 1: Không bỏ header khi LOAD bằng PigStorage
# → Pig đọc dòng tiêu đề như một dòng dữ liệu
# Minh họa: đọc StudentsPerformance.csv không bỏ header
# ----------------------------------------------------------
print("\n[LOI 1] Không bỏ header → Pig đọc tiêu đề nhầm thành dữ liệu")
print("-" * 55)

raw = pd.read_csv(f"{DATA}/StudentsPerformance.csv", header=None)
print(f"  Tổng dòng đọc vào (gồm cả header): {len(raw)}")
print(f"  Dòng 0 (header bị đọc nhầm):  {list(raw.iloc[0])}")
print(f"  Dòng 1 (data thực đầu tiên):   {list(raw.iloc[1])}")

raw_math = pd.to_numeric(raw[5], errors="coerce")
print(f"  Nếu ép cột math:int → NULL ở dòng 0: {raw_math.isna().sum()} dòng bị null")
print(f"  FIX → Pig: FILTER raw BY gender != 'gender';")

# ----------------------------------------------------------
# LỖI 2: Sai kiểu dữ liệu khi LOAD demographics.csv
# demographics.csv có cột race = text → khai báo nhầm race:int
# ----------------------------------------------------------
print("\n[LOI 2] Sai kiểu dữ liệu trong demographics.csv (race:int thay vì chararray)")
print("-" * 55)

demo = pd.read_csv(f"{DATA}/demographics.csv")
print(f"  demographics.csv: {len(demo)} dòng")
print(f"  Giá trị thực cột race: {sorted(demo['race'].unique())}")

race_as_int = pd.to_numeric(demo["race"], errors="coerce")
print(f"  Nếu Pig khai báo race:int → NULL: {race_as_int.isna().sum()}/{len(demo)} = {race_as_int.isna().mean()*100:.0f}%")
print(f"  FIX → Pig: LOAD 'demographics.csv' AS (student_id:int, gender:chararray, race:chararray, ...);")

# ----------------------------------------------------------
# LỖI 3: Giá trị biên trong scores.csv (điểm 0 và 100)
# Lỗi ngầm: FILTER BY math > 0 (thay vì >=0) bỏ sót điểm 0
# ----------------------------------------------------------
print("\n[LOI 3] Giá trị biên trong scores.csv – điểm 0 bị lọc sót")
print("-" * 55)

sc = pd.read_csv(f"{DATA}/scores.csv")
zero_math    = sc[sc["math"] == 0]
perfect_math = sc[sc["math"] == 100]
print(f"  scores.csv: {len(sc)} dòng")
print(f"  Học sinh điểm Toán = 0   : {len(zero_math)} em")
print(f"  Học sinh điểm Toán = 100 : {len(perfect_math)} em")

wrong  = sc[sc["math"] > 0]
right  = sc[sc["math"] >= 0]
print(f"\n  SAI  (math > 0)  : {len(wrong)} học sinh → mất {len(sc)-len(wrong)} em điểm 0")
print(f"  ĐÚNG (math >= 0) : {len(right)} học sinh → giữ đủ tất cả")
print(f"  FIX → Pig: FILTER BY math IS NOT NULL AND math >= 0 AND math <= 100;")

# ----------------------------------------------------------
# Bộ công cụ debug
# ----------------------------------------------------------
print("\n[TOOLS DEBUG] Pig → Python tương đương")
print("-" * 55)
print("  DESCRIBE demographics → demo.dtypes:")
print(demo.dtypes.to_string())
print(f"\n  LIMIT 3 DUMP → sc.head(3):")
print(sc.head(3).to_string(index=False))

print("\nDone! 3 lỗi này rất hay gặp khi làm việc với CSV dataset thực tế.")
