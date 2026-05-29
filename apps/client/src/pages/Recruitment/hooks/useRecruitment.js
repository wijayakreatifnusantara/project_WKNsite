import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';

export const useRecruitment = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Aggregate stats
  const [stats, setStats] = useState({
    openPositions: 0,
    totalApplicants: 0,
    interviewsToday: 0
  });

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch job postings and count applicants per job
      const { data: res } = await apiClient.get('/api/recruitment/jobs');
      const jobData = res.data;
      
      // Transform data to include applicant counts
      let totalApps = 0;
      let openPos = 0;
      let interviews = 0;

      const formattedJobs = jobData.map(job => {
        const applicantCount = job.job_applicants ? job.job_applicants.length : 0;
        
        // Aggregate stats logic
        totalApps += applicantCount;
        if (job.status === 'Active') openPos++;
        
        job.job_applicants?.forEach(app => {
          if (app.status === 'Interview') interviews++;
        });

        return {
          id: job.id,
          title: job.title,
          dept: job.department,
          status: job.status,
          applicants: applicantCount
        };
      });

      setJobs(formattedJobs);
      setStats({
        openPositions: openPos,
        totalApplicants: totalApps,
        interviewsToday: interviews
      });
      
    } catch (err) {
      console.error('Error fetching recruitment data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createJob = async (jobData) => {
    try {
      await apiClient.post('/api/recruitment/jobs', {
        title: jobData.title,
        department: jobData.dept,
        status: jobData.status || 'Active'
      });
      fetchJobs(); // Refresh the list
      return { success: true };
    } catch (err) {
      console.error('Error creating job:', err);
      return { error: err.message };
    }
  };

  return {
    jobs,
    stats,
    loading,
    error,
    fetchJobs,
    createJob
  };
};
