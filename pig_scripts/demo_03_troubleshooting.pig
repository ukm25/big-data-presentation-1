/* 
   DEMO 03: PIG TROUBLESHOOTING (DEBUGGING)
   -----------------------------------------------------
   Scenario: Sử dụng các công cụ nội tại của Pig để 
   kiểm tra schema, cấu trúc thực thi và mẫu dữ liệu.
*/

-- 1. LOAD dữ liệu thô
raw_data = LOAD '/data/StudentsPerformance.csv' USING PigStorage(',') 
    AS (id:int, gender:chararray, race:chararray, parent_edu:chararray, lunch:chararray, test_prep:chararray, math:int, reading:int, writing:int);

-- [DEBUG 1] DESCRIBE: Kiểm tra kiểu dữ liệu của các cột (Schema)
-- Rất hữu ích khi bạn không chắc cột Math là int hay chararray.
DESCRIBE raw_data;

-- 2. Xử lý Troubleshooting: Lọc NULL và chuyển đổi giới tính về chữ HOA
clean_data = FILTER raw_data BY math IS NOT NULL;
processed = FOREACH clean_data GENERATE id, UPPER(gender) AS gender_upper, math;

-- [DEBUG 2] EXPLAIN: Xem kế hoạch thực thi (Logical/Physical/MapReduce Plan)
-- Giúp hiểu cách Pig biến đổi code thành các MapReduce job.
EXPLAIN processed;

-- [DEBUG 3] ILLUSTRATE: Mô phỏng chạy thử trên một tập dữ liệu nhỏ
-- Công cụ mạnh mẽ nhất để thấy dữ liệu biến đổi qua từng dòng code.
ILLUSTRATE processed;
