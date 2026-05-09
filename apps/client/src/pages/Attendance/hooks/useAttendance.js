import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const useAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [todaySummary, setTodaySummary] = useState(null);
  const [trends, setTrends] = useState([]);

  const fetchTodaySummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/attendance/summary/today`);
      setTodaySummary(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTrends = useCallback(async (period) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/attendance/analytics/trends`, {
        params: { period }
      });
      setTrends(response.data.data);
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
    todaySummary,
    trends,
    fetchTodaySummary,
    fetchTrends
  };
};
