import { useState, useCallback } from 'react';
import axios from 'axios';

const _rawApi = import.meta.env.VITE_API_URL;
const API_URL = _rawApi ? (_rawApi.endsWith('/api') ? _rawApi : _rawApi.replace(/\/$/, '') + '/api') : 'http://localhost:8000/api';

// Global cache for zero-latency rendering
const attendanceCache = new Map();

export const useAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [todaySummary, setTodaySummary] = useState(attendanceCache.get('todaySummary') || null);
  const [trends, setTrends] = useState(attendanceCache.get('trends') || []);

  const fetchTodaySummary = useCallback(async () => {
    try {
      if (!attendanceCache.has('todaySummary')) setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/attendance/summary/today`);
      attendanceCache.set('todaySummary', response.data.data);
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
      const cacheKey = `trends_${period}`;
      if (!attendanceCache.has(cacheKey)) setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/attendance/analytics/trends`, {
        params: { period }
      });
      attendanceCache.set(cacheKey, response.data.data);
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
