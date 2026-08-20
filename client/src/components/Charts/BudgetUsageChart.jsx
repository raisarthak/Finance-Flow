import { RadialBarChart, RadialBar, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function BudgetUsageChart({ budget }) {
  if (!budget || !budget.categories) return null;

  const data = budget.categories
    .filter(c => c.limit > 0)
    .map((cat, i) => ({
      name: cat.name,
      value: cat.limit > 0 ? Math.min(((cat.spent || 0) / cat.limit) * 100, 100) : 0,
      fill: cat.color || '#6366f1'
    }))
    .sort((a, b) => a.value - b.value)
    .slice(0, 6);

  return (
    <div className="card animate-in">
      <h3 className="card-title" style={{ marginBottom: 20 }}>Budget Usage by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="20%"
          outerRadius="90%"
          data={data}
          startAngle={180}
          endAngle={0}
        >
          <RadialBar
            dataKey="value"
            cornerRadius={4}
            background={{ fill: 'var(--bg-input)' }}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value, entry) => {
              const item = data.find(d => d.name === value);
              return `${value} (${item?.value?.toFixed(0)}%)`;
            }}
          />
          <Tooltip formatter={(value) => `${value.toFixed(0)}%`} />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
