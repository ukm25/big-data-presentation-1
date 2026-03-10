/* 
   DEMO 04: PIG OPTIMIZATION (HIGH PERFORMANCE)
   -----------------------------------------------------
   Scenario: Tối ưu hoá luồng dữ liệu lớn 
   bằng cách giảm tải mạng và tăng tốc độ JOIN.
*/

-- 1. LOAD dữ liệu lớn (Big Table)
-- Lưu ý: StudentsPerformance.csv có dấu ngoặc kép, scholarships.csv thì không.
large_data = LOAD '/data/StudentsPerformance.csv' USING PigStorage(',') 
    AS (gender:chararray, race:chararray, parent_edu:chararray, lunch:chararray, test_prep:chararray, math:chararray, reading:chararray, writing:chararray);

-- 2. LOAD dữ liệu nhỏ (Small Lookup Table)
small_schol = LOAD '/data/scholarships.csv' USING PigStorage(',') 
    AS (race:chararray, schol_name:chararray, amount:int);

-- [TỐI ƯU 1 & 2] FILTER sớm và gọt dũa dữ liệu (Xóa ngoặc kép)
-- Ta phải xóa ngoặc kép ở cột 'race' thì mới JOIN khớp được với bảng học bổng.
pruned = FOREACH (FILTER large_data BY gender != '"gender"') GENERATE 
    REPLACE(race, '"', '') AS race, 
    (int)REPLACE(math, '"', '') AS math;

-- Lọc những người có điểm >= 50
filtered = FILTER pruned BY math >= 50;

-- [TỐI ƯU 3] REPLICATED JOIN: Map-side Join
-- Dùng 'replicated' vì bảng small_schol rất nhỏ, nạp vào RAM chạy nhanh hơn.
optimized_join = JOIN filtered BY race, small_schol BY race USING 'replicated';

-- 3. Xuất kết quả
DUMP optimized_join;
