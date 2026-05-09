import { useState, useCallback } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const usePerformance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [reviews, setReviews] = useState([]);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/performance/metrics`);
      setMetrics(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchReviews = useCallback(async (employeeId = null, period = null) => {
    try {
      setLoading(true);
      const params = {};
      if (employeeId) params.employee_id = employeeId;
      if (period) params.period = period;
      
      const response = await axios.get(`${API_URL}/performance/reviews`, { params });
      setReviews(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitReview = async (payload) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/performance/reviews`, payload);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchBurnoutRisk = useCallback(async (employeeId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/performance/burnout-risk/${employeeId}`);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    metrics,
    reviews,
    fetchMetrics,
    fetchReviews,
    submitReview,
    fetchBurnoutRisk
  };
};

