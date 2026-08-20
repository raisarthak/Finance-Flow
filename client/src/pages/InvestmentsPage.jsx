import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';
import InvestmentGrowthChart from '../components/Charts/InvestmentGrowthChart';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { getPortfolio, createInvestment, updateInvestment, deleteInvestment } from '../services/investmentService';
import { useToast } from '../context/ToastContext';

const TYPE_COLORS = {
  stocks: '#3b82f6', mutual_funds: '#8b5cf6', crypto: '#f59e0b',
  gold: '#eab308', fixed_deposit: '#10b981', bonds: '#06b6d4', real_estate: '#ec4899'
};

const TYPE_LABELS = {
  stocks: 'Stocks', mutual_funds: 'Mutual Funds', crypto: 'Cryptocurrency',
  gold: 'Gold', fixed_deposit: 'Fixed Deposit', bonds: 'Bonds', real_estate: 'Real Estate'
};

export default function InvestmentsPage() {
  const toast = useToast();
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInv, setEditingInv] = useState(null);
  const [form, setForm] = useState({
    name: '', symbol: '', type: 'stocks', purchasePrice: '', currentPrice: '',
    quantity: '', purchaseDate: new Date().toISOString().split('T')[0], notes: ''
  });

  useEffect(() => { loadPortfolio(); }, []);

  async function loadPortfolio() {
    try {
      const data = await getPortfolio();
      setPortfolio(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingInv(null);
    setForm({ name: '', symbol: '', type: 'stocks', purchasePrice: '', currentPrice: '', quantity: '', purchaseDate: new Date().toISOString().split('T')[0], notes: '' });
    setModalOpen(true);
  }

  function openEdit(inv) {
    setEditingInv(inv);
    setForm({
      name: inv.name, symbol: inv.symbol, type: inv.type,
      purchasePrice: inv.purchasePrice.toString(), currentPrice: inv.currentPrice.toString(),
      quantity: inv.quantity.toString(), purchaseDate: new Date(inv.purchaseDate).toISOString().split('T')[0],
      notes: inv.notes || ''
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      ...form,
      purchasePrice: parseFloat(form.purchasePrice),
      currentPrice: parseFloat(form.currentPrice),
      quantity: parseFloat(form.quantity)
    };
    try {
      if (editingInv) {
        await updateInvestment(editingInv._id, payload);
        toast.success('Investment updated successfully');
      } else {
        await createInvestment(payload);
        toast.success('Investment created successfully');
      }
      setModalOpen(false);
      loadPortfolio();
    } catch (err) {
      toast.error(err.message || 'Failed to save investment');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this investment?')) return;
    try {
      await deleteInvestment(id);
      toast.success('Investment deleted');
      loadPortfolio();
    } catch (err) {
      toast.error(err.message || 'Failed to delete investment');
    }
  }

  if (loading) return <LoadingSpinner />;

  const allocationData = portfolio?.byType ? Object.entries(portfolio.byType).map(([type, data]) => ({
    name: TYPE_LABELS[type] || type,
    value: data.current,
    fill: TYPE_COLORS[type] || '#6366f1'
  })) : [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Investments</h1>
          <p className="page-subtitle">{portfolio?.holdings?.length || 0} holdings</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>Add Investment</Button>
      </div>

      {!portfolio || !portfolio.holdings?.length ? (
        <EmptyState icon={TrendingUp} title="No investments" message="Add your first investment to track your portfolio." actionLabel="Add Investment" onAction={openCreate} />
      ) : (
        <>
          {/* Portfolio KPIs */}
          <div className="kpi-grid">
            <div className="kpi-card blue animate-in">
              <span className="kpi-card-label">Total Invested</span>
              <div className="kpi-card-value">₹{portfolio.totalInvested?.toLocaleString()}</div>
            </div>
            <div className="kpi-card green animate-in">
              <span className="kpi-card-label">Current Value</span>
              <div className="kpi-card-value">₹{portfolio.currentValue?.toLocaleString()}</div>
            </div>
            <div className={`kpi-card ${portfolio.totalProfitLoss >= 0 ? 'green' : 'red'} animate-in`}>
              <span className="kpi-card-label">Total P&L</span>
              <div className="kpi-card-value" style={{ color: portfolio.totalProfitLoss >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {portfolio.totalProfitLoss >= 0 ? '+' : ''}₹{portfolio.totalProfitLoss?.toLocaleString()}
              </div>
            </div>
            <div className="kpi-card amber animate-in">
              <span className="kpi-card-label">Return</span>
              <div className="kpi-card-value" style={{ color: portfolio.profitLossPercent >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {portfolio.profitLossPercent >= 0 ? '+' : ''}{portfolio.profitLossPercent?.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="charts-grid">
            <InvestmentGrowthChart investments={portfolio.holdings} />
            <div className="card animate-in">
              <h3 className="card-title" style={{ marginBottom: 20 }}>Portfolio Allocation</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={allocationData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" stroke="none">
                    {allocationData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `₹${v.toLocaleString()}`} />
                  <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Holdings Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 className="card-title">Holdings</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'right' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Buy Price</th>
                    <th style={{ textAlign: 'right' }}>Current</th>
                    <th style={{ textAlign: 'right' }}>Invested</th>
                    <th style={{ textAlign: 'right' }}>Value</th>
                    <th style={{ textAlign: 'right' }}>P&L</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.holdings.map(inv => {
                    const invested = inv.purchasePrice * inv.quantity;
                    const current = inv.currentPrice * inv.quantity;
                    const pl = current - invested;
                    const plPercent = invested > 0 ? ((pl / invested) * 100) : 0;
                    return (
                      <tr key={inv._id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{inv.name}</div>
                          {inv.symbol && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{inv.symbol}</div>}
                        </td>
                        <td><Badge variant={inv.type}>{TYPE_LABELS[inv.type]}</Badge></td>
                        <td style={{ textAlign: 'right' }}>{inv.quantity}</td>
                        <td style={{ textAlign: 'right' }}>₹{inv.purchasePrice.toLocaleString()}</td>
                        <td style={{ textAlign: 'right' }}>₹{inv.currentPrice.toLocaleString()}</td>
                        <td style={{ textAlign: 'right' }}>₹{invested.toLocaleString()}</td>
                        <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{current.toLocaleString()}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div className={`flex items-center gap-2 ${pl >= 0 ? 'text-green' : 'text-red'}`} style={{ justifyContent: 'flex-end', fontWeight: 600 }}>
                            {pl >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {pl >= 0 ? '+' : ''}₹{pl.toLocaleString()} ({plPercent.toFixed(1)}%)
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => openEdit(inv)}><Edit3 size={13} /></button>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(inv._id)}><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingInv ? 'Edit Investment' : 'Add Investment'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingInv ? 'Update' : 'Add'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <Input label="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Apple Inc." required />
            <Input label="Symbol" value={form.symbol} onChange={e => setForm({ ...form, symbol: e.target.value })} placeholder="e.g., AAPL" />
          </div>
          <Select label="Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} options={Object.entries(TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))} />
          <div className="form-row">
            <Input label="Purchase Price" type="number" step="0.01" min="0" value={form.purchasePrice} onChange={e => setForm({ ...form, purchasePrice: e.target.value })} required />
            <Input label="Current Price" type="number" step="0.01" min="0" value={form.currentPrice} onChange={e => setForm({ ...form, currentPrice: e.target.value })} required />
          </div>
          <div className="form-row">
            <Input label="Quantity" type="number" step="0.001" min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} required />
            <Input label="Purchase Date" type="date" value={form.purchaseDate} onChange={e => setForm({ ...form, purchaseDate: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Optional notes..." />
          </div>
        </form>
      </Modal>
    </div>
  );
}
