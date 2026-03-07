# Big Data Presentation Dashboard

Hệ thống Dashboard trực quan hóa các bài Lab về Apache Pig và Big Data Processing. 

## Cấu trúc dự án
- `/data`: Chứa các file dữ liệu CSV mẫu.
- `/demo_xx_...py`: Các Python script minh họa logic xử lý dữ liệu (UNION, JOIN, UDF, Optimization).
- `/student-ui`: Ứng dụng React (Vite) giao diện Dashboard Ultra-Premium.

## Hướng dẫn chạy Local

### 1. Chạy mã Python
Đảm bảo bạn đã cài đặt `pandas`:
```bash
pip install pandas
python3 demo_01_multidataset.py
```

### 2. Chạy Dashboard UI
```bash
cd student-ui
npm install
npm run dev
```

## Triển khai lên Render
Dự án được cấu hình để triển khai phần Dashboard (React) lên Render:
- **Service Type**: Static Site
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `student-ui/dist` (Nếu build từ root) hoặc cấu hình **Root Directory** là `student-ui`.
