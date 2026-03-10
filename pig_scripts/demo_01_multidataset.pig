/* 
   DEMO 01: MULTI-DATASET OPERATIONS (UNION, COGROUP, CROSS, JOIN, SPLIT)
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

-- 3. COGROUP: Nhóm dữ liệu từ nhiều nguồn theo key (Race)
-- Kết quả sẽ có dạng: {group: race, all_students: {bag_of_students}, schol: {bag_of_scholarships}}
grouped_data = COGROUP all_students BY race, schol BY race;

-- 4. CROSS: Tích Descartes (Thường dùng cho các bảng rất nhỏ)
-- Tạo ra mọi tổ hợp có thể giữa 2 quan hệ (Dùng cho ma trận hoặc mẫu thử)
small_prog_a = LIMIT prog_a 2;
small_schol = LIMIT schol 2;
crossed_data = CROSS small_prog_a, small_schol;

-- 5. JOIN: Kết hợp thông tin học bổng dựa trên mã Race/Ethnicity
enriched = JOIN all_students BY race, schol BY race;

-- 6. SPLIT: Tách dữ liệu thành 2 luồng xử lý riêng biệt
SPLIT enriched INTO 
    high_achievers IF math >= 80,
    others IF math < 80;

-- 7. TRÌNH DIỄN KẾT QUẢ
DESCRIBE grouped_data;
DUMP high_achievers;