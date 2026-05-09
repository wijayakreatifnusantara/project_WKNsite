import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/payroll/history`, {
        params: { period }
      });
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
