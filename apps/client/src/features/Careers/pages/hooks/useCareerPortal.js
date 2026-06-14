import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';

export const useCareerPortal = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchActiveJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/recruitment/public/jobs');

      if (response.status !== 'success') throw new Error('Failed to fetch jobs');
      setJobs(response.data || []);
      
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const submitApplication = async (applicationData) => {
    try {
      const response = await apiClient.post('/recruitment/public/apply', {
        job_id: applicationData.job_id,
        name: applicationData.name,
        email: applicationData.email,
        phone: applicationData.phone,
        resume_url: applicationData.resume_url
      });

      if (response.status !== 'success') throw new Error('Application submission failed');
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
