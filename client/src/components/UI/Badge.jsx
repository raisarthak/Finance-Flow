const VARIANT_MAP = {
  income: 'badge-green',
  expense: 'badge-red',
  transfer: 'badge-blue',
  savings: 'badge-green',
  checking: 'badge-blue',
  credit: 'badge-red',
  investment: 'badge-amber',
  active: 'badge-green',
  inactive: 'badge-amber',
  closed: 'badge-red',
  high: 'badge-red',
  critical: 'badge-red',
  medium: 'badge-amber',
  low: 'badge-green',
  stocks: 'badge-blue',
  mutual_funds: 'badge-purple',
  crypto: 'badge-amber',
  gold: 'badge-amber',
  fixed_deposit: 'badge-green',
  bonds: 'badge-blue',
  real_estate: 'badge-purple'
};

export default function Badge({ children, variant, className = '' }) {
  const badgeClass = VARIANT_MAP[variant] || 'badge-default';
  return (
    <span className={`badge ${badgeClass} ${className}`}>
      {children}
    </span>
  );
}
