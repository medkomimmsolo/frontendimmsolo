'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export interface TrendItem {
  month: string;
  period: string;
  blogs: number;
  events: number;
  form_responses: number;
}

interface ActivityTrendChartProps {
  data: TrendItem[];
  title?: string;
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-sm p-3 shadow-lg text-xs">
        <p className="font-bold text-slate-800 mb-2">{label}</p>
        <div className="space-y-1">
          {payload.map((item: any, i: number) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5" style={{ color: item.color }}>
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                {item.name}:
              </span>
              <span className="font-semibold text-slate-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
}

export function ActivityTrendChart({ data, title = 'Tren Aktivitas Organisasi (6 Bulan Terakhir)' }: ActivityTrendChartProps) {
  const maxVal = Math.max(
    ...data.flatMap((d) => [d.blogs, d.events, d.form_responses]),
    5
  );

  return (
    <div className="bg-white border border-[#0f172a]/10 rounded-sm shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-[#0f172a]" style={{ fontFamily: 'var(--font-poppins), sans-serif' }}>
            {title}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Produktivitas konten artikel, agenda kegiatan, dan formulir pendaftaran
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="month"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, Math.ceil(maxVal * 1.25)]}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 16, fontSize: 12 }}
            />
            <Bar dataKey="blogs" name="Post / Berita" fill="#c20000" radius={[3, 3, 0, 0]} />
            <Bar dataKey="events" name="Agenda Kegiatan" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            <Bar dataKey="form_responses" name="Pendaftar Form" fill="#10b981" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
