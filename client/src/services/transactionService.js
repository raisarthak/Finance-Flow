import api from './api';

export const getTransactions = (params) => api.get('/transactions', { params });
export const getTransaction = (id) => api.get(`/transactions/${id}`);
export const createTransaction = (data) => api.post('/transactions', data);
export const updateTransaction = (id, data) => api.put(`/transactions/${id}`, data);
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`);
export const getTransactionSummary = (months) => api.get('/transactions/summary', { params: { months } });
export const getTransactionCategories = (month, year) => api.get('/transactions/categories', { params: { month, year } });
