import { useEffect, useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import {
  Database, FlaskConical, AlertTriangle, Zap, PlayCircle,
  Search, ChevronLeft, ChevronRight,
  Layers, Terminal, Users, Activity, Target
} from 'lucide-react'

// ─── Types & Constants ──────────────────────────────────
interface DataRow {
  [key: string]: string | number | null
}

const DATA_SOURCES = [
  { id: 'all', name: '1. Full Dataset', file: 'StudentsPerformance.json', color: 'bg-slate-800', icon: Database },
  { id: 'demographics', name: '2. Demographics', file: 'demographics.json', color: 'bg-blue-600', icon: Database },
  { id: 'scores', name: '3. Scores', file: 'scores.json', color: 'bg-purple-600', icon: Database },
  { id: 'program_a', name: '4. Program A (Done)', file: 'students_program_A.json', color: 'bg-emerald-600', icon: Database },
  { id: 'program_b', name: '5. Program B (None)', file: 'students_program_B.json', color: 'bg-orange-600', icon: Database },
  { id: 'scholarships', name: '6. Scholarships', file: 'scholarships.json', color: 'bg-rose-600', icon: Database },
]

const DEMOS = [
  { id: 'demo1', name: '01. Multi-Dataset Ops', icon: Layers, color: 'text-blue-500' },
  { id: 'demo2', name: '02. Extending (UDF)', icon: FlaskConical, color: 'text-purple-500' },
  { id: 'demo3', name: '03. Troubleshooting', icon: AlertTriangle, color: 'text-amber-500' },
  { id: 'demo4', name: '04. Optimization', icon: Zap, color: 'text-emerald-500' },
  { id: 'demo5', name: '05. Full Pipeline', icon: PlayCircle, color: 'text-rose-500' },
  { id: 'overview', name: 'Executive Overview', icon: Activity, color: 'text-indigo-600' },
]

const PAGE_SIZES = [10, 20, 50]


// ─── Helper Components ────────────────────────────────────

function Card({ title, subtitle, children, icon: Icon, color, className }: any) {
  return (
    <div className={`bg-white rounded-[32px] border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all duration-500 h-full flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-2">{title}</h3>
          {subtitle && <p className="text-sm font-black text-slate-900 tracking-tight">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-2xl bg-slate-50 ${color}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function MiniSnippet({ title, code, color = "indigo" }: { title: string, code: string, color?: string }) {
  const colorMap: any = {
    indigo: "from-indigo-500/10 to-transparent border-indigo-200 text-indigo-700",
    emerald: "from-emerald-500/10 to-transparent border-emerald-200 text-emerald-700",
    amber: "from-amber-500/10 to-transparent border-amber-200 text-amber-700",
    rose: "from-rose-500/10 to-transparent border-rose-200 text-rose-700",
  }

  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${colorMap[color]} p-5 shadow-sm group hover:scale-[1.02] transition-transform cursor-default h-full flex flex-col`}>
      <div className="flex items-center gap-2 mb-3">
        <Target size={14} className="opacity-50" />
        <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{title}</span>
      </div>
      <pre className="text-[11px] font-mono font-bold leading-relaxed overflow-x-auto whitespace-pre">
        {code}
      </pre>
    </div>
  )
}

function CodeTerminal({ code, output, title = "Source Code" }: { code: string, output?: string, title?: string }) {
  const [tab, setTab] = useState<'code' | 'output'>(output ? 'output' : 'code')

  return (
    <div className="bg-[#0f172a] rounded-[32px] border border-slate-800 shadow-2xl flex flex-col h-full min-h-[450px]">
      <div className="px-8 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80 shadow-lg shadow-rose-500/20" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80 shadow-lg shadow-amber-500/20" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80 shadow-lg shadow-emerald-500/20" />
          </div>
          <div className="h-4 w-px bg-slate-800 mx-2" />
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{title}</span>
        </div>
        <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
          <button
            onClick={() => setTab('code')}
            className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${tab === 'code' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200'}`}
          >CODE</button>
          {output && (
            <button
              onClick={() => setTab('output')}
              className={`px-4 py-1.5 text-[10px] font-black rounded-lg transition-all ${tab === 'output' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-slate-200'}`}
            >OUTPUT</button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-8 font-mono text-[12px] leading-relaxed custom-scrollbar bg-grid-slate-900/[0.04]">
        {tab === 'code' ? (
          <pre className="text-indigo-100 whitespace-pre">
            {code.split('\n').map((line, i) => (
              <div key={i} className="flex gap-8 group">
                <span className="text-slate-700 select-none w-4 text-right group-hover:text-slate-400 transition-colors">{i + 1}</span>
                <span className="opacity-90">{line}</span>
              </div>
            ))}
          </pre>
        ) : (
          <pre className="text-emerald-400">
            <div className="flex gap-3 items-center text-slate-500 mb-6 pb-2 border-b border-slate-800 uppercase tracking-[0.2em] font-black text-[9px]">
              <Terminal size={14} className="text-indigo-500" />
              <span>Terminal Execution Stream v1.0.4</span>
            </div>
            {output}
          </pre>
        )}
      </div>
    </div>
  )
}

function Badge({ children, type }: { children: any, type?: 'gender' | 'test' | 'other' }) {
  let styles = "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest "
  if (type === 'gender') {
    styles += children === 'female' ? "bg-pink-100 text-pink-700 ring-1 ring-pink-200" : "bg-indigo-100 text-indigo-700 ring-1 ring-indigo-200"
  } else if (type === 'test') {
    styles += children === 'completed' ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200" : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
  } else {
    styles += "bg-gray-100 text-gray-600 border border-gray-200"
  }
  return <span className={styles}>{children}</span>
}

// ─── Demo Sub-Views ──────────────────────────────────────

const Demo01 = () => {
  const steps = [
    {
      title: "BƯỚC 1: LOAD (Nạp dữ liệu)",
      desc: "Nạp dữ liệu từ 3 nguồn: Program A, Program B và Scholarships. Định nghĩa Schema chi tiết.",
      code: "prog_a = LOAD 'data/students_program_A.csv' USING PigStorage(',') \n  AS (id:int, gender:chararray, race:chararray, education:chararray, \n      lunch:chararray, prep:chararray, math:int, read:int, write:int);\nprog_b = LOAD 'data/students_program_B.csv' ...;\nschol  = LOAD 'data/scholarships.csv' ...;",
      multiTables: [
        {
          name: "📁 Source: students_program_A.csv (Top 4 records)",
          headers: ["ID", "Gender", "Race", "Education", "Math", "Reading", "Writing"],
          data: [
            ["615", "female", "group A", "associate's", "82", "93", "93"],
            ["572", "male", "group A", "bachelor's", "91", "96", "92"],
            ["703", "male", "group A", "bachelor's", "87", "84", "87"],
            ["821", "female", "group A", "some high", "85", "90", "92"]
          ]
        },
        {
          name: "📁 Source: students_program_B.csv (Top 4 records)",
          headers: ["ID", "Gender", "Race", "Education", "Math", "Reading", "Writing"],
          data: [
            ["289", "male", "group B", "bachelor's", "88", "75", "76"],
            ["145", "female", "group B", "some high", "72", "81", "83"],
            ["332", "male", "group B", "some college", "65", "70", "68"],
            ["412", "female", "group B", "master's", "95", "98", "97"]
          ]
        },
        {
          name: "📁 Source: scholarships.csv (Top 4 records)",
          headers: ["Race", "Award Name", "Amount ($)"],
          data: [
            ["group A", "STEM Award", "5000"],
            ["group B", "Diversity Grant", "4000"],
            ["group C", "Merit Scholarship", "4500"],
            ["group D", "Financial Aid", "3500"]
          ]
        }
      ],
      color: "indigo"
    },
    {
      title: "BƯỚC 2: UNION (Gộp dữ liệu)",
      desc: "Hợp nhất các tập dữ liệu có cùng cấu trúc từ nhiều nguồn khác nhau.",
      code: "all_students = UNION prog_a, prog_b;",
      multiTables: [
        {
          name: "📋 Input: prog_a (Program A — 2 records)",
          headers: ["ID", "Gender", "Race", "Education", "Math", "Read", "Write"],
          data: [
            ["615", "female", "group A", "associate's", "82", "93", "93"],
            ["572", "male", "group A", "bachelor's", "91", "96", "92"]
          ]
        },
        {
          name: "📋 Input: prog_b (Program B — 2 records)",
          headers: ["ID", "Gender", "Race", "Education", "Math", "Read", "Write"],
          data: [
            ["289", "male", "group B", "bachelor's", "88", "75", "76"],
            ["412", "female", "group B", "master's", "95", "98", "97"]
          ]
        },
        {
          name: "✅ Output: all_students = UNION(prog_a ∪ prog_b)",
          headers: ["ID", "Gender", "Race", "Education", "Math", "Read", "Write", "Source"],
          data: [
            ["615", "female", "group A", "associate's", "82", "93", "93", "prog_a"],
            ["572", "male", "group A", "bachelor's", "91", "96", "92", "prog_a"],
            ["289", "male", "group B", "bachelor's", "88", "75", "76", "prog_b"],
            ["412", "female", "group B", "master's", "95", "98", "97", "prog_b"]
          ]
        }
      ],
      color: "emerald"
    },
    {
      title: "BƯỚC 3: SPLIT (Phân luồng)",
      desc: "Tách một tập dữ liệu lớn thành nhiều luồng xử lý riêng biệt dựa trên điều kiện.",
      code: "SPLIT all_students INTO\n  excellent   IF math >= 80,\n  good        IF (math >= 60 AND math < 80),\n  needs_help  IF math < 60;",
      multiTables: [
        {
          name: "🟢 Stream: excellent (math ≥ 80) — 198 records",
          headers: ["ID", "Gender", "Race", "Math", "Read", "Write"],
          data: [
            ["615", "female", "group A", "82", "93", "93"],
            ["572", "male", "group A", "91", "96", "92"],
            ["412", "female", "group B", "95", "98", "97"]
          ]
        },
        {
          name: "🟡 Stream: good (math 60–79) — 510 records",
          headers: ["ID", "Gender", "Race", "Math", "Read", "Write"],
          data: [
            ["145", "female", "group B", "72", "81", "83"],
            ["703", "male", "group A", "65", "70", "68"],
            ["821", "female", "group A", "75", "80", "78"]
          ]
        },
        {
          name: "🔴 Stream: needs_help (math < 60) — 292 records",
          headers: ["ID", "Gender", "Race", "Math", "Read", "Write"],
          data: [
            ["332", "male", "group B", "58", "62", "55"],
            ["201", "female", "group C", "45", "50", "48"],
            ["105", "male", "group D", "52", "60", "57"]
          ]
        },
        {
          name: "📊 Result Summary — all_students split into 3 streams",
          headers: ["Stream Name", "Condition", "Record Count", "Percentage"],
          data: [
            ["excellent", "math >= 80", "198", "19.8%"],
            ["good", "math 60–79", "510", "51.0%"],
            ["needs_help", "math < 60", "292", "29.2%"]
          ]
        }
      ],
      color: "amber"
    },
    {
      title: "BƯỚC 4: JOIN (Kết hợp)",
      desc: "Nối dữ liệu học sinh với bảng học bổng bằng cột Race/Ethnicity (Multi-Dataset Join).",
      code: "enriched = JOIN all_students BY race, schol BY race;",
      multiTables: [
        {
          name: "📋 Input: all_students (sample — joined by race)",
          headers: ["ID", "Gender", "Race", "Math", "Read", "Write"],
          data: [
            ["615", "female", "group A", "82", "93", "93"],
            ["572", "male", "group A", "91", "96", "92"],
            ["289", "male", "group B", "88", "75", "76"],
            ["412", "female", "group B", "95", "98", "97"]
          ]
        },
        {
          name: "📋 Input: schol — scholarships.csv (joined by race)",
          headers: ["Race", "Scholarship Name", "Amount ($)"],
          data: [
            ["group A", "STEM Award", "5000"],
            ["group B", "Diversity Grant", "4000"],
            ["group C", "Merit Scholarship", "4500"],
            ["group D", "Financial Aid", "3500"]
          ]
        },
        {
          name: "✅ Output: enriched = JOIN all_students BY race, schol BY race",
          headers: ["ID", "Gender", "Race", "Math", "Read", "Write", "Scholarship", "Amount ($)"],
          data: [
            ["615", "female", "group A", "82", "93", "93", "STEM Award", "5000"],
            ["572", "male", "group A", "91", "96", "92", "STEM Award", "5000"],
            ["289", "male", "group B", "88", "75", "76", "Diversity Grant", "4000"],
            ["412", "female", "group B", "95", "98", "97", "Diversity Grant", "4000"]
          ]
        }
      ],
      color: "rose"
    },
    {
      title: "BƯỚC 5: TRÌNH DIỄN KẾT QUẢ",
      desc: "Kiểm tra Schema và xuất dữ liệu của high_achievers (học sinh có math ≥ 80) ra màn hình.",
      code: "-- Mô tả cấu trúc schema của all_students\nDESCRIBE all_students;\n\n-- Xuất dữ liệu high_achievers ra màn hình\nDUMP high_achievers;",
      multiTables: [
        {
          name: "📐 DESCRIBE all_students — Schema Output",
          headers: ["Field", "Type", "Description"],
          data: [
            ["id", "int", "Student ID"],
            ["gender", "chararray", "Male / Female"],
            ["race", "chararray", "Race / Ethnicity group"],
            ["parent_edu", "chararray", "Parent education level"],
            ["lunch", "chararray", "Standard or free/reduced"],
            ["test_prep", "chararray", "Completed or none"],
            ["math", "int", "Math score (0–100)"],
            ["reading", "int", "Reading score (0–100)"],
            ["writing", "int", "Writing score (0–100)"]
          ]
        },
        {
          name: "📤 DUMP high_achievers — Students with math ≥ 80",
          headers: ["ID", "Gender", "Race", "Math", "Reading", "Writing"],
          data: [
            ["615", "female", "group A", "82", "93", "93"],
            ["572", "male", "group A", "91", "96", "92"],
            ["412", "female", "group B", "95", "98", "97"],
            ["703", "male", "group A", "87", "84", "87"],
            ["821", "female", "group A", "85", "90", "92"]
          ]
        }
      ],
      color: "violet"
    }
  ]

  return (
    <div className="space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-10 bg-indigo-600 rounded-[40px] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -mr-20 -mt-20" />
        <div className="relative z-10 max-w-2xl">
          <p className="text-[12px] font-black uppercase tracking-[0.4em] mb-4 opacity-70">Case Study 01</p>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter mb-6 leading-[1.1]">Multi-Dataset Operations Pipeline</h2>
          <p className="text-lg font-bold text-indigo-100 opacity-80 leading-relaxed">
            Trình diễn khả năng của Pig trong việc xử lý luồng dữ liệu phức tạp: Nạp, Gộp, Phân loại và Kết nối đa nguồn chỉ trong một kịch bản duy nhất.
          </p>
        </div>
        <div className="shrink-0 bg-white/10 backdrop-blur-md rounded-[32px] p-8 border border-white/20 relative z-10 w-full lg:w-auto">
          <div className="flex items-center gap-4 mb-4">
            <Activity className="text-emerald-400" size={32} />
            <span className="text-3xl font-black">100%</span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Success Rate on Distributed Host</p>
        </div>
      </div>

      <div className="flex flex-col gap-12">
        {steps.map((step: any, idx: number) => (
          <div key={idx} className="group relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[48px] blur opacity-0 group-hover:opacity-10 transition duration-1000" />
            <div className="relative bg-white border border-slate-100 rounded-[48px] p-12 lg:p-16 h-full flex flex-col lg:flex-row gap-12 hover:shadow-2xl transition-all duration-700">

              <div className="lg:w-1/3 space-y-8">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-xl ${step.color === 'indigo' ? 'bg-indigo-600 shadow-indigo-200' :
                    step.color === 'emerald' ? 'bg-emerald-500 shadow-emerald-200' :
                      step.color === 'amber' ? 'bg-amber-500 shadow-amber-200' : 'bg-rose-500 shadow-rose-200'
                    }`}>
                    0{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{step.title}</h3>
                    <div className={`h-1 w-8 rounded-full ${step.color === 'indigo' ? 'bg-indigo-400' :
                      step.color === 'emerald' ? 'bg-emerald-400' :
                        step.color === 'amber' ? 'bg-amber-400' : 'bg-rose-400'
                      }`} />
                  </div>
                </div>

                <p className="text-slate-900 font-black text-2xl tracking-tighter leading-tight">{step.desc}</p>

                <div className="bg-[#0f172a] rounded-3xl p-8 border border-slate-800 shadow-2xl group/code">
                  <div className="flex items-center gap-2 mb-4 opacity-40 group-hover/code:opacity-80 transition-opacity">
                    <Terminal size={14} className="text-indigo-400" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Pig Latin Code</span>
                  </div>
                  <pre className="text-[12px] font-mono font-bold text-indigo-100 overflow-x-auto whitespace-pre leading-relaxed scrollbar-hide">
                    {step.code}
                  </pre>
                </div>
              </div>

              <div className="lg:w-2/3 flex flex-col gap-6">
                <div className="flex items-center gap-3 mb-2 opacity-60">
                  <Activity size={16} className="text-slate-400" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Execution Result</span>
                </div>

                {step.multiTables ? (
                  <div className="space-y-6">
                    {step.multiTables.map((table: any, tIdx: number) => (
                      <div key={tIdx} className="bg-slate-50 rounded-[32px] p-8 border border-slate-100 overflow-hidden">
                        <div className="text-[11px] font-black text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                          <Layers size={12} /> {table.name}
                        </div>
                        <div className="overflow-x-auto scrollbar-hide">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-slate-200">
                                {table.headers.map((h: string) => (
                                  <th key={h} className="pb-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {table.data.map((row: string[], rIdx: number) => (
                                <tr key={rIdx} className="group/row hover:bg-white transition-colors">
                                  {row.map((cell: string, cIdx: number) => (
                                    <td key={cIdx} className="py-2.5 px-4 text-[11px] font-bold text-slate-600 group-hover/row:text-slate-900 whitespace-nowrap">
                                      {cell.startsWith('group') ? <Badge type="gender">{cell}</Badge> : cell}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 bg-slate-50 rounded-[32px] p-8 border border-slate-100 overflow-hidden flex flex-col">
                    {step.tableHeaders ? (
                      <div className="overflow-x-auto scrollbar-hide">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-200">
                              {step.tableHeaders.map((h: string) => (
                                <th key={h} className="pb-4 px-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {step.tableData?.map((row: string[], rIdx: number) => (
                              <tr key={rIdx} className="group/row hover:bg-white transition-colors">
                                {row.map((cell: string, cIdx: number) => (
                                  <td key={cIdx} className="py-3 px-4 text-[12px] font-bold text-slate-600 group-hover/row:text-slate-900 whitespace-nowrap">
                                    {cell.startsWith('group') ? <Badge type="gender">{cell}</Badge> : cell}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full min-h-[100px]">
                        <p className="text-lg font-black text-slate-400 uppercase tracking-[0.3em] text-center animate-pulse italic">{step.result}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const Demo02 = () => {
  const gradeData = [
    { name: 'Excellent', value: 30.1, fill: '#8b5cf6' },
    { name: 'Good', value: 40.3, fill: '#0ea5e9' },
    { name: 'Average', value: 29.6, fill: '#f59e0b' },
  ];

  const code = `-- 1. REGISTER: Đăng ký UDF Python
REGISTER 'student_udfs.py' USING jython AS my_udfs;

-- 2. LOAD & DEFINE
data = LOAD 'data/students_all.csv' AS (...);

-- 3. Triệu hồi UDF trong FOREACH
graded = FOREACH data GENERATE 
    id, 
    math,
    -- Tính điểm trung bình (UDF 1)
    my_udfs.calc_avg(math, reading, writing) AS avg,
    -- Phân loại xếp hạng (UDF 2)
    my_udfs.get_grade(math) AS rank;`

  const pythonCode = `# student_udfs.py
# Pig Python UDFs

@outputSchema("grade:chararray")
def get_grade(math):
    if math is None: return "N/A"
    try:
        math = int(math)
        if math >= 80: return "Excellent"
        if math >= 60: return "Good"
        return "Average"
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
        return 0.0`;

  const output = `[1] DUMP result (Sample 2 records):
(0,82,93,93,89.33,Excellent)
(1,72,72,74,72.67,Good)
...

[2] ILLUSTRATE: Grade Classification
-------------------
| Grade      | Count |
|------------|-------|
| Excellent  | 301   |
| Good       | 403   |
| Average    | 296   |
-------------------`

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
      <div className="space-y-10 flex flex-col">
        <Card title="Grade Distribution" subtitle="UDF Classification" icon={Activity} color="text-purple-600">
          <div className="h-64 mt-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={gradeData} dataKey="value" innerRadius={70} outerRadius={90} paddingAngle={12} stroke="none" labelLine={true} label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}>
                  {gradeData.map((entry, index) => <Cell key={index} fill={entry.fill} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={48} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'black', fill: '#64748b', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <div className="h-64">
          <CodeTerminal title="demo_02_udf.pig" code={code} output={output} />
        </div>
      </div>
      <div className="h-full min-h-[500px]">
        <CodeTerminal title="student_udfs.py" code={pythonCode} />
      </div>
    </div>
  )
}

const Demo03 = () => {
  return (
    <div className="space-y-16">

      {/* ERROR 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
        <div className="flex flex-col gap-6 h-full justify-between">
          <CodeTerminal
            title="01_schema_mismatch.pig"
            code={`-- [LOI 1] DESCRIBE: Schema Mismatch
-- Lỗi do khai báo data type: race:int
DESCRIBE raw_data;`}
          />
          <MiniSnippet title="Cách khắc phục" code={`-- Khai báo thành chuỗi ký tự\nrace: chararray`} color="emerald" />
        </div>
        <div className="h-full">
          <Card title="[1] Schema Verification (Mismatch)" subtitle="DESCRIBE raw_data;" icon={AlertTriangle} color="text-rose-500">
            <div className="overflow-x-auto mt-4 rounded-xl border border-slate-100 shadow-sm">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-3 px-4 font-black tracking-widest uppercase text-[10px] text-slate-400">Field</th>
                    <th className="py-3 px-4 font-black tracking-widest uppercase text-[10px] text-slate-400">Asserted Type</th>
                    <th className="py-3 px-4 font-black tracking-widest uppercase text-[10px] text-slate-400">Actual Content</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr className="hover:bg-slate-50 transition-colors group">
                    <td className="py-2 px-4 text-[12px] font-bold text-slate-600">gender</td>
                    <td className="py-2 px-4 text-[12px] font-bold text-emerald-600">chararray</td>
                    <td className="py-2 px-4 text-[12px] font-bold text-slate-600 border-l border-slate-100">"female"</td>
                  </tr>
                  <tr className="bg-rose-50/50 hover:bg-rose-50 transition-colors group">
                    <td className="py-2 px-4 text-[12px] font-bold text-rose-600 flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />race</td>
                    <td className="py-2 px-4 text-[12px] font-bold text-rose-600 line-through decoration-rose-400 decoration-2">int</td>
                    <td className="py-2 px-4 text-[12px] font-bold text-rose-600 border-l border-rose-100">"group B" (String!)</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors group">
                    <td className="py-2 px-4 text-[12px] font-bold text-slate-600">test_prep</td>
                    <td className="py-2 px-4 text-[12px] font-bold text-emerald-600">chararray</td>
                    <td className="py-2 px-4 text-[12px] font-bold text-slate-600 border-l border-slate-100">"none"</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* ERROR 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
        <div className="flex flex-col gap-6 h-full justify-between">
          <CodeTerminal
            title="02_type_casting.pig"
            code={`-- [LOI 2] Type Casting Disaster
-- Cảnh báo: ACCESSING_NON_EXISTENT_FIELD
DUMP bad_type_sample;`}
          />
          <MiniSnippet title="Cách khắc phục" code={`-- Lọc bỏ dòng Tiêu đề (Header) xen lẫn\nraw = FILTER raw_data BY id IS NOT NULL;`} color="emerald" />
        </div>
        <div className="h-full">
          <Card title="[2] Type Casting Disaster" subtitle="DUMP bad_type_sample;" icon={AlertTriangle} color="text-amber-500">
            <div className="overflow-x-auto mt-4 rounded-xl border border-slate-100 shadow-sm">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-3 px-4 font-black tracking-widest uppercase text-[10px] text-slate-400">ID</th>
                    <th className="py-3 px-4 font-black tracking-widest uppercase text-[10px] text-slate-400">Gender</th>
                    <th className="py-3 px-4 font-black tracking-widest uppercase text-[10px] text-rose-500">Race (int)</th>
                    <th className="py-3 px-4 font-black tracking-widest uppercase text-[10px] text-slate-400">Math</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  <tr className="bg-slate-100/50 hover:bg-slate-100 transition-colors group">
                    <td className="py-2 px-4 text-[12px] font-medium text-slate-400 italic">null</td>
                    <td className="py-2 px-4 text-[12px] font-medium text-slate-400 italic border-l border-slate-200/50">null</td>
                    <td className="py-2 px-4 text-[12px] font-bold text-rose-500 bg-rose-50 border-l border-slate-200/50">null</td>
                    <td className="py-2 px-4 text-[12px] font-medium text-slate-400 italic border-l border-slate-200/50">null</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors group">
                    <td className="py-2 px-4 text-[12px] font-bold text-slate-600">0</td>
                    <td className="py-2 px-4 text-[12px] font-bold text-slate-600 border-l border-slate-100">female</td>
                    <td className="py-2 px-4 text-[12px] font-bold text-rose-500 bg-rose-50 border-l border-slate-100">null</td>
                    <td className="py-2 px-4 text-[12px] font-bold text-slate-600 border-l border-slate-100">72</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors group">
                    <td className="py-2 px-4 text-[12px] font-bold text-slate-600">1</td>
                    <td className="py-2 px-4 text-[12px] font-bold text-slate-600 border-l border-slate-100">female</td>
                    <td className="py-2 px-4 text-[12px] font-bold text-rose-500 bg-rose-50 border-l border-slate-100">null</td>
                    <td className="py-2 px-4 text-[12px] font-bold text-slate-600 border-l border-slate-100">69</td>
                  </tr>
                </tbody>
              </table>
              <div className="bg-amber-50 py-2 border-t border-amber-100 text-center">
                <span className="text-[10px] uppercase tracking-widest font-black text-amber-600 animate-pulse">... 1000/1000 records corrupted</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ERROR 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
        <div className="flex flex-col gap-6 h-full justify-between">
          <CodeTerminal
            title="03_boundary_check.pig"
            code={`-- [LOI 3] FILTER: Boundary Loss
-- Lọc các học sinh có điểm toán dương (> 0)
clean = FILTER raw BY math > 0;`}
          />
          <MiniSnippet title="Cách khắc phục" code={`-- Lấy luôn cả điểm 0\nclean = FILTER raw BY math >= 0;`} color="emerald" />
        </div>
        <div className="h-full">
          <Card title="[3] Boundary Loss Check" subtitle="FILTER BY math > 0;" icon={AlertTriangle} color="text-indigo-500">
            <div className="mt-4 flex flex-col gap-3 rounded-xl border border-slate-100 bg-slate-50 p-6 shadow-sm h-[calc(100%-1rem)] justify-center">
              <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                <span className="text-[12px] font-bold text-slate-500">Raw Data (All rows)</span>
                <span className="text-xl font-black text-indigo-600">1000</span>
              </div>
              <div className="flex justify-between items-center bg-rose-50 p-3 rounded-lg border border-rose-200 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[12px] font-black text-rose-600">math &gt; 0</span>
                  <span className="text-[10px] text-rose-500 font-medium">Wrong Logic</span>
                </div>
                <span className="text-xl font-black text-rose-600 line-through decoration-2">998</span>
              </div>
              <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-lg border border-emerald-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-white/40 to-transparent skew-x-12 translate-x-10 animate-[shimmer_2s_infinite]" />
                <div className="flex flex-col relative z-20">
                  <span className="text-[12px] font-black text-emerald-700">math &gt;= 0</span>
                  <span className="text-[10px] text-emerald-600 font-medium">Correct Logic</span>
                </div>
                <span className="text-2xl font-black text-emerald-600 relative z-20">1000</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

    </div>
  )
}

const Demo04 = () => {
  const perfData = [
    { name: 'Normal JOIN', time: 27.9, fill: '#ef4444' },
    { name: 'Replicated', time: 1.4, fill: '#10b981' },
  ]

  const code = `-- [KT 1] Filter Early & Column Pruning
-- Chỉ lấy ID và Math, lọc ngay từ đầu
pruned = FOREACH (FILTER data BY math >= 50) GENERATE id, math;

-- [KT 2] Replicated JOIN (Map-side)
-- Ép bảng nhỏ vào RAM của nốt
joined = JOIN pruned BY race, schol BY race USING 'replicated';`

  const output = `Dataset Simulation: 500,000 records

[KT1] Early Filter Technique
  Optimization: Column subsetting
  Performance: 3.0x speed improvement

[KT2] Bandwidth Pruning
  Full columns: 171.1 MB
  Pruned columns: 33.4 MB (80% bandwidth saved)

[KT3] Replicated JOIN
  Normal JOIN Speed: 27.9 ms
  Replicated Speed  : 1.4 ms (19.3x improvement)`

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
      <div className="space-y-8 flex flex-col">
        <div className="grid grid-cols-2 gap-6">
          <MiniSnippet title="Pruning" code={`data[[\n  "id", \n  "math"\n]]`} color="emerald" />
          <MiniSnippet title="Cache Join" code={`# RAM lookup\nJOIN USING \n'replicated'`} color="indigo" />
        </div>
        <Card title="Optimization Benchmarks" icon={Zap} color="text-emerald-500">
          <div className="h-48 mt-8">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perfData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 10, fontWeight: 'black', fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="time" radius={[0, 12, 12, 0]} label={{ position: 'right', fontSize: 11, fontWeight: 'black', fill: '#1e293b', formatter: (v: any) => v + 'ms' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 flex gap-6">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Network Load</p>
              <p className="text-2xl font-black text-emerald-600">-80%</p>
            </div>
            <div className="h-10 w-px bg-slate-100" />
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">IO Gain</p>
              <p className="text-2xl font-black text-indigo-600">19x</p>
            </div>
          </div>
        </Card>
      </div>
      <div className="h-full">
        <CodeTerminal title="demo_04_optimization.pig" code={code} output={output} />
      </div>
    </div>
  )
}

const Demo05 = () => {
  const code = `-- PHÁC THẢO PIPELINE TỔNG THỂ
enriched = JOIN (UNION prog_a, prog_b) BY race, schol BY race;

-- Áp dụng logic nghiệp vụ (UDF)
processed = FOREACH enriched GENERATE 
    id, my_udfs.get_grade(math) AS rank;

-- Thống kê (Aggregation)
grouped = GROUP processed BY rank;
insights = FOREACH grouped GENERATE group, COUNT(processed);`

  const output = `[Phase 1] UNION Success: 1000 records
[Phase 2] JOIN Success: (race, student_info, scholarship_info)
[Phase 3] UDF Generation: (id, grade)

[FINAL INSIGHTS DUMP]
((female,Excellent),125)
((male,Excellent),176)
((female,Good),210)
((female,Average),183)
((male,Average),113)
((male,Good),193)

Pipeline Execution Success.`

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-stretch">
      <div className="flex flex-col space-y-10">
        <div className="grid grid-cols-2 gap-6">
          <MiniSnippet title="Pipeline" code={`STAGE_1 (LOAD) -> \nSTAGE_2 (JOIN/UDF) -> \nSTAGE_3 (GROUP) -> \nSTAGE_4 (STORE)`} color="rose" />
          <MiniSnippet title="Target" code={`GROUP processed BY rank;\ninsights = FOREACH grouped\n  GENERATE group,\n  COUNT(processed);`} color="indigo" />
        </div>
        <Card title="E2E Pipeline Visualization" icon={PlayCircle} color="text-rose-500">
          <div className="w-full bg-[#1e293b] rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl h-full flex flex-col justify-center">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 blur-[100px]" />
            <div className="flex justify-between items-end mb-10">
              <div>
                <p className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-3">System Report</p>
                <h4 className="text-3xl font-black tracking-tight">Final Insight</h4>
              </div>
              <Badge type="test">Completed</Badge>
            </div>
            <div className="grid grid-cols-2 gap-10">
              <div className="p-6 bg-slate-800/50 rounded-3xl border border-slate-700/50">
                <Users className="text-emerald-500 mb-3" size={28} />
                <p className="text-3xl font-black">1.1k+</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Processed</p>
              </div>
              <div className="p-6 bg-slate-800/50 rounded-3xl border border-slate-700/50">
                <Activity className="text-rose-500 mb-3" size={28} />
                <p className="text-3xl font-black">13ms</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Latency</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
      <div className="h-full">
        <CodeTerminal title="demo_05_pipeline.pig" code={code} output={output} />
      </div>
    </div>
  )
}

const DemoOverview = ({ dataSources }: any) => {
  const progA = dataSources.program_a || []
  const progB = dataSources.program_b || []
  const unionData = [
    { name: 'A', count: progA.length, fill: '#6366f1' },
    { name: 'B', count: progB.length, fill: '#8b5cf6' },
  ]

  const perfData = [
    { name: 'Normal', time: 27.9, fill: '#ef4444' },
    { name: 'Optimized', time: 1.4, fill: '#10b981' },
  ]

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card title="Data Ingestion" subtitle="Multi-Source Union" icon={Layers} color="text-blue-600">
          <div className="h-40 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={unionData}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} hide />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] font-black text-slate-400 mt-4 uppercase tracking-widest text-center">1,000 Records Unified</p>
        </Card>

        <Card title="Logic Extension" subtitle="UDF Classification" icon={FlaskConical} color="text-purple-600">
          <div className="flex flex-col justify-center h-full space-y-4 pt-2">
            <div className="flex justify-between items-center text-[11px] font-bold">
              <span className="text-slate-400">Avg. Calculator</span>
              <span className="text-emerald-500">Jython / Python</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 w-[92%]" />
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold">
              <span className="text-slate-400">Grade Mapper</span>
              <span className="text-indigo-500">Success</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 w-[100%]" />
            </div>
          </div>
        </Card>

        <Card title="Performance" subtitle="Replicated Join" icon={Zap} color="text-emerald-600">
          <div className="h-40 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perfData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" hide />
                <Bar dataKey="time" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between items-center mt-4 border-t border-slate-50 pt-4">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Gain</span>
            <span className="text-xl font-black text-indigo-600">19x</span>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card title="Troubleshooting Logic" icon={AlertTriangle} color="text-amber-500">
          <div className="space-y-4 pt-2">
            {[
              { t: 'Schema Sync', s: 'Verified', c: 'bg-emerald-500' },
              { t: 'Type Safety', s: 'Rigorous', c: 'bg-emerald-500' },
              { t: 'Boundary Check', s: 'Complete', c: 'bg-indigo-500' }
            ].map(item => (
              <div key={item.t} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <span className="text-xs font-black text-slate-600 uppercase tracking-tight">{item.t}</span>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-widest ${item.c}`}>{item.s}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Final Pipeline Insights" subtitle="DUMP Results" icon={PlayCircle} color="text-rose-600">
          <div className="bg-slate-900 rounded-2xl p-6 h-full font-mono text-[10px] text-emerald-400 space-y-2 overflow-auto max-h-[250px] custom-scrollbar">
            <p className="text-slate-500 border-b border-slate-800 pb-2 mb-4 uppercase tracking-widest font-black">Cluster Execution Stream</p>
            <p>((female,Excellent),125)</p>
            <p>((male,Excellent),176)</p>
            <p>((female,Good),210)</p>
            <p>((female,Average),183)</p>
            <p>((male,Average),113)</p>
            <p>((male,Good),193)</p>
            <div className="pt-4 mt-4 border-t border-slate-800 text-indigo-400">
              <p className="font-bold">STATUS: COMPLETED</p>
              <p>LATENCY: 13.03ms</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

// ─── Main Application ────────────────────────────────────

export default function App() {
  const [view, setView] = useState<{ type: 'table' | 'demo', id: string }>({ type: 'table', id: 'all' })
  const [allDataSources, setAllDataSources] = useState<Record<string, DataRow[]>>({})
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [showSidebar, setShowSidebar] = useState(false)

  useEffect(() => {
    const loader = async () => {
      const results: Record<string, DataRow[]> = {}
      for (const source of DATA_SOURCES) {
        try {
          const res = await fetch(`/${source.file}`)
          results[source.id] = await res.json()
        } catch (e) { console.error(`Failed to load ${source.id}`) }
      }
      setAllDataSources(results)
      setLoading(false)
    }
    loader()
  }, [])

  const currentSource = DATA_SOURCES.find(s => s.id === view.id) || DATA_SOURCES[0]
  const currentDemo = DEMOS.find(d => d.id === view.id)

  const columns = useMemo(() => {
    if (view.type !== 'table') return []
    const sourceData = allDataSources[view.id] || []
    return sourceData.length > 0 ? Object.keys(sourceData[0]) : []
  }, [view, allDataSources])

  const filtered = useMemo(() => {
    const base = allDataSources[view.id] || []
    if (!search.trim()) return base
    const q = search.toLowerCase()
    return base.filter(row =>
      Object.values(row).some(v => String(v).toLowerCase().includes(q))
    )
  }, [view, allDataSources, search])

  const totalPages = Math.ceil(filtered.length / pageSize)
  const pagedData = filtered.slice((page - 1) * pageSize, page * pageSize)

  const handleNav = (type: 'table' | 'demo', id: string) => {
    setView({ type, id })
    setSearch('')
    setPage(1)
    setShowSidebar(false)
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-slate-800 antialiased overflow-hidden">

      {/* Sidebar Overlay (Mobile) */}
      {showSidebar && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 w-80 bg-white border-r border-slate-200 flex flex-col h-screen transform transition-transform duration-500 ease-in-out lg:translate-x-0 ${showSidebar ? 'translate-x-0' : '-translate-x-full'} shadow-2xl lg:shadow-sm shrink-0 overflow-hidden`}>
        <div className="p-10 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-[20px] flex items-center justify-center text-white text-2xl font-black shadow-2xl shadow-indigo-100 ring-8 ring-indigo-50">
              P
            </div>
            <div>
              <h1 className="text-[24px] font-black tracking-tighter text-slate-900 leading-none">Pig Lab</h1>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em] mt-2 opacity-80">Workspace v2.0</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-8 space-y-10 overflow-y-auto scrollbar-hide pt-6">

          <div className="space-y-4">
            <h4 className="px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Active Demos</h4>
            <div className="space-y-1.5">
              {DEMOS.map(d => (
                <button
                  key={d.id}
                  onClick={() => handleNav('demo', d.id)}
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-[24px] transition-all duration-500 group ${view.type === 'demo' && view.id === d.id
                    ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-200 scale-[1.05] -translate-y-1'
                    : 'text-slate-500 hover:bg-slate-50 hover:translate-x-1'
                    }`}
                >
                  <d.icon size={20} className={view.type === 'demo' && view.id === d.id ? 'text-white' : d.color} />
                  <span className="text-[14px] font-black tracking-tight">{d.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest">Data Sources</h4>
            <div className="space-y-1">
              {DATA_SOURCES.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleNav('table', s.id)}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 ${view.type === 'table' && view.id === s.id
                    ? 'bg-slate-900 text-white shadow-xl'
                    : 'text-slate-500 hover:bg-slate-50'
                    }`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${s.color} ${view.id === s.id && view.type === 'table' ? 'ring-4 ring-white/20' : 'opacity-30'}`} />
                  <span className="text-[13px] font-bold truncate opacity-70">{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        <div className="p-8 border-t border-slate-100 bg-slate-50/30">
          <div className="bg-white rounded-[32px] p-6 border border-slate-200 shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Cluster Status</span>
            </div>
            <p className="text-xs font-black text-slate-900 leading-tight">1.2M Record Engine Ready for Presentations</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">

        {/* Mobile Header */}
        <div className="lg:hidden h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black">P</div>
            <span className="font-black tracking-tighter">Pig Lab</span>
          </div>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-3 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Layers size={24} className="text-indigo-600" />
          </button>
        </div>

        {/* Header (Desktop-ish) */}
        <header className="h-24 lg:h-32 bg-white/60 backdrop-blur-3xl border-b border-slate-200 px-6 lg:px-16 flex flex-col lg:flex-row items-start lg:items-center justify-between shrink-0 sticky top-0 z-10 py-4 lg:py-0 overflow-hidden">
          <div className="flex items-center gap-4 lg:gap-8">
            <div className={`w-12 h-12 lg:w-20 lg:h-20 rounded-2xl lg:rounded-[32px] flex items-center justify-center text-white shadow-2xl transition-all duration-1000 transform ${view.type === 'demo' ? 'bg-indigo-600' : 'bg-slate-900 border-4 border-slate-800'
              }`}>
              {view.type === 'demo' ? <PlayCircle size={24} className="lg:hidden" /> : <Database size={24} className="lg:hidden" />}
              <div className="hidden lg:block">
                {view.type === 'demo' ? <PlayCircle size={36} /> : <Database size={36} />}
              </div>
            </div>
            <div>
              <h2 className="text-[20px] lg:text-[34px] font-black text-slate-900 tracking-tighter leading-none mb-1 lg:mb-3">
                {view.type === 'demo' ? currentDemo?.name : currentSource.name}
              </h2>
              <div className="flex items-center gap-2 lg:gap-3">
                <div className="px-2 lg:px-3 py-0.5 lg:py-1 bg-white border border-slate-200 rounded-lg lg:rounded-xl shadow-sm">
                  <p className="text-[8px] lg:text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none">
                    {view.type === 'demo' ? 'Logic Masterclass' : `Data View`}
                  </p>
                </div>
                <div className="hidden lg:block h-1.5 w-1.5 rounded-full bg-slate-300" />
                <p className="hidden lg:block text-[13px] font-bold text-slate-400 tracking-tight">Enterprise Scale Visualization Platform</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-8 mt-4 lg:mt-0 w-full lg:w-auto">
            {view.type === 'table' && (
              <div className="flex items-center gap-2 lg:gap-4 bg-white p-1.5 lg:p-2 rounded-2xl lg:rounded-[32px] border border-slate-200 shadow-xl shadow-slate-200/50 w-full lg:w-auto">
                <div className="relative flex-1 lg:flex-none">
                  <span className="absolute left-4 lg:left-6 top-1/2 -translate-y-1/2 text-slate-300">
                    <Search size={16} className="lg:size-[20px]" />
                  </span>
                  <input
                    type="text"
                    placeholder="Quick search..."
                    className="pl-10 lg:pl-14 pr-4 lg:pr-8 py-2 lg:py-4 bg-transparent border-none text-[13px] lg:text-[15px] w-full lg:w-80 focus:ring-0 transition-all outline-none font-bold text-slate-800 placeholder:text-slate-300"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1) }}
                  />
                </div>
                <div className="h-8 lg:h-12 w-px bg-slate-100 mx-1 lg:mx-2" />
                <select
                  className="bg-slate-50 border-none rounded-xl lg:rounded-2xl px-3 lg:px-6 py-2 lg:py-3 text-[9px] lg:text-[11px] font-black text-slate-900 outline-none pr-8 cursor-pointer uppercase tracking-widest shrink-0"
                  value={pageSize}
                  onChange={e => { setPageSize(Number(e.target.value)); setPage(1) }}
                >
                  {PAGE_SIZES.map(s => <option key={s} value={s}>{s} ROWS</option>)}
                </select>
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-4 lg:p-16 custom-scrollbar transition-all duration-[1500ms]">

          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-10">
              <div className="w-20 h-20 relative">
                <div className="absolute inset-0 border-8 border-indigo-600/10 rounded-full" />
                <div className="absolute inset-0 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin shadow-[0_0_50px_rgba(79,70,229,0.3)]" />
              </div>
              <p className="text-[13px] font-black uppercase tracking-[0.6em] text-slate-300 animate-pulse">Syncing Distributed Node...</p>
            </div>
          ) : (
            <div className="max-w-[1700px] mx-auto space-y-12 lg:space-y-20 animate-in fade-in slide-in-from-bottom-12 duration-[1500ms]">

              {/* DEMO DISPLAY */}
              {view.type === 'demo' && (
                <div className="space-y-24">
                  {view.id === 'demo1' && <Demo01 />}
                  {view.id === 'demo2' && <Demo02 />}
                  {view.id === 'demo3' && <Demo03 />}
                  {view.id === 'demo4' && <Demo04 />}
                  {view.id === 'demo5' && <Demo05 />}
                  {view.id === 'overview' && <DemoOverview dataSources={allDataSources} />}
                </div>
              )}

              {/* DATA TABLE DISPLAY */}
              {view.type === 'table' && (
                <div className="bg-white border border-slate-100 rounded-[32px] lg:rounded-[56px] shadow-[0_40px_100px_-20px_rgba(15,23,42,0.15)] overflow-hidden flex flex-col transition-all duration-1000">

                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/50 border-b-2 border-slate-100">
                          {columns.map(col => (
                            <th key={col} className="px-6 lg:px-12 py-6 lg:py-10 text-[10px] lg:text-[12px] font-black text-slate-400 uppercase tracking-[0.35em] whitespace-nowrap">
                              {col.replace(/_/g, ' ')}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pagedData.length === 0 ? (
                          <tr>
                            <td colSpan={columns.length} className="px-6 lg:px-12 py-32 lg:py-64 text-center">
                              <p className="text-xl lg:text-2xl font-black text-slate-100 uppercase tracking-[0.8em] animate-pulse">Empty Data Cluster</p>
                            </td>
                          </tr>
                        ) : (
                          pagedData.map((row, idx) => (
                            <tr key={idx} className="hover:bg-indigo-50/40 transition-all duration-700 group">
                              {columns.map(col => {
                                const val = row[col]
                                return (
                                  <td key={col} className="px-6 lg:px-12 py-4 lg:py-8 text-[13px] lg:text-[15px] align-middle whitespace-nowrap">
                                    {col === 'gender' ? <Badge type="gender">{val}</Badge> :
                                      col === 'test_prep' || col === 'test preparation course' ? <Badge type="test">{val}</Badge> :
                                        typeof val === 'number' && ['math', 'reading', 'writing', 'avg_score'].includes(col.toLowerCase()) ? (
                                          <div className="flex items-center gap-3 lg:gap-6">
                                            <div className="flex-1 w-20 lg:w-28 h-2.5 lg:h-3.5 bg-slate-100 rounded-full overflow-hidden shadow-inner ring-4 ring-slate-50 relative group/bar">
                                              <div className={`h-full transition-all duration-[2000ms] ease-out delay-${idx * 5} ${val >= 80 ? 'bg-indigo-600 shadow-[0_0_20px_rgba(79,70,229,0.5)]' : val >= 60 ? 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]'}`}
                                                style={{ width: `${val}%` }} />
                                            </div>
                                            <span className="text-xs lg:text-sm font-black text-slate-800 w-8 lg:w-10">{val}</span>
                                          </div>
                                        ) :
                                          <span className="text-slate-900 font-bold opacity-50 group-hover:opacity-100 transition-opacity duration-500">{val ?? '—'}</span>
                                    }
                                  </td>
                                )
                              })}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* High Quality Pagination */}
                  <div className="px-6 lg:px-16 py-8 lg:py-12 bg-slate-50/80 border-t-2 border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-6 shrink-0">
                    <div className="flex items-center gap-6">
                      <div className="h-10 w-10 lg:h-12 lg:w-12 bg-indigo-600 rounded-xl lg:rounded-[18px] flex items-center justify-center font-black text-md lg:text-lg text-white shadow-2xl shadow-indigo-300 ring-4 lg:ring-8 ring-white">{page}</div>
                      <span className="text-[10px] lg:text-[12px] font-black text-slate-400 uppercase tracking-[0.4em]">Index <span className="text-slate-900 mx-2">/</span> {totalPages || 1}</span>
                    </div>

                    <div className="flex items-center gap-3 lg:gap-4 scale-90 lg:scale-100">
                      <button
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center bg-white border border-slate-200 rounded-2xl lg:rounded-[28px] disabled:opacity-20 hover:shadow-2xl hover:scale-110 active:scale-95 transition-all text-slate-400 hover:text-indigo-600 shadow-lg shadow-slate-200/50"
                      >
                        <ChevronLeft size={24} className="lg:size-[28px]" />
                      </button>

                      <div className="flex gap-2 lg:gap-3">
                        {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                          let p = i + 1
                          if (totalPages > 3 && page > 2) p = page - 2 + i + 1
                          if (p > totalPages) return null
                          return (
                            <button
                              key={p}
                              onClick={() => setPage(p)}
                              className={`w-12 h-12 lg:w-16 lg:h-16 text-[13px] lg:text-[15px] font-black rounded-2xl lg:rounded-[28px] transition-all border-2 ${page === p
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xl shadow-indigo-200 scale-110 lg:scale-125 z-10 rotate-6'
                                : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-300'
                                }`}
                            >
                              {p}
                            </button>
                          )
                        })}
                      </div>

                      <button
                        disabled={page === totalPages || totalPages === 0}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="w-12 h-12 lg:w-16 lg:h-16 flex items-center justify-center bg-white border border-slate-200 rounded-2xl lg:rounded-[28px] disabled:opacity-20 hover:shadow-2xl hover:scale-110 active:scale-95 transition-all text-slate-400 hover:text-indigo-600 shadow-lg shadow-slate-200/50"
                      >
                        <ChevronRight size={24} className="lg:size-[28px]" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; height: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 20px; border: 2px solid transparent; background-clip: content-box; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
