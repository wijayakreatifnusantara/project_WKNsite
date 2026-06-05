import { useState, useCallback } from 'react';
import axios from 'axios';

const _rawApi = import.meta.env.VITE_API_URL;
const API_URL = _rawApi ? (_rawApi.endsWith('/api') ? _rawApi : _rawApi.replace(/\/$/, '') + '/api') : 'http://localhost:8000/api';

export const useAssets = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [assets, setAssets] = useState([]);

  const fetchAssets = useCallback(async (status = null, category = null) => {
    try {
      setLoading(true);
      const params = {};
      if (status) params.status = status;
      if (category) params.category = category;
      
      const response = await axios.get(`${API_URL}/assets`, { params });
      setAssets(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createAsset = async (payload) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/assets`, payload);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const assignAsset = async (payload) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/assets/assign`, payload);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const returnAsset = async (payload) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/assets/return`, payload);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchAssetHistory = useCallback(async (assetId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/assets/${assetId}/history`);
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
    assets,
    fetchAssets,
    createAsset,
    assignAsset,
    returnAsset,
    fetchAssetHistory
  };
};

