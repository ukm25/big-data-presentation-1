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
stu_data = LOAD '/data/StudentsPerformance.csv' USING PigStorage(',') 
    AS (id:int, gender:chararray, race:chararray, parent_edu:chararray, lunch:chararray, test_prep:chararray, math:int, reading:int, writing:int);

-- 3. Triệu hồi hàm UDF trong FOREACH
graded_data = FOREACH stu_data {
    -- Tính điểm trung bình bằng UDF
    avg = my_udfs.calc_avg(math, reading, writing);
    
    -- Xếp loại bằng UDF
    rank = my_udfs.get_grade(math);
    
    GENERATE id, math, avg AS average, rank AS grade;
};

-- 4. Xuất kết quả
DUMP graded_data;
