import { useState, useCallback } from 'react';
import axios from 'axios';

const _rawApi = import.meta.env.VITE_API_URL;
const API_URL = _rawApi ? (_rawApi.endsWith('/api') ? _rawApi : _rawApi.replace(/\/$/, '') + '/api') : 'http://localhost:8000/api';

// Global cache for zero-latency rendering
const payrollCache = new Map();

export const usePayroll = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [calculationData, setCalculationData] = useState(null);
  const [history, setHistory] = useState([]);

  const calculatePayroll = useCallback(async (period) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/payroll/calculate`, {
        params: { period }
      });
      setCalculationData(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const finalizePayroll = useCallback(async (period, payrollData) => {
    try {
      setLoading(true);
      setError(null);
      await axios.post(`${API_URL}/payroll/finalize`, payrollData, {
        params: { period }
      });
      return true;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async (period) => {
    try {
      const cacheKey = `history_${period}`;
      if (!payrollCache.has(cacheKey)) setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/payroll/history`, {
        params: { period }
      });
      payrollCache.set(cacheKey, response.data.data);
      setHistory(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    calculationData,
    history,
    calculatePayroll,
    finalizePayroll,
    fetchHistory
  };
};
