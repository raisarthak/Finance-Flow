import api from './api';

export const getDashboardSummary = () => api.get('/dashboard/summary');
export const getDashboardCharts = (months) => api.get('/dashboard/charts', { params: { months } });
