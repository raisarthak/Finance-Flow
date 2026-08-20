import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, DollarSign, Plus, BarChart3, ArrowLeftRight } from 'lucide-react';
import { useUser } from '../context/UserContext';
import KPICard from '../components/Dashboard/KPICard';
import RecentTransactions from '../components/Dashboard/RecentTransactions';
import BudgetProgress from '../components/Dashboard/BudgetProgress';
import IncomeExpenseChart from '../components/Charts/IncomeExpenseChart';
import SpendingPieChart from '../components/Charts/SpendingPieChart';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import { getDashboardSummary, getDashboardCharts } from '../services/dashboardService';
import { getTransactions } from '../services/transactionService';
import { getCurrentBudget } from '../services/budgetService';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [recentTx, setRecentTx] = useState([]);
  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [summaryData, chartsData, txData, budgetData] = await Promise.all([
        getDashboardSummary(),
        getDashboardCharts(6),
        getTransactions({ limit: 6 }),
        getCurrentBudget()
      ]);
      setSummary(summaryData);
      setCharts(chartsData);
      setRecentTx(txData.transactions || []);
      setBudget(budgetData);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  const firstName = user?.name?.split(' ')[0] || 'there';
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  return (
    <div>
      {/* Hero Welcome Section */}
      <div className="hero-welcome">
        <h1 className="hero-greeting">
          {getGreeting()}, <span className="hero-greeting-highlight">{firstName}</span> 👋
        </h1>
        <p className="hero-date">{today}</p>
        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-label">Net Worth</span>
            <span className="hero-stat-value" style={{ color: 'var(--accent-primary-light)' }}>
              ₹{summary?.netWorth?.toLocaleString() || '0'}
            </span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-label">This Month</span>
            <span className="hero-stat-value text-green">
              +₹{summary?.monthlyIncome?.toLocaleString() || '0'}
            </span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-label">Spent</span>
            <span className="hero-stat-value text-red">
              -₹{summary?.monthlyExpenses?.toLocaleString() || '0'}
            </span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-label">Savings Rate</span>
            <span className="hero-stat-value" style={{ color: (summary?.savingsRate || 0) >= 20 ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
              {summary?.savingsRate || 0}%
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="quick-action-btn" onClick={() => navigate('/transactions')}>
          <span className="quick-action-icon green"><Plus size={15} /></span>
          Add Transaction
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/accounts')}>
          <span className="quick-action-icon blue"><Wallet size={15} /></span>
          View Accounts
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/reports')}>
          <span className="quick-action-icon purple"><BarChart3 size={15} /></span>
          View Reports
        </button>
        <button className="quick-action-btn" onClick={() => navigate('/investments')}>
          <span className="quick-action-icon green"><TrendingUp size={15} /></span>
          Portfolio
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KPICard
          label="Total Balance"
          value={summary?.totalBalance || 0}
          icon={Wallet}
          variant="primary"
        />
        <KPICard
          label="Monthly Income"
          value={summary?.monthlyIncome || 0}
          icon={TrendingUp}
          variant="green"
          trend={summary?.trends?.income}
          trendLabel="vs last month"
        />
        <KPICard
          label="Monthly Expenses"
          value={summary?.monthlyExpenses || 0}
          icon={TrendingDown}
          variant="red"
          trend={summary?.trends?.expenses}
          trendLabel="vs last month"
        />
        <KPICard
          label="Savings Rate"
          value={summary?.savingsRate || 0}
          prefix=""
          icon={PiggyBank}
          variant="amber"
        />
        <KPICard
          label="Net Worth"
          value={summary?.netWorth || 0}
          icon={DollarSign}
          variant="blue"
        />
      </div>

      {/* Charts Row */}
      <div className="charts-grid">
        <IncomeExpenseChart data={charts?.savingsData || []} />
        <SpendingPieChart data={charts?.categoryData || []} />
      </div>

      {/* Recent Transactions + Budget */}
      <div className="dashboard-grid">
        <div className="card">
          <RecentTransactions transactions={recentTx} />
        </div>
        <div className="card">
          <BudgetProgress budget={budget} />
        </div>
      </div>
    </div>
  );
}
