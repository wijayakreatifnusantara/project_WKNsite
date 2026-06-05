import { useState, useCallback } from 'react';
import axios from 'axios';

const _rawApi = import.meta.env.VITE_API_URL;
const API_URL = _rawApi ? (_rawApi.endsWith('/api') ? _rawApi : _rawApi.replace(/\/$/, '') + '/api') : 'http://localhost:8000/api';

export const useLeave = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [balances, setBalances] = useState([]);

  const fetchRequests = useCallback(async (status = null) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/leave/requests`, { params: { status } });
      setRequests(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchBalances = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/leave/balances`);
      setBalances(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitRequest = async (payload) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/leave/request`, payload);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (id, status, adminId) => {
    try {
      setLoading(true);
      const response = await axios.patch(`${API_URL}/leave/approve/${id}`, { status, admin_id: adminId });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    requests,
    balances,
    fetchRequests,
    fetchBalances,
    submitRequest,
    approveRequest
  };
};
