import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { useTheme } from '../context/ThemeContext';
import { Save } from 'lucide-react';
import Button from '../components/UI/Button';
import Input from '../components/UI/Input';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { useToast } from '../context/ToastContext';

export default function SettingsPage() {
  const toast = useToast();
  const { user, loading, updateUser } = useUser();
  const { isDark, toggleTheme } = useTheme();
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (loading) return <LoadingSpinner />;

  async function handleSave() {
    setSaving(true);
    try {
      await updateUser(form);
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleDarkMode() {
    toggleTheme();
    try {
      await updateUser({ preferences: { ...user.preferences, darkMode: !isDark } });
    } catch (err) {
      // Theme already toggled visually
    }
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your profile and preferences</p>
        </div>
        {saved && (
          <span style={{ color: 'var(--accent-green)', fontSize: 13, fontWeight: 600 }}>✓ Saved successfully</span>
        )}
      </div>

      {/* Profile Section */}
      <div className="settings-section">
        <h3 className="settings-section-title">Profile</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', background: 'var(--gradient-primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
            fontSize: 28, fontWeight: 800
          }}>
            {form.name?.charAt(0) || 'A'}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{form.name || 'Alex Johnson'}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.role || 'customer'} · Member since {new Date(user?.createdAt).getFullYear()}</div>
          </div>
        </div>
        <div className="form-row">
          <Input label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <Button icon={Save} loading={saving} onClick={handleSave}>Save Changes</Button>
      </div>

      {/* Appearance */}
      <div className="settings-section">
        <h3 className="settings-section-title">Appearance</h3>
        <div className="settings-row">
          <div>
            <div className="settings-label">Dark Mode</div>
            <div className="settings-desc">Switch between dark and light themes</div>
          </div>
          <label className="toggle">
            <input type="checkbox" checked={isDark} onChange={handleToggleDarkMode} />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>

      {/* Preferences */}
      <div className="settings-section">
        <h3 className="settings-section-title">Preferences</h3>
        <div className="settings-row">
          <div>
            <div className="settings-label">Currency</div>
            <div className="settings-desc">Default currency for displaying amounts</div>
          </div>
          <select className="form-select" style={{ width: 120 }} defaultValue={user?.preferences?.currency || 'USD'}>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="INR">INR (₹)</option>
            <option value="JPY">JPY (¥)</option>
          </select>
        </div>
        <div className="settings-row">
          <div>
            <div className="settings-label">Notifications</div>
            <div className="settings-desc">Receive alerts for budget limits, bills, and unusual spending</div>
          </div>
          <label className="toggle">
            <input type="checkbox" defaultChecked={user?.preferences?.notifications !== false} />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>

      {/* About */}
      <div className="settings-section">
        <h3 className="settings-section-title">About</h3>
        <div className="settings-row">
          <div>
            <div className="settings-label">FinanceFlow Dashboard</div>
            <div className="settings-desc">Version 1.0.0 · Built with React, Express, MongoDB</div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="settings-section danger-zone">
        <h3 className="settings-section-title text-red">Danger Zone</h3>
        <div className="settings-row">
          <div>
            <div className="settings-label">Delete Account</div>
            <div className="settings-desc">Permanently delete your account and all associated data. This action cannot be undone.</div>
          </div>
          <Button
            variant="danger"
            onClick={() => {
              if (window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
                toast.error('Account deletion is disabled in this demo.');
              }
            }}
          >
            Delete Account
          </Button>
        </div>
      </div>
    </div>
  );
}
