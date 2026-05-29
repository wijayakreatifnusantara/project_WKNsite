import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';

export const useTimesheets = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTimesheets = useCallback(async (filterType = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get(`/api/payroll/timesheets?filter_type=${filterType}`);
      
      if (response.status !== 'success') throw new Error('Failed to fetch timesheets');
      setLogs(response.data || []);
      
    } catch (err) {
      console.error('Error fetching timesheets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const response = await apiClient.put(`/api/payroll/timesheets/${id}`, {
        status: newStatus
      });

      if (response.status !== 'success') throw new Error('Failed to update status');
      
      // Update local state directly for speed
      setLogs(prev => prev.map(log => log.id === id ? { ...log, status: newStatus } : log));
      return { success: true };
    } catch (err) {
      console.error('Error updating timesheet status:', err);
      return { error: err.message };
    }
  };

  return {
    logs,
    loading,
    error,
    fetchTimesheets,
    updateStatus
  };
};
