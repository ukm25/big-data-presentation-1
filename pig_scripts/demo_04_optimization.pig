/* 
   DEMO 04: PIG OPTIMIZATION (HIGH PERFORMANCE)
   -----------------------------------------------------
   Scenario: Tối ưu hoá luồng dữ liệu lớn 
   bằng cách giảm tải mạng và tăng tốc độ JOIN.
*/

-- 1. LOAD dữ liệu lớn (Big Table)
large_data = LOAD '/data/students_all.csv' USING PigStorage(',') 
    AS (id:int, gender:chararray, race:chararray, parent_edu:chararray, lunch:chararray, test_prep:chararray, math:int, reading:int, writing:int);

-- 2. LOAD dữ liệu nhỏ (Small Lookup Table)
small_schol = LOAD '/data/scholarships.csv' USING PigStorage(',') 
    AS (race:chararray, schol_name:chararray, amount:int);

-- [TỐI ƯU 1] FILTER EARLY: Loại bỏ những dòng không đạt ngay lập tức
-- Giảm số lượng bản ghi cần xử lý trong các bước JOIN tiếp theo.
filtered = FILTER large_data BY math >= 50;

-- [TỐI ƯU 2] COLUMN PRUNING: Chỉ giữ lại các cột cần thiết (ID, Race, Math)
-- Giảm kích thước bản ghi trên ổ đĩa và mạng (IO/Bandwidth).
pruned = FOREACH filtered GENERATE id, race, math;

-- [TỐI ƯU 3] REPLICATED JOIN: Map-side Join
-- Pig sẽ nạp bảng nhỏ (small_schol) vào RAM của từng Task, 
-- giúp JOIN diễn ra ngay trong bộ nhớ, không cần Shuffle qua mạng.
optimized_join = JOIN pruned BY race, small_schol BY race USING 'replicated';

-- 3. Xuất kết quả
DUMP optimized_join;
