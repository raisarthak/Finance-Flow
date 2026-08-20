import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Wallet } from 'lucide-react';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import Modal from '../components/UI/Modal';
import Input from '../components/UI/Input';
import Select from '../components/UI/Select';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import EmptyState from '../components/UI/EmptyState';
import { useToast } from '../context/ToastContext';
import { getAccounts, createAccount, updateAccount, deleteAccount } from '../services/accountService';

const ACCOUNT_COLORS = ['#6366f1', '#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function AccountsPage() {
  const toast = useToast();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'checking', balance: '', currency: 'USD', institution: '', accountNumber: '', color: '#6366f1' });

  useEffect(() => { loadAccounts(); }, []);

  async function loadAccounts() {
    try {
      const data = await getAccounts();
      setAccounts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingAccount(null);
    setForm({ name: '', type: 'checking', balance: '', currency: 'USD', institution: '', accountNumber: '', color: ACCOUNT_COLORS[accounts.length % ACCOUNT_COLORS.length] });
    setModalOpen(true);
  }

  function openEdit(acc) {
    setEditingAccount(acc);
    setForm({ name: acc.name, type: acc.type, balance: acc.balance.toString(), currency: acc.currency, institution: acc.institution, accountNumber: acc.accountNumber, color: acc.color });
    setModalOpen(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { ...form, balance: parseFloat(form.balance) };
    try {
      if (editingAccount) {
        await updateAccount(editingAccount._id, payload);
        toast.success('Account updated successfully');
      } else {
        await createAccount(payload);
        toast.success('Account created successfully');
      }
      setModalOpen(false);
      loadAccounts();
    } catch (err) {
      toast.error(err.message || 'Failed to save account');
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this account? All associated transactions will be lost.')) return;
    try {
      await deleteAccount(id);
      toast.success('Account deleted');
      loadAccounts();
    } catch (err) {
      toast.error(err.message || 'Failed to delete account');
    }
  }

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Accounts</h1>
          <p className="page-subtitle">
            {accounts.length} accounts · Total Balance: ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
        <Button icon={Plus} onClick={openCreate}>Add Account</Button>
      </div>

      {accounts.length === 0 ? (
        <EmptyState icon={Wallet} title="No accounts yet" message="Add your first bank account to start tracking." actionLabel="Add Account" onAction={openCreate} />
      ) : (
        <div className="accounts-grid">
          {accounts.map(acc => (
            <div className="account-card animate-in" key={acc._id} style={{ '--card-color': acc.color }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: acc.color }} />
              <div className="account-card-header">
                <div>
                  <div className="account-card-name">{acc.name}</div>
                  <div className="account-card-institution">{acc.institution}</div>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-ghost btn-icon" onClick={() => openEdit(acc)}><Edit3 size={14} /></button>
                  <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(acc._id)}><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="account-card-balance" style={{ color: acc.balance < 0 ? 'var(--accent-red)' : 'var(--text-primary)' }}>
                {acc.balance < 0 ? '-' : ''}${Math.abs(acc.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
              <div className="account-card-footer">
                <Badge variant={acc.type}>{acc.type}</Badge>
                <div className="account-card-detail">{acc.accountNumber}</div>
                <Badge variant={acc.status}>{acc.status}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAccount ? 'Edit Account' : 'Add Account'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingAccount ? 'Update' : 'Create'}</Button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <Input label="Account Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., Primary Checking" required />
          <div className="form-row">
            <Select label="Account Type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} options={[
              { value: 'checking', label: 'Checking' },
              { value: 'savings', label: 'Savings' },
              { value: 'credit', label: 'Credit Card' },
              { value: 'investment', label: 'Investment' },
            ]} />
            <Input label="Balance" type="number" step="0.01" value={form.balance} onChange={e => setForm({ ...form, balance: e.target.value })} placeholder="0.00" required />
          </div>
          <Input label="Institution" value={form.institution} onChange={e => setForm({ ...form, institution: e.target.value })} placeholder="e.g., Chase Bank" />
          <div className="form-row">
            <Input label="Account Number" value={form.accountNumber} onChange={e => setForm({ ...form, accountNumber: e.target.value })} placeholder="****1234" />
            <div className="form-group">
              <label className="form-label">Color</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {ACCOUNT_COLORS.map(c => (
                  <div
                    key={c}
                    onClick={() => setForm({ ...form, color: c })}
                    style={{
                      width: 28, height: 28, borderRadius: '50%', background: c, cursor: 'pointer',
                      border: form.color === c ? '3px solid var(--text-primary)' : '3px solid transparent',
                      transition: 'border 150ms ease'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
