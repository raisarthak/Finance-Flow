import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, ArrowLeftRight, Search } from 'lucide-react';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';
import { useToast } from '../context/ToastContext';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from '../services/transactionService';
import { getAccounts } from '../services/accountService';

const CATEGORIES = {
  expense: ['Food & Dining', 'Transport', 'Shopping', 'Utilities', 'Entertainment', 'Healthcare', 'Education', 'Rent', 'Insurance', 'Personal Care'],
  income: ['Salary', 'Freelance', 'Investments', 'Rental Income', 'Refund', 'Bonus'],
  transfer: ['Transfer']
};

export default function TransactionsPage() {
  const toast = useToast();
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ type: '', category: '', accountId: '' });
  const [form, setForm] = useState({
    type: 'expense', amount: '', category: 'Food & Dining', description: '',
    date: new Date().toISOString().split('T')[0], accountId: '', paymentMethod: 'card', notes: ''
  });

  useEffect(() => { loadData(); }, []);
  useEffect(() => { loadTransactions(1); }, [filters]);

  async function loadData() {
    try {
      const accs = await getAccounts();
      setAccounts(accs);
      await loadTransactions(1);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadTransactions(page) {
    setLoading(true);
    try {
      const params = { page, limit: 15, ...filters };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const data = await getTransactions(params);
      setTransactions(data.transactions || []);
      setPagination(data.pagination || { total: 0, page: 1, pages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingTx(null);
    setForm({
      type: 'expense', amount: '', category: 'Food & Dining', description: '',
      date: new Date().toISOString().split('T')[0], accountId: accounts[0]?._id || '', paymentMethod: 'card', notes: ''
    });
    setModalOpen(true);
  }

  function openEdit(tx) {
    setEditingTx(tx);
    setForm({
      type: tx.type, amount: tx.amount.toString(), category: tx.category, description: tx.description,
      date: new Date(tx.date).toISOString().split('T')[0], accountId: tx.accountId?._id || tx.accountId,
      paymentMethod: tx.paymentMethod, notes: tx.notes || ''
    });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, amount: parseFloat(form.amount) };
    try {
      if (editingTx) {
        await updateTransaction(editingTx._id, payload);
        toast.success('Transaction updated successfully');
      } else {
        await createTransaction(payload);
        toast.success('Transaction added successfully');
      }
      setModalOpen(false);
      loadTransactions(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to save transaction');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await deleteTransaction(id);
      toast.success('Transaction deleted');
      loadTransactions(pagination.page);
    } catch (err) {
      toast.error(err.message || 'Failed to delete transaction');
    }
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const currentCategories = CATEGORIES[form.type] || CATEGORIES.expense;

  // Compute inline stats from visible transactions
  const filteredTx = searchQuery
    ? transactions.filter(tx =>
        (tx.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.notes || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tx.category || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : transactions;

  const totalIncome = filteredTx.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpense = filteredTx.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const netAmount = totalIncome - totalExpense;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{pagination.total} total transactions</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>Add Transaction</Button>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="transaction-search">
          <Search className="transaction-search-icon" size={16} />
          <input
            type="text"
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <select className="form-select" value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })} style={{ minWidth: 140 }}>
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
          <option value="transfer">Transfer</option>
        </select>
        <select className="form-select" value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })} style={{ minWidth: 160 }}>
          <option value="">All Categories</option>
          {[...CATEGORIES.expense, ...CATEGORIES.income].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select className="form-select" value={filters.accountId} onChange={e => setFilters({ ...filters, accountId: e.target.value })} style={{ minWidth: 160 }}>
          <option value="">All Accounts</option>
          {accounts.map(a => (
            <option key={a._id} value={a._id}>{a.name}</option>
          ))}
        </select>
      </div>

      {/* Inline Stats */}
      {filteredTx.length > 0 && (
        <div className="inline-stats">
          <div className="inline-stat">
            <div className="inline-stat-dot" style={{ background: 'var(--accent-green)' }} />
            <span className="inline-stat-label">Income</span>
            <span className="inline-stat-value text-green">+${totalIncome.toLocaleString()}</span>
          </div>
          <div className="inline-stat-divider" />
          <div className="inline-stat">
            <div className="inline-stat-dot" style={{ background: 'var(--accent-red)' }} />
            <span className="inline-stat-label">Expenses</span>
            <span className="inline-stat-value text-red">-${totalExpense.toLocaleString()}</span>
          </div>
          <div className="inline-stat-divider" />
          <div className="inline-stat">
            <div className="inline-stat-dot" style={{ background: netAmount >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }} />
            <span className="inline-stat-label">Net</span>
            <span className={`inline-stat-value ${netAmount >= 0 ? 'text-green' : 'text-red'}`}>
              {netAmount >= 0 ? '+' : '-'}${Math.abs(netAmount).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? <LoadingSpinner /> : filteredTx.length === 0 ? (
          <EmptyState icon={ArrowLeftRight} title={searchQuery ? 'No matching transactions' : 'No transactions'} message={searchQuery ? 'Try a different search term.' : 'Add your first transaction to start tracking.'} actionLabel={searchQuery ? undefined : 'Add Transaction'} onAction={searchQuery ? undefined : openCreate} />
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Account</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTx.map(tx => (
                  <tr key={tx._id}>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(tx.date)}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{tx.description || tx.category}</div>
                      {tx.notes && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tx.notes}</div>}
                    </td>
                    <td><Badge variant={tx.type === 'income' ? 'income' : 'default'}>{tx.category}</Badge></td>
                    <td style={{ fontSize: 12 }}>{tx.accountId?.name || '—'}</td>
                    <td><Badge variant={tx.type}>{tx.type}</Badge></td>
                    <td style={{ textAlign: 'right' }}>
                      <span className={`font-bold ${tx.type === 'income' ? 'text-green' : 'text-red'}`}>
                        {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString()}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div className="flex gap-2" style={{ justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(tx)}><Edit3 size={13} /></button>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(tx._id)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button className="pagination-btn" disabled={pagination.page <= 1} onClick={() => loadTransactions(pagination.page - 1)}>‹</button>
          {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => i + 1).map(p => (
            <button key={p} className={`pagination-btn ${pagination.page === p ? 'active' : ''}`} onClick={() => loadTransactions(p)}>{p}</button>
          ))}
          <button className="pagination-btn" disabled={pagination.page >= pagination.pages} onClick={() => loadTransactions(pagination.page + 1)}>›</button>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTx ? 'Edit Transaction' : 'Add Transaction'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingTx ? 'Update' : 'Add'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <Select label="Type" value={form.type} onChange={e => {
              const type = e.target.value;
              const cats = CATEGORIES[type] || CATEGORIES.expense;
              setForm({ ...form, type, category: cats[0] });
            }} options={[
              { value: 'income', label: 'Income' },
              { value: 'expense', label: 'Expense' },
              { value: 'transfer', label: 'Transfer' },
            ]} />
            <Input label="Amount" type="number" step="0.01" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required placeholder="0.00" />
          </div>
          <div className="form-row">
            <Select label="Category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} options={currentCategories.map(c => ({ value: c, label: c }))} />
            <Select label="Account" value={form.accountId} onChange={e => setForm({ ...form, accountId: e.target.value })} options={accounts.map(a => ({ value: a._id, label: a.name }))} />
          </div>
          <Input label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What was this for?" />
          <div className="form-row">
            <Input label="Date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
            <Select label="Payment Method" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} options={[
              { value: 'card', label: 'Card' },
              { value: 'cash', label: 'Cash' },
              { value: 'bank_transfer', label: 'Bank Transfer' },
              { value: 'upi', label: 'UPI' },
              { value: 'check', label: 'Check' },
              { value: 'other', label: 'Other' },
            ]} />
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
