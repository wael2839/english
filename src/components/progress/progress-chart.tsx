'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export function ProgressChart({
  completed,
  started,
  remaining,
}: {
  completed: number;
  started: number;
  remaining: number;
}) {
  const inProgress = Math.max(0, started - completed);
  const data = [
    { name: 'مكتمل', value: completed, color: 'var(--correct)' },
    { name: 'قيد الدراسة', value: inProgress, color: 'var(--primary)' },
    { name: 'متبقٍ', value: remaining, color: 'var(--muted-foreground)' },
  ].filter((d) => d.value > 0);

  if (!data.length) return null;

  return (
    <div className="h-56 rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-2 text-lg font-bold text-heading">توزيع التقدم</h2>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
