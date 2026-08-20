import api from './api';

export const getInvestments = () => api.get('/investments');
export const getPortfolio = () => api.get('/investments/portfolio');
export const getInvestment = (id) => api.get(`/investments/${id}`);
export const createInvestment = (data) => api.post('/investments', data);
export const updateInvestment = (id, data) => api.put(`/investments/${id}`, data);
export const deleteInvestment = (id) => api.delete(`/investments/${id}`);
