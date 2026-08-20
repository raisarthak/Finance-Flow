import { useState, useEffect } from 'react';
import { Plus, PiggyBank, Trash2 } from 'lucide-react';
import Button from '../components/UI/Button';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';
import BudgetUsageChart from '../components/Charts/BudgetUsageChart';
import { getCurrentBudget, createBudget, updateBudget, deleteBudget, getBudgets } from '../services/budgetService';
import { useToast } from '../context/ToastContext';

const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', limit: 800, color: '#ef4444' },
  { name: 'Transport', limit: 300, color: '#f97316' },
  { name: 'Shopping', limit: 500, color: '#eab308' },
  { name: 'Utilities', limit: 400, color: '#22c55e' },
  { name: 'Entertainment', limit: 200, color: '#3b82f6' },
  { name: 'Healthcare', limit: 300, color: '#8b5cf6' },
  { name: 'Rent', limit: 2200, color: '#6366f1' },
  { name: 'Personal Care', limit: 150, color: '#f43f5e' },
  { name: 'Education', limit: 200, color: '#ec4899' },
  { name: 'Insurance', limit: 450, color: '#14b8a6' },
];

export default function BudgetPage() {
  const toast = useToast();
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES.map(c => ({ ...c, limit: c.limit.toString() })));

  useEffect(() => { loadBudget(); }, []);

  async function loadBudget() {
    try {
      const data = await getCurrentBudget();
      setBudget(data);
      if (data && data.categories) {
        setCategories(data.categories.map(c => ({ ...c, limit: c.limit.toString() })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBudget(e) {
    e.preventDefault();
    const now = new Date();
    const payload = {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      totalLimit: categories.reduce((sum, c) => sum + (parseFloat(c.limit) || 0), 0),
      categories: categories.map(c => ({ name: c.name, limit: parseFloat(c.limit) || 0, color: c.color }))
    };
    try {
      if (budget && budget._id) {
        await updateBudget(budget._id, payload);
        toast.success('Budget updated successfully');
      } else {
        await createBudget(payload);
        toast.success('Budget created successfully');
      }
      setModalOpen(false);
      loadBudget();
    } catch (err) {
      toast.error(err.message || 'Failed to save budget');
    }
  }

  async function handleDeleteBudget() {
    if (!budget?._id) return;
    if (!window.confirm('Delete this month\'s budget?')) return;
    try {
      await deleteBudget(budget._id);
      toast.success('Budget deleted');
      setBudget(null);
    } catch (err) {
      toast.error(err.message || 'Failed to delete budget');
    }
  }

  function updateCategoryLimit(index, value) {
    const updated = [...categories];
    updated[index] = { ...updated[index], limit: value };
    setCategories(updated);
  }

  if (loading) return <LoadingSpinner />;

  const totalLimit = budget?.totalLimit || 0;
  const totalSpent = budget?.totalSpent || budget?.categories?.reduce((s, c) => s + (c.spent || 0), 0) || 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Budget</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          {budget && <Button variant="danger" icon={Trash2} size="sm" onClick={handleDeleteBudget}>Delete</Button>}
          <Button icon={budget ? undefined : Plus} onClick={() => setModalOpen(true)}>
            {budget ? 'Edit Budget' : 'Create Budget'}
          </Button>
        </div>
      </div>

      {!budget ? (
        <EmptyState icon={PiggyBank} title="No budget set" message="Create a monthly budget to track your spending against limits." actionLabel="Create Budget" onAction={() => setModalOpen(true)} />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="kpi-grid" style={{ marginBottom: 24 }}>
            <div className="kpi-card green animate-in">
              <span className="kpi-card-label">Total Budget</span>
              <div className="kpi-card-value">₹{totalLimit.toLocaleString()}</div>
            </div>
            <div className="kpi-card red animate-in">
              <span className="kpi-card-label">Total Spent</span>
              <div className="kpi-card-value">₹{totalSpent.toLocaleString()}</div>
            </div>
            <div className="kpi-card amber animate-in">
              <span className="kpi-card-label">Remaining</span>
              <div className="kpi-card-value">₹{Math.max(totalLimit - totalSpent, 0).toLocaleString()}</div>
            </div>
            <div className="kpi-card primary animate-in">
              <span className="kpi-card-label">Usage</span>
              <div className="kpi-card-value">{totalLimit > 0 ? ((totalSpent / totalLimit) * 100).toFixed(0) : 0}%</div>
            </div>
          </div>

          <div className="charts-grid">
            {/* Category Breakdown */}
            <div className="card">
              <h3 className="card-title" style={{ marginBottom: 20 }}>Category Breakdown</h3>
              {budget.categories?.map(cat => {
                const percent = cat.limit > 0 ? Math.min(((cat.spent || 0) / cat.limit) * 100, 100) : 0;
                const isOver = (cat.spent || 0) > cat.limit;
                return (
                  <div className="budget-item" key={cat.name}>
                    <div className="budget-item-header">
                      <div className="budget-item-name">
                        <span className="budget-item-dot" style={{ background: cat.color }} />
                        {cat.name}
                        {isOver && <span style={{ fontSize: 10, color: 'var(--accent-red)', fontWeight: 700, marginLeft: 6 }}>⚠ OVER BUDGET</span>}
                      </div>
                      <div className="budget-item-amounts">
                        <span style={{ color: isOver ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                          ₹{(cat.spent || 0).toLocaleString()}
                        </span>
                        {' / ₹'}{cat.limit.toLocaleString()}
                        <span style={{ marginLeft: 8, fontSize: 11, color: isOver ? 'var(--accent-red)' : 'var(--text-muted)' }}>
                          ({percent.toFixed(0)}%)
                        </span>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${percent > 90 ? 'red' : percent > 70 ? 'amber' : 'green'}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Budget Usage Chart */}
            <BudgetUsageChart budget={budget} />
          </div>
        </>
      )}

      {/* Create/Edit Budget Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={budget ? 'Edit Budget' : 'Create Monthly Budget'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateBudget}>{budget ? 'Update' : 'Create'}</Button>
          </>
        }
      >
        <form onSubmit={handleCreateBudget}>
          <p className="text-muted mb-4" style={{ fontSize: 13 }}>
            Set spending limits for each category. Total: ₹
            {categories.reduce((s, c) => s + (parseFloat(c.limit) || 0), 0).toLocaleString()}
          </p>
          {categories.map((cat, i) => (
            <div key={cat.name} className="flex items-center gap-3" style={{ marginBottom: 8 }}>
              <span className="budget-item-dot" style={{ background: cat.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{cat.name}</span>
              <input
                className="form-input"
                type="number"
                min="0"
                step="50"
                value={cat.limit}
                onChange={e => updateCategoryLimit(i, e.target.value)}
                style={{ width: 100, textAlign: 'right' }}
              />
            </div>
          ))}
        </form>
      </Modal>
    </div>
  );
}
