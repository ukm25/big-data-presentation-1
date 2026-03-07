/* 
   DEMO 01: MULTI-DATASET OPERATIONS (UNION, JOIN, SPLIT)
   -----------------------------------------------------
   Scenario: Gộp dữ liệu từ 2 nguồn (Program A & B) và 
   kết hợp với bảng Học bổng để phân tích.
*/

-- 1. LOAD: Nạp dữ liệu từ 3 nguồn khác nhau
prog_a = LOAD '/data/students_program_A.csv' USING PigStorage(',') 
    AS (id:int, gender:chararray, race:chararray, parent_edu:chararray, lunch:chararray, test_prep:chararray, math:int, reading:int, writing:int);

prog_b = LOAD '/data/students_program_B.csv' USING PigStorage(',') 
    AS (id:int, gender:chararray, race:chararray, parent_edu:chararray, lunch:chararray, test_prep:chararray, math:int, reading:int, writing:int);

schol = LOAD '/data/scholarships.csv' USING PigStorage(',') 
    AS (race:chararray, schol_name:chararray, amount:int);

-- 2. UNION: Đồng nhất và gộp 2 danh sách học sinh
all_students = UNION prog_a, prog_b;

-- 3. JOIN: Kết hợp thông tin học bổng dựa trên mã Race/Ethnicity
enriched = JOIN all_students BY race, schol BY race;

-- 4. SPLIT: Tách dữ liệu thành 2 luồng xử lý riêng biệt
SPLIT enriched INTO 
    high_achievers IF math >= 80,
    others IF math < 80;

-- 5. TRÌNH DIỄN KẾT QUẢ
DESCRIBE all_students;
DUMP high_achievers;