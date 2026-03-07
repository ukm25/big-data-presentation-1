/* 
   DEMO 05: FULL BIG DATA PIPELINE (END-TO-END)
   -----------------------------------------------------
   Scenario: Trình diễn chuỗi xử lý dữ liệu hoàn chỉnh 
   từ nạp dữ liệu thô đến khi ra kết quả Insight cuối cùng.
*/

-- 1. Đăng ký UDF
REGISTER 'student_udfs.py' USING jython AS my_udfs;

-- 2. LOAD & CLEAN: Nạp và lọc dữ liệu lỗi
raw = LOAD '/data/students_all.csv' USING PigStorage(',') 
    AS (id:int, gender:chararray, race:chararray, parent_edu:chararray, lunch:chararray, test_prep:chararray, math:int, reading:int, writing:int);

clean = FILTER raw BY id IS NOT NULL;

-- 3. JOIN: Kết hợp với thông tin học bổng (Enrichment)
schol = LOAD '/data/scholarships.csv' USING PigStorage(',') 
    AS (race:chararray, schol_name:chararray, amount:int);

enriched = JOIN clean BY race, schol BY race;

-- 4. UDF: Áp dụng logic nghiệp vụ xếp loại
scored = FOREACH enriched GENERATE 
    gender, 
    math, 
    my_udfs.get_grade(math) AS grade, 
    schol_name;

-- 5. AGGREGATE: Nhóm theo Giới tính và Xếp loại để đếm số lượng
grouped = GROUP scored BY (gender, grade);
insights = FOREACH grouped GENERATE 
    group AS gender_grade, 
    COUNT(scored) AS student_count;

-- 6. OUTPUT: Kết quả cuối cùng
DUMP insights;
