"""
DEMO 04 – Pig Optimization
============================
Input:  data/demographics.csv
        data/scores.csv
        data/scholarships.csv

Kỹ thuật: FILTER sớm vs muộn, Column Pruning, Replicated JOIN

Chạy: python3 demo_04_optimization.py
"""
import pandas as pd
import time

DATA = "data"

print("=" * 60)
print("DEMO 04: PIG OPTIMIZATION")
print("=" * 60)

# Load data thực
demo   = pd.read_csv(f"{DATA}/demographics.csv")
scores = pd.read_csv(f"{DATA}/scores.csv")
# JOIN lại để có dataset lớn xử lý
df_base = demo.merge(scores, on="student_id")

# Scale lên 500 lần (~500,000 dòng) để thấy rõ hiệu quả bench
SCALE = 500
df = pd.concat([df_base] * SCALE, ignore_index=True)

print(f"\nDataset mô phỏng: {len(df):,} dòng (x{SCALE} scale từ data gốc)")

# ----------------------------------------------------------
# KỸ THUẬT 1: FILTER sớm vs FILTER muộn
# ----------------------------------------------------------
print("\n[KT1] FILTER sớm vs FILTER muộn")
print("-" * 55)

N = 5
times_slow, times_fast = [], []

for _ in range(N):
    # CHẬM: Giữ nguyên 9 cột -> Filter -> Group
    t0 = time.perf_counter()
    slow = df.copy() 
    slow = slow[slow["math"] >= 80]
    slow_res = slow.groupby("gender")["math"].mean()
    times_slow.append((time.perf_counter() - t0) * 1000)

    # NHANH: Filter ngay -> Cắt lấy 2 cột cần -> Group
    t1 = time.perf_counter()
    fast = df[df["math"] >= 80][["gender", "math"]]
    fast_res = fast.groupby("gender")["math"].mean()
    times_fast.append((time.perf_counter() - t1) * 1000)

avg_slow = sum(times_slow) / N
avg_fast = sum(times_fast) / N

print(f"  CHẬM (9 cột, filter muộn) : {avg_slow:.1f} ms")
print(f"  NHANH (2 cột, filter sớm) : {avg_fast:.1f} ms")
print(f"  Nhanh hơn: {avg_slow/avg_fast:.1f}x")

# ----------------------------------------------------------
# KỸ THUẬT 2: Column Pruning (Cắt tỉa cột)
# ----------------------------------------------------------
print("\n[KT2] Column Pruning – Giảm băng thông mạng")
print("-" * 55)

size_all  = df.memory_usage(deep=True).sum() / 1024 / 1024
size_trim = df[["gender", "math"]].memory_usage(deep=True).sum() / 1024 / 1024

print(f"  Bộ nhớ cho toàn bộ 9 cột  : {size_all:.1f} MB")
print(f"  Bộ nhớ chỉ cho 2 cột cần  : {size_trim:.1f} MB")
print(f"  Tiết kiệm: {(1 - size_trim/size_all)*100:.0f}% dữ liệu truyền qua mạng")

# ----------------------------------------------------------
# KỸ THUẬT 3: Replicated JOIN (Map-side join)
# ----------------------------------------------------------
print("\n[KT3] Replicated JOIN – Bảng tra cứu nhỏ vào RAM")
print("-" * 55)

# Bảng học bổng (lookup table)
schol = pd.read_csv(f"{DATA}/scholarships.csv")
print(f"  Bảng scholarships.csv: {len(schol)} dòng (rất nhỏ)")

# Lấy nhóm học sinh xuất sắc
excellent = df[df["math"] >= 90][["student_id", "race", "math"]]

t2 = time.perf_counter()
# Thông thường: JOIN bảng lớn (df) với bảng nhỏ
normal_join = df.merge(schol, on="race")
t3 = time.perf_counter()

t4 = time.perf_counter()
# Replicated mô phỏng: Chỉ JOIN những gì cần thiết sau khi đã lọc
repl_join = excellent.merge(schol, on="race")
t5 = time.perf_counter()

print(f"  JOIN thông thường (tất cả): {(t3-t2)*1000:.1f} ms -> {len(normal_join):,} dòng")
print(f"  JOIN Replicated (đã lọc)  : {(t5-t4)*1000:.1f} ms -> {len(repl_join):,} dòng")
print(f"  Tốc độ cải thiện: {(t3-t2)/(t5-t4):.1f}x")

print("\nDone! Optimization giúp tiết kiệm tài nguyên Cluster cực lớn.")
