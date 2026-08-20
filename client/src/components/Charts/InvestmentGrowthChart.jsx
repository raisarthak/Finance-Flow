import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const TYPE_COLORS = {
  stocks: '#3b82f6',
  mutual_funds: '#8b5cf6',
  crypto: '#f59e0b',
  gold: '#eab308',
  fixed_deposit: '#10b981',
  bonds: '#06b6d4',
  real_estate: '#ec4899'
};

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-label">{label}</div>
      {payload.map((entry, i) => (
        <div className="chart-tooltip-item" key={i}>
          <span className="chart-tooltip-dot" style={{ background: entry.color }} />
          {entry.name}: ${entry.value?.toLocaleString()}
        </div>
      ))}
    </div>
  );
}

export default function InvestmentGrowthChart({ investments = [] }) {
  // Create a simple chart data from investments showing invested vs current
  const chartData = investments.map(inv => ({
    name: inv.symbol || inv.name?.substring(0, 8),
    invested: inv.purchasePrice * inv.quantity,
    current: inv.currentPrice * inv.quantity,
  }));

  return (
    <div className="card animate-in">
      <h3 className="card-title" style={{ marginBottom: 20 }}>Investment Performance</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
          <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}K`} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="invested" name="Invested" stroke="#6366f1" strokeWidth={2} dot={{ r: 4, fill: '#6366f1' }} />
          <Line type="monotone" dataKey="current" name="Current" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
