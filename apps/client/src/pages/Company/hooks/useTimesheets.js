import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export const useTimesheets = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTimesheets = useCallback(async (filterType = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      let query = supabase
        .from('timesheets')
        .select(`
          id, 
          project_name, 
          task_description, 
          duration_hours, 
          date, 
          status, 
          created_at,
          employees ( name )
        `)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false });
        
      if (filterType === 'pending') {
        query = query.eq('status', 'PENDING');
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setLogs(data || []);
      
    } catch (err) {
      console.error('Error fetching timesheets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('timesheets')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
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
