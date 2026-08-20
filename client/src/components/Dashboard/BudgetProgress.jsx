export default function BudgetProgress({ budget }) {
  if (!budget || !budget.categories) return null;

  const totalSpent = budget.totalSpent || budget.categories.reduce((s, c) => s + (c.spent || 0), 0);
  const totalLimit = budget.totalLimit || 0;
  const overallPercent = totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0;

  return (
    <div>
      <div className="card-header">
        <h3 className="card-title">Budget Overview</h3>
        <span className="text-muted" style={{ fontSize: 12 }}>
          ${totalSpent.toLocaleString()} / ${totalLimit.toLocaleString()}
        </span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <div className="progress-bar" style={{ height: 10 }}>
          <div
            className={`progress-fill ${overallPercent > 90 ? 'red' : overallPercent > 70 ? 'amber' : 'green'}`}
            style={{ width: `${overallPercent}%` }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{overallPercent.toFixed(0)}% used</span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            ${Math.max(totalLimit - totalSpent, 0).toLocaleString()} remaining
          </span>
        </div>
      </div>

      {budget.categories.slice(0, 5).map(cat => {
        const percent = cat.limit > 0 ? Math.min((cat.spent / cat.limit) * 100, 100) : 0;
        const isOver = cat.spent > cat.limit;
        return (
          <div className="budget-item" key={cat.name} style={{ padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
            <div className="budget-item-header">
              <div className="budget-item-name">
                <span className="budget-item-dot" style={{ background: cat.color || 'var(--accent-primary)' }} />
                {cat.name}
                {isOver && <span style={{ fontSize: 10, color: 'var(--accent-red)', fontWeight: 700 }}>OVER</span>}
              </div>
              <div className="budget-item-amounts">
                <span style={{ color: isOver ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                  ${(cat.spent || 0).toLocaleString()}
                </span>{' '}
                / ${cat.limit.toLocaleString()}
              </div>
            </div>
            <div className="progress-bar" style={{ height: 6 }}>
              <div
                className={`progress-fill ${percent > 90 ? 'red' : percent > 70 ? 'amber' : 'green'}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
