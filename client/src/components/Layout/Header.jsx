import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { Search, Bell, Sun, Moon, Menu } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getNotifications } from '../../services/notificationService';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/accounts': 'Accounts',
  '/transactions': 'Transactions',
  '/budgets': 'Budgets',
  '/investments': 'Investments',
  '/reports': 'Reports',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
};

export default function Header({ sidebarCollapsed, onMobileMenuClick }) {
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const title = PAGE_TITLES[location.pathname] || 'Dashboard';

  useEffect(() => {
    loadUnreadCount();
  }, [location.pathname]);

  async function loadUnreadCount() {
    try {
      const data = await getNotifications('true');
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      // Silently fail
    }
  }

  return (
    <header className={`header ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="header-left">
        <button
          className="header-icon-btn mobile-menu-btn"
          onClick={onMobileMenuClick}
          style={{ display: 'none' }}
          id="mobile-menu-toggle"
        >
          <Menu size={20} />
        </button>
        <h1 className="header-title">{title}</h1>
        <div className="header-search">
          <Search className="header-search-icon" size={16} />
          <input type="text" placeholder="Search transactions, accounts..." />
        </div>
      </div>

      <div className="header-right">
        <button className="header-icon-btn" onClick={toggleTheme} id="theme-toggle">
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button
          className="header-icon-btn"
          onClick={() => navigate('/notifications')}
          id="notification-bell"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="header-notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>
      </div>
    </header>
  );
}
