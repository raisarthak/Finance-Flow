import { useState, useEffect } from 'react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import IncomeExpenseChart from '../components/Charts/IncomeExpenseChart';
import SpendingPieChart from '../components/Charts/SpendingPieChart';
import SavingsTrendChart from '../components/Charts/SavingsTrendChart';
import MonthlyComparisonChart from '../components/Charts/MonthlyComparisonChart';
import { getDashboardCharts } from '../services/dashboardService';
import { getTransactionCategories } from '../services/transactionService';

export default function ReportsPage() {
  const [charts, setCharts] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [months, setMonths] = useState(6);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadReports(); }, [months]);

  async function loadReports() {
    setLoading(true);
    try {
      const [chartsData, catData] = await Promise.all([
        getDashboardCharts(months),
        getTransactionCategories()
      ]);
      setCharts(chartsData);
      setCategoryData(catData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <LoadingSpinner />;

  // Calculate Health Score
  let healthScore = 0;
  let healthGrade = 'Needs Work';
  let savingsRate = 0;
  
  if (charts?.savingsData && charts.savingsData.length > 0) {
    const totalIncome = charts.savingsData.reduce((s, d) => s + d.income, 0);
    const totalSavings = charts.savingsData.reduce((s, d) => s + d.savings, 0);
    savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
    
    // Base score 50. Add up to 50 based on savings rate (target 20%)
    healthScore = Math.min(100, Math.max(0, 50 + (savingsRate * 2.5)));
    
    if (healthScore >= 90) healthGrade = 'Excellent';
    else if (healthScore >= 75) healthGrade = 'Good';
    else if (healthScore >= 60) healthGrade = 'Fair';
    else healthGrade = 'Needs Work';
  }
  
  // SVG Ring calculation
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (healthScore / 100) * circumference;
  const scoreColor = healthScore >= 75 ? 'var(--accent-green)' : healthScore >= 60 ? 'var(--accent-amber)' : 'var(--accent-red)';

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Financial Reports</h1>
          <p className="page-subtitle">Comprehensive analytics and insights</p>
        </div>
        <select
          className="form-select"
          value={months}
          onChange={e => setMonths(parseInt(e.target.value))}
          style={{ width: 160 }}
        >
          <option value={3}>Last 3 Months</option>
          <option value={6}>Last 6 Months</option>
          <option value={12}>Last 12 Months</option>
        </select>
      </div>

      {/* Summary Stats */}
      {charts?.savingsData && (
        <div className="kpi-grid" style={{ marginBottom: 24 }}>
          <div className="kpi-card green animate-in">
            <span className="kpi-card-label">Avg Monthly Income</span>
            <div className="kpi-card-value">
              ₹{(charts.savingsData.reduce((s, d) => s + d.income, 0) / charts.savingsData.length || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="kpi-card red animate-in">
            <span className="kpi-card-label">Avg Monthly Expenses</span>
            <div className="kpi-card-value">
              ₹{(charts.savingsData.reduce((s, d) => s + d.expenses, 0) / charts.savingsData.length || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="kpi-card primary animate-in">
            <span className="kpi-card-label">Avg Monthly Savings</span>
            <div className="kpi-card-value">
              ₹{(charts.savingsData.reduce((s, d) => s + d.savings, 0) / charts.savingsData.length || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
          </div>
        </div>
      )}

      {/* Health Score Widget */}
      <div className="health-score-card" style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 20, textAlign: 'left' }}>Financial Health Score</h3>
        <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
          <div className="health-score-ring">
            <svg width="160" height="160" viewBox="0 0 160 160">
              <circle className="health-score-ring-bg" cx="80" cy="80" r="70" />
              <circle 
                className="health-score-ring-fill" 
                cx="80" cy="80" r="70" 
                style={{ strokeDasharray: circumference, strokeDashoffset, stroke: scoreColor }} 
              />
            </svg>
            <div className="health-score-value">
              <span className="health-score-number" style={{ color: scoreColor }}>{Math.round(healthScore)}</span>
              <span className="health-score-label">Score</span>
            </div>
          </div>
          <div className="health-factors" style={{ flex: 1, minWidth: 250 }}>
            <div className="health-score-grade" style={{ color: scoreColor, fontSize: 18 }}>
              {healthGrade} Status
            </div>
            <div className="health-factor">
              <span className="health-factor-name">Avg Savings Rate</span>
              <span className="health-factor-score" style={{ color: savingsRate >= 20 ? 'var(--accent-green)' : 'var(--text-primary)' }}>
                {savingsRate.toFixed(1)}%
              </span>
            </div>
            <div className="health-factor">
              <span className="health-factor-name">Emergency Fund</span>
              <span className="health-factor-score text-green">Good</span>
            </div>
            <div className="health-factor">
              <span className="health-factor-name">Debt to Income</span>
              <span className="health-factor-score text-amber">Moderate</span>
            </div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <IncomeExpenseChart data={charts?.savingsData || []} />
        <SpendingPieChart data={categoryData} />
      </div>

      <div className="charts-grid">
        <SavingsTrendChart data={charts?.savingsData || []} />
        <MonthlyComparisonChart data={charts?.savingsData || []} />
      </div>
    </div>
  );
}
