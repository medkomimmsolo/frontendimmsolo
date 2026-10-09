'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, TooltipPayload, TooltipPayloadEntry } from 'recharts';

interface ChartDataPoint {
  date: string;
  clicks: number;
}

interface ChartAreaProps {
  data: ChartDataPoint[];
  title: string;
  color?: string;
  height?: number;
}

function formatTooltipValue(value: unknown): [string, string] {
  const num = typeof value === 'number' ? value : 0;
  return [num.toLocaleString('id-ID'), 'Klik'];
}

export function ChartArea({ data, title, color = '#c20000', height = 200 }: ChartAreaProps) {
  const formattedData = data.map((d) => ({
    ...d,
    label: new Date(d.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
  }));

  const maxClicks = Math.max(...data.map((d) => d.clicks), 1);

  return (
    <div className="bg-white border border-slate-200 rounded-sm p-6">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`color-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, maxClicks * 1.2]}
              tickFormatter={(value) => (value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              labelStyle={{ color: '#0f172a', fontWeight: 600 }}
              formatter={formatTooltipValue}
            />
            <Area
              type="monotone"
              dataKey="clicks"
              stroke={color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#color-${color.replace('#', '')})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface BarChartProps {
  data: Array<{ name: string; clicks: number }>;
  title: string;
  color?: string;
  height?: number;
}

export function BarChartSimple({ data, title, color = '#c20000', height = 200 }: BarChartProps) {
  const maxClicks = Math.max(...data.map((d) => d.clicks), 1);

  return (
    <div className="bg-white border border-slate-200 rounded-sm p-6">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">{title}</h3>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#64748b' }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              domain={[0, maxClicks * 1.3]}
              tickFormatter={(value) => (value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              labelStyle={{ color: '#0f172a', fontWeight: 600 }}
              formatter={formatTooltipValue}
            />
            <Bar dataKey="clicks" fill={color} radius={[4, 4, 0, 0]}>
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}