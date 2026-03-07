/* 
   DEMO 03: PIG TROUBLESHOOTING (DEBUGGING)
   -----------------------------------------------------
   Scenario: Sử dụng các công cụ nội tại của Pig để 
   kiểm tra schema, cấu trúc thực thi và mẫu dữ liệu.
*/

-- 1. LOAD dữ liệu nguyên bản (Bao gồm cả dòng header)
-- [LOI 1]: Header Collision - Dòng đầu tiên (tiêu đề) sẽ bị tính là một bản ghi bị lỗi dữ liệu
-- [LOI 2]: Type Casting Disaster - Khai báo sai kiểu dữ liệu của cột 'race' thành số nguyên (int)
raw_data = LOAD '/data/StudentsPerformance.csv' USING PigStorage(',') 
    AS (id:int, gender:chararray, race:int, parent_edu:chararray, lunch:chararray, test_prep:chararray, math:int, reading:int, writing:int);

-- [DEBUG 1] DESCRIBE: Kiểm tra kiểu dữ liệu
-- Lúc này Pig sẽ báo race là int
DESCRIBE raw_data;

-- [DEBUG 2] DUMP limit để thấy hậu quả của Type Mismatch
-- Toàn bộ cột race sẽ biến thành rỗng (null) vì chữ không thể ép sang số
bad_type_sample = LIMIT raw_data 5;
DUMP bad_type_sample;

-- 2. Xử lý Troubleshooting: Boundary Error
-- [LOI 3]: Lọc mất học sinh có điểm 0 do dùng sai dấu >
filtered_wrong = FILTER raw_data BY math > 0;

-- GROUP và đếm thử dữ liệu để xem tổng số học sinh còn lại
grouped_wrong = GROUP filtered_wrong ALL;
count_wrong = FOREACH grouped_wrong GENERATE COUNT(filtered_wrong);

DUMP count_wrong;
