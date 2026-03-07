# student_udfs.py
# Pig Python UDFs

@outputSchema("grade:chararray")
def get_grade(math):
    if math is None:
        return "N/A"
    try:
        math = int(math)
        if math >= 80:
            return "Xuat Sac"
        if math >= 60:
            return "Kha"
        return "Trung Binh"
    except:
        return "Error"

@outputSchema("avg_score:double")
def calc_avg(math, reading, writing):
    try:
        m = float(math) if math is not None else 0.0
        r = float(reading) if reading is not None else 0.0
        w = float(writing) if writing is not None else 0.0
        return (m + r + w) / 3.0
    except:
        return 0.0
