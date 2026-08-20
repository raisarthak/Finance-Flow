import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import {
  LayoutDashboard, Wallet, ArrowLeftRight, PiggyBank,
  TrendingUp, BarChart3, Bell, Settings, ChevronLeft, ChevronRight, Plus
} from 'lucide-react';
import { getNotifications } from '../../services/notificationService';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/accounts', icon: Wallet, label: 'Accounts' },
  { path: '/transactions', icon: ArrowLeftRight, label: 'Transactions' },
  { path: '/budgets', icon: PiggyBank, label: 'Budgets' },
  { path: '/investments', icon: TrendingUp, label: 'Investments' },
  { path: '/reports', icon: BarChart3, label: 'Reports' },
  { path: '/notifications', icon: Bell, label: 'Notifications', hasBadge: true },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }) {
  const { user } = useUser();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const navRef = useRef(null);

  useEffect(() => {
    loadUnread();
  }, []);

  async function loadUnread() {
    try {
      const data = await getNotifications('true');
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      // silently fail
    }
  }

  function handleNavHover(e) {
    if (!collapsed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipStyle({ top: rect.top + rect.height / 2 - 14 });
  }

  return (
    <>
      <div className={`mobile-overlay ${mobileOpen ? 'active' : ''}`} onClick={onMobileClose} />
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        <button className="sidebar-toggle" onClick={onToggle}>
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">FF</div>
          <span className="sidebar-logo-text">FinanceFlow</span>
        </div>

        <nav className="sidebar-nav" ref={navRef}>
          {navItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onMobileClose}
              onMouseEnter={handleNavHover}
            >
              <item.icon className="sidebar-nav-icon" size={20} />
              <span className="sidebar-nav-label">{item.label}</span>
              {item.hasBadge && unreadCount > 0 && (
                <span className="sidebar-nav-badge">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
              {collapsed && (
                <span className="sidebar-tooltip" style={tooltipStyle}>{item.label}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Quick Add Button */}
        <div style={{ padding: '0 8px 8px' }}>
          <button
            className="sidebar-quick-add"
            onClick={() => { navigate('/transactions'); onMobileClose(); }}
            title="Quick Add Transaction"
          >
            <Plus size={18} />
            <span>Quick Add</span>
          </button>
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name || 'Alex Johnson'}</div>
              <div className="sidebar-user-email">{user?.email || 'alex@financedash.com'}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
