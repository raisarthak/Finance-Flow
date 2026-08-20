import Badge from '../UI/Badge';
import {
  Utensils, Car, ShoppingBag, Zap, Film, Heart,
  GraduationCap, Home, Shield, Sparkles, DollarSign, Briefcase
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Food & Dining': Utensils,
  'Transport': Car,
  'Shopping': ShoppingBag,
  'Utilities': Zap,
  'Entertainment': Film,
  'Healthcare': Heart,
  'Education': GraduationCap,
  'Rent': Home,
  'Insurance': Shield,
  'Personal Care': Sparkles,
  'Salary': DollarSign,
  'Freelance': Briefcase,
};

const CATEGORY_COLORS = {
  'Food & Dining': '#ef4444',
  'Transport': '#f97316',
  'Shopping': '#eab308',
  'Utilities': '#22c55e',
  'Entertainment': '#3b82f6',
  'Healthcare': '#8b5cf6',
  'Education': '#ec4899',
  'Rent': '#6366f1',
  'Insurance': '#14b8a6',
  'Personal Care': '#f43f5e',
  'Salary': '#10b981',
  'Freelance': '#06b6d4',
};

export default function RecentTransactions({ transactions = [] }) {
  function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  return (
    <div>
      <div className="card-header">
        <h3 className="card-title">Recent Transactions</h3>
        <Badge variant="default">{transactions.length} items</Badge>
      </div>
      {transactions.length === 0 ? (
        <p className="text-muted" style={{ textAlign: 'center', padding: '20px 0' }}>No transactions yet</p>
      ) : (
        transactions.slice(0, 6).map(tx => {
          const Icon = CATEGORY_ICONS[tx.category] || DollarSign;
          const color = CATEGORY_COLORS[tx.category] || '#6366f1';
          return (
            <div className="transaction-row" key={tx._id}>
              <div className="transaction-icon" style={{ background: color + '18', color }}>
                <Icon size={18} />
              </div>
              <div className="transaction-details">
                <div className="transaction-desc">{tx.description || tx.category}</div>
                <div className="transaction-category">{tx.category} · {tx.accountId?.name || 'Account'}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className={`transaction-amount ${tx.type}`}>
                  {tx.type === 'income' ? '+' : '-'}₹{tx.amount.toLocaleString()}
                </div>
                <div className="transaction-date">{formatDate(tx.date)}</div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
