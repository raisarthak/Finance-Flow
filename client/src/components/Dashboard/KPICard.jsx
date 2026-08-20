import { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

function useCountUp(end, duration = 1000) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    if (end === 0 || end === undefined) { setValue(0); return; }
    let startTime;
    const start = 0;
    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(start + (end - start) * eased);
      if (progress < 1) ref.current = requestAnimationFrame(animate);
    }
    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [end, duration]);

  return value;
}

export default function KPICard({ label, value, prefix = '$', trend, trendLabel, icon: Icon, variant = 'primary' }) {
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const animated = useCountUp(Math.abs(numericValue));
  const isNegative = numericValue < 0;
  const trendNum = parseFloat(trend);
  const trendUp = trendNum > 0;

  function formatValue(val) {
    if (Math.abs(val) >= 1000000) return (val / 1000000).toFixed(1) + 'M';
    if (Math.abs(val) >= 1000) return (val / 1000).toFixed(1) + 'K';
    return val.toFixed(val % 1 === 0 ? 0 : 2);
  }

  return (
    <div className={`kpi-card ${variant} animate-in`}>
      <div className="kpi-card-header">
        <span className="kpi-card-label">{label}</span>
        {Icon && (
          <div className={`kpi-card-icon ${variant}`}>
            <Icon size={20} />
          </div>
        )}
      </div>
      <div className="kpi-card-value">
        {isNegative && '-'}{prefix}{formatValue(animated)}
      </div>
      {trend !== undefined && (
        <span className={`kpi-card-trend ${trendUp ? 'up' : 'down'}`}>
          {trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(trendNum).toFixed(1)}%
          {trendLabel && <span style={{ fontWeight: 400, marginLeft: 2 }}>{trendLabel}</span>}
        </span>
      )}
    </div>
  );
}
