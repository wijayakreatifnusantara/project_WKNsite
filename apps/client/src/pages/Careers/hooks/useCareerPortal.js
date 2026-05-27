import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export const useCareerPortal = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchActiveJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('job_postings')
        .select('*')
        .eq('status', 'Active')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setJobs(data || []);
      
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitApplication = async (applicationData) => {
    try {
      const { error } = await supabase
        .from('job_applicants')
        .insert([{
          job_id: applicationData.job_id,
          name: applicationData.name,
          email: applicationData.email,
          phone: applicationData.phone,
          resume_url: applicationData.resume_url,
          status: 'New'
        }]);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.error('Error submitting application:', err);
      return { error: err.message };
    }
  };

  return {
    jobs,
    loading,
    error,
    fetchActiveJobs,
    submitApplication
  };
};
