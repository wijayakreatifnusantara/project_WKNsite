import { useState, useCallback } from 'react';
import axios from 'axios';

const _rawApi = import.meta.env.VITE_API_URL;
const API_URL = _rawApi ? (_rawApi.endsWith('/api') ? _rawApi : _rawApi.replace(/\/$/, '') + '/api') : 'http://localhost:8000/api';

export const useDocuments = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [documents, setDocuments] = useState([]);

  const fetchDocuments = useCallback(async (category = null, employeeId = null) => {
    try {
      setLoading(true);
      const params = {};
      if (category) params.category = category;
      if (employeeId) params.employee_id = employeeId;
      
      const response = await axios.get(`${API_URL}/documents`, { params });
      setDocuments(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadDocument = async (formData) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/documents/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/documents/${id}`);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
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
    documents,
    fetchDocuments,
    uploadDocument,
    deleteDocument
  };
};
