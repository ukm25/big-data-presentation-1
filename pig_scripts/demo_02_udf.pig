/* 
   DEMO 02: EXTENDING PIG (PYTHON UDF)
   -----------------------------------------------------
   Scenario: Sử dụng hàm Python tự định nghĩa để xếp loại
   học sinh dựa trên điểm số (Trung Bình, Khá, Giỏi).
*/

-- 1. Đăng ký hàm Python (UDF)
-- Pig sẽ dùng Jython để thực thi các hàm trong file .py
REGISTER 'student_udfs.py' USING jython AS my_udfs;

-- 2. LOAD dữ liệu
-- File StudentsPerformance.csv có dấu ngoặc kép (e.g., "female", "72")
-- Chúng ta load tất cả là chararray để xử lý chuỗi trước.
stu_raw = LOAD '/data/StudentsPerformance.csv' USING PigStorage(',') 
    AS (gender:chararray, race:chararray, parent_edu:chararray, lunch:chararray, test_prep:chararray, math:chararray, reading:chararray, writing:chararray);

-- Lọc bỏ dòng tiêu đề và làm sạch dấu ngoặc kép
stu_data_clean = FILTER stu_raw BY gender != '"gender"' AND gender IS NOT NULL; 

stu_data_formatted = FOREACH stu_data_clean GENERATE 
    REPLACE(gender, '"', '') AS gender,
    (int)REPLACE(math, '"', '') AS math,
    (int)REPLACE(reading, '"', '') AS reading,
    (int)REPLACE(writing, '"', '') AS writing;

-- 3. Triệu hồi hàm UDF trong FOREACH
graded_data = FOREACH stu_data_formatted {
    avg = my_udfs.calc_avg(math, reading, writing);
    
    rank = my_udfs.get_grade(math);
    
    GENERATE gender, math, avg AS average, rank AS grade;
};

-- 4. Xuất kết quả
DUMP graded_data;
