import { Loader2 } from 'lucide-react';

export default function Button({ children, variant = 'primary', size, loading, icon: Icon, className = '', ...props }) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size === 'sm' ? 'btn-sm' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} disabled={loading || props.disabled} {...props}>
      {loading ? <Loader2 size={16} className="spin" style={{ animation: 'spin 0.8s linear infinite' }} /> : Icon && <Icon size={16} />}
      {children}
    </button>
  );
}
