import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      {payload.map((entry, i) => (
        <div className="chart-tooltip-item" key={i}>
          <span className="chart-tooltip-dot" style={{ background: entry.color }} />
          {entry.name}: ₹{entry.value?.toLocaleString()}
        </div>
      ))}
    </div>
  );
}

export default function SavingsTrendChart({ data = [] }) {
  return (
    <div className="card animate-in">
      <h3 className="card-title" style={{ marginBottom: 20 }}>Savings Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="savings" name="Savings" stroke="#10b981" strokeWidth={2} fill="url(#savingsGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
