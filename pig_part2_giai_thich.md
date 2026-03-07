Apache Pig Part 2  Giải thích Code với Dataset Thực Tế

> Dataset: [Students Performance in Exams](https://www.kaggle.com/datasets/spscientist/students-performance-in-exams)  
> Cột dữ liệu: `gender | race_ethnicity | parental_education | lunch | test_prep_course | math_score | reading_score | writing_score`

---

Cấu trúc Files

```
PresentationFirst/
 pig_part2_students_demo.pig    Script Pig Latin chính (chạy trên Hadoop)
 student_udfs.py                Hàm tự viết (UDF) bằng Python
 pig_part2_giai_thich.md       File này  giải thích từng phần
```

---

PHẦN 1: Multi-Dataset Operations

Vấn đề cần giải quyết
Trong thực tế, dữ liệu không bao giờ nằm gọn trong 1 file duy nhất. Ví dụ với bài toán học sinh:
- Kết quả thi học kỳ 1  `students_sem1.csv`
- Kết quả thi học kỳ 2  `students_sem2.csv`
- Bảng học bổng  `scholarships.csv`

Câu hỏi đặt ra: Làm sao để Pig đọc, kết hợp, và phân tách nhiều tập dữ liệu này cùng lúc?

Multi-Dataset Operations giải quyết như thế nào

| Lệnh | Vấn đề giải quyết | Ví dụ trong script |
|------|-------------------|--------------------|
| `UNION` | Gộp 2 kỳ thi thành 1 tập duy nhất để phân tích chung | Gộp `students` + `students_sem2` |
| `SPLIT` | Chia học sinh thành các nhóm mà không cần đọc file nhiều lần | Excellent 80 / Good 60-79 / Needs Help <60 |
| `JOIN` | Ghép thông tin học bổng vào hồ sơ học sinh theo `race_ethnicity` | Tìm học sinh giỏi có học bổng |
| `LEFT OUTER JOIN` | Giữ toàn bộ học sinh giỏi, kể cả chưa có học bổng | Ai chưa được học bổng? |
| `COGROUP` | Nhóm học sinh + học bổng theo cùng key để so sánh sâu | Phân tích theo từng nhóm giới tính |

```pig
-- Gộp 2 học kỳ (UNION)
all_students = UNION students, students_sem2;

-- Chia 3 nhóm học lực (SPLIT  chỉ đọc file 1 lần!)
SPLIT students INTO
    excellent_math IF math_score >= 80,
    good_math      IF math_score >= 60 AND math_score < 80,
    needs_help     IF math_score < 60;

-- Ghép với học bổng (LEFT OUTER JOIN  giữ cả học sinh chưa có học bổng)
all_excellent_with_schol = JOIN excellent_math BY race_ethnicity LEFT OUTER,
                                scholarships   BY race_ethnicity;
```

Tương đương trong các mảng khác

| Mảng | Tương đương | Ghi chú |
|------|------------|--------|
| SQL / Database | `JOIN`, `UNION ALL`, `CASE WHEN` để phân nhóm | Cú pháp tương tự, nhưng SQL chạy trên 1 máy |
| PySpark | `df.join()`, `df.union()`, `df.filter()` theo điều kiện | API DataFrame thay vì Pig Latin |
| Pandas | `pd.merge()`, `pd.concat()`, `df[df.score >= 80]` | Chỉ dùng được cho data nhỏ vừa RAM |
| Excel | `VLOOKUP`, merge sheet, filter theo điều kiện | Giới hạn ~1 triệu dòng |

Kết quả thực tế từ dataset:
```
(female, avg_math=63.6, avg_reading=72.6)  Nữ giỏi Đọc/Viết hơn
(male,   avg_math=68.7, avg_reading=65.5)  Nam giỏi Toán hơn

Phân bố nhóm học lực:
  Excellent (>=80):  432 học sinh (43.2%)
  Good (60-79):      387 học sinh (38.7%)
  Needs Help (<60):  181 học sinh (18.1%)
```

---

PHẦN 2: Extending Pig (UDF)

Vấn đề cần giải quyết
Pig Latin chỉ cung cấp các hàm cơ bản như `AVG`, `SUM`, `COUNT`, `UPPER`... Nhưng với bài toán học sinh, ta cần logic riêng mà Pig không có sẵn:
- Tính điểm trung bình 3 môn rồi xếp loại học lực?
- Phát hiện học sinh thiên về Toán hay Văn?
- Học sinh nào nên đi ôn thi thêm?

Không có cách nào viết logic này thuần trong Pig Latin.

UDF (User-Defined Function) giải quyết như thế nào

Cho phép viết hàm bằng Python (hoặc Java), rồi "dạy" Pig sử dụng hàm đó:

| UDF | Logic tự định nghĩa |
|-----|---------------------|
| `calc_avg(math, reading, writing)` | `(math + reading + writing) / 3.0`  trả về `double` |
| `get_grade(avg)` | 90Xuất sắc / 80Giỏi / 65Khá / 50TB / <50Yếu |
| `find_strength(math, reading, writing)` | So sánh Toán vs trung bình Văn, biên độ 10 điểm |
| `needs_test_prep(avg, prep_status)` | `avg < 65 AND prep == 'none'`  True (cần ôn!) |

Vòng đời của UDF trong Pig:
```pig
-- Bước 1: Đăng ký file Python
REGISTER '/udfs/student_udfs.py' USING jython AS student_lib;

-- Bước 2: Gọi hàm trong FOREACH như hàm thường
students_graded = FOREACH students GENERATE
    gender,
    student_lib.calc_avg(math_score, reading_score, writing_score) AS avg_score,
    student_lib.get_grade(
        student_lib.calc_avg(math_score, reading_score, writing_score)
    ) AS grade,
    student_lib.find_strength(math_score, reading_score, writing_score) AS strength;
```

Tương đương trong các mảng khác

| Mảng | Tương đương | Ghi chú |
|------|------------|--------|
| SQL / Database | `CREATE FUNCTION` (Stored Function) | Viết bằng PL/SQL, T-SQL... |
| PySpark | `spark.udf.register()` + `@udf` decorator | Đăng ký hàm Python vào Spark context |
| Pandas | `df.apply(lambda row: get_grade(row))` | Gọi hàm Python thuần trên từng dòng |
| MapReduce (Java) | Viết custom `Mapper` / `Reducer` class | Cồng kềnh hơn nhiều so với UDF Pig |

Kết quả sau UDF:
```
(female, 72.67, Kha,      Balanced)
(female, 82.33, Gioi,     Strong in Reading/Writing)
(male,   92.67, Xuat Sac, Strong in Math)
```

---

PHẦN 3: Pig Troubleshooting

Vấn đề cần giải quyết
Khi chạy Pig với dataset thực tế (CSV từ Kaggle), có nhiều lỗi không hiển thị rõ ràng hoặc không báo lỗi nhưng cho kết quả sai:
- File CSV có dòng header  Pig đọc nhầm thành dữ liệu
- Cột điểm khai báo `int` nhưng dữ liệu có thể là `null`  kết quả trả về sai mà không báo lỗi
- Không biết kiểu dữ liệu thực tế Pig đang hiểu  sai về sau

Troubleshooting giải quyết như thế nào

Cung cấp bộ công cụ chẩn đoán tích hợp sẵn trong Pig để phát hiện và sửa lỗi trước khi submit job lên cluster:

Tương đương trong các mảng khác

| Mảng | Công cụ debug tương đương |
|------|---------------------------|
| SQL / Database | `EXPLAIN PLAN`, kiểm tra kiểu cột bằng `DESCRIBE TABLE` |
| PySpark | `df.printSchema()`, `df.show(5)`, `df.explain(True)` |
| Pandas | `df.dtypes`, `df.head()`, `df.isnull().sum()` |
| Python thuần | `print()`, `assert`, `try/except`, `logging` |

3 lỗi phổ biến nhất và cách sửa:

| Lỗi | Triệu chứng | Cách sửa |
|-----|-------------|----------|
| Không bỏ header | Dòng "gender,race_ethnicity,..." xuất hiện trong kết quả | `FILTER raw BY gender != 'gender'` |
| Sai kiểu dữ liệu | `race_ethnicity:int`  toàn bộ cột ra null | Khai báo đúng: `race_ethnicity:chararray` |
| So sánh với null | `FILTER BY math_score > 70` bỏ sót học sinh thiếu điểm | Thêm `math_score IS NOT NULL AND` |

Bộ công cụ debug khi bị lỗi:

```pig
-- 1. DESCRIBE: Check ngay sau LOAD xem Pig hiểu đúng kiểu chưa
DESCRIBE students;
-- students: {gender: chararray, math_score: int, ...}

-- 2. LIMIT + DUMP: Xem 5 dòng mẫu (KHÔNG dùng DUMP trên triệu dòng!)
top5 = LIMIT students 5;
DUMP top5;

-- 3. EXPLAIN: Xem Pig sẽ tạo bao nhiêu MapReduce job trước khi submit
EXPLAIN gender_avg;
-- Map  Combine  Reduce

-- 4. ILLUSTRATE: Chạy thử từng bước với dữ liệu mẫu nhỏ
ILLUSTRATE students_graded;
```

---

PHẦN 4: Pig Optimization

Vấn đề cần giải quyết
Dataset 1000 dòng chạy nhanh, nhưng khi scale lên triệu dòng trên Hadoop cluster:
- JOIN giữa 2 bảng lớn  tạo ra shuffle khổng lồ qua mạng
- FOREACH giữ 8 cột khi chỉ cần 2  truyền data thừa suốt pipeline
- Số Reducer mặc định quá ít  bottleneck ở Reduce phase

Pig mặc định không tự tối ưu nhiều  cần lập trình viên chủ động can thiệp.

Optimization giải quyết như thế nào

Quy tắc vàng: FILTER  FOREACH  GROUP  JOIN

| # | Kỹ thuật | Giải quyết vấn đề gì | Khi nào dùng |
|---|----------|---------------------|--------------|
| 1 | `FILTER` sớm | Giảm số dòng đi qua pipeline ngay từ đầu | Luôn luôn |
| 2 | `FOREACH` sớm (bỏ cột thừa) | Giảm băng thông giữa Map-Reduce | Khi có >3 cột không dùng |
| 3 | `USING 'replicated'` | Loại bỏ 1 MapReduce job cho JOIN | Khi 1 bảng JOIN < 100MB |
| 4 | `PARALLEL N` | Tăng số Reducer để xử lý song song | Khi dataset > vài GB |
| 5 | Bật nén trung gian | Giảm đọc/ghi đĩa đến 60-70% | Khi cluster nhiều I/O |

Tương đương trong các mảng khác

| Mảng | Kỹ thuật tối ưu tương đương |
|------|-----------------------------|
| SQL / Database | Index, Query Optimizer, `SELECT` chỉ lấy cột cần, `WHERE` trước `JOIN` |
| PySpark | Adaptive Query Execution (AQE), `.select()` sớm, Broadcast JOIN |
| Pandas | Dùng `dtype` phù hợp, tránh `.apply()` dùng vectorized ops |
| Hadoop MapReduce | Combiner để gộp kết quả trước Reduce, Compression codec |

```pig
--  CHẬM: Mang 8 cột qua toàn pipeline, lọc muộn
all = FOREACH students GENERATE *;
fil = FILTER all BY math_score >= 80;

--  NHANH: Lọc trước  Cắt cột  Mới xử lý
fil     = FILTER students BY math_score >= 80;         -- Giảm dòng ngay
trimmed = FOREACH fil GENERATE gender, math_score;     -- Chỉ 2 cột cần
grouped = GROUP trimmed BY gender;
result  = FOREACH grouped GENERATE group, AVG(trimmed.math_score);

--  Replicated JOIN: scholarships chỉ ~50 dòng  vào RAM, không cần shuffle
fast_join = JOIN excellent_math BY race_ethnicity,
                 scholarships   BY race_ethnicity USING 'replicated';
```

Kết quả phân tích sau khi tối ưu (ôn thi có giúp ích không?):
```
(completed, avg_math=69.7, avg_reading=73.9, total=358)  Đã ôn: +5-7 điểm
(none,      avg_math=64.1, avg_reading=66.5, total=642)  Chưa ôn: thấp hơn
```

---

PHẦN 5: Demo Tổng hợp

Vấn đề cần giải quyết
Các phần 1-4 giải thích từng kỹ thuật riêng lẻ. Nhưng trong thực tế, một pipeline phân tích dữ liệu hoàn chỉnh phải kết hợp tất cả lại:

> *"Phân tích toàn bộ kết quả thi của học sinh: xếp loại học lực, phát hiện năng khiếu, tìm hiểu ảnh hưởng của ôn thi và suất ăn đến điểm số."*

Làm sao để viết 1 script duy nhất, chạy từ đầu đến cuối mà không bị lỗi?

Demo giải quyết như thế nào

Viết 1 script Pig Latin duy nhất kết hợp tuần tự tất cả kỹ thuật từ Phần 1 đến Phần 4, đọc vào từ HDFS và ghi kết quả ra nhiều output folder.

Tương đương trong các mảng khác

| Mảng | Pipeline tương đương |
|------|---------------------|
| SQL / Database | Stored Procedure hoặc chuỗi query chạy tuần tự |
| PySpark | PySpark script với các bước `read  transform  write` |
| Airflow / dbt | DAG (Directed Acyclic Graph)  pipeline tự động hóa với schedule |
| Excel | Chuỗi sheet: raw  cleaned  pivot table  chart |

Kết hợp tất cả kỹ thuật vào 1 pipeline end-to-end:

```
students.csv (1000 dòng, 8 cột)
     [LOAD + FILTER header]           Troubleshooting
students (999 dòng)
     [FILTER null + FOREACH 5 cột]   Optimization (lọc + cắt cột sớm)
clean (999 dòng, 5 cột)
     [UDF calc_avg + get_grade]       Extending Pig
with_avg (+avg_score, +grade, +strength)
     [SPLIT 3 nhóm]                   Multi-Dataset
top(432) / mid(387) / low(181)
     [GROUP + AVG + COUNT]
top_stats, lunch_impact, prep_stats
     [STORE]
/output/top_students_by_gender/
/output/lunch_impact_on_scores/
/output/low_performers_by_prep/
```

Kết quả đầu ra:
```
-- top_students_by_gender:
(female, count=220, avg=87.3)
(male,   count=212, avg=89.1)

-- low_performers_by_prep (nhóm <60 điểm):
(none,      count=142)    78% không ôn thi
(completed, count= 39)    Chỉ 22% đã ôn

-- lunch_impact:
(standard,     avg_math=70.0, total=645)
(free/reduced, avg_math=58.9, total=355)  Thấp hơn ~11 điểm Toán!
```

Cách chạy Demo:
```bash
Upload lên HDFS
hadoop fs -put StudentsPerformance.csv /data/students.csv
hadoop fs -put student_udfs.py /udfs/student_udfs.py

Chạy script
pig -f pig_part2_students_demo.pig

Xem kết quả
hadoop fs -cat /output/top_students_by_gender/part-r-00000
```

---

Checklist 5 Yêu cầu

| Yêu cầu | Script | Operations |
|---------|--------|-----------|
|  Multi-Dataset Operations | Part 1 | `UNION`, `SPLIT`, `JOIN`, `LEFT OUTER JOIN`, `COGROUP` |
|  Extending Pig | Part 2 + `student_udfs.py` | `REGISTER` jython, 4 Python UDFs |
|  Pig Troubleshooting | Part 3 | Header filter, NULL check, `DESCRIBE`, `EXPLAIN`, `ILLUSTRATE` |
|  Pig Optimization | Part 4 | Early FILTER/FOREACH, Replicated JOIN, `PARALLEL`, compression |
|  Demo | Part 5 | Full pipeline: Load  Clean  SPLIT  UDF  GROUP  STORE |
