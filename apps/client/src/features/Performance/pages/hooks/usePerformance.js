import { useState, useCallback } from 'react';
import axios from 'axios';

const _rawApi = import.meta.env.VITE_API_URL;
const API_URL = _rawApi ? (_rawApi.endsWith('/api') ? _rawApi : _rawApi.replace(/\/$/, '') + '/api') : 'http://localhost:8000/api';

// Performance Badge Logic (T018)
export const getPerformanceBadge = (totalScore) => {
  const score = parseFloat(totalScore) || 0;
  if (score >= 4.5) {
    return { grade: 'A', label: 'Excellent', color: 'emerald', bgColor: 'bg-emerald-50', textColor: 'text-emerald-600', borderColor: 'border-emerald-200' };
  } else if (score >= 3.5) {
    return { grade: 'B', label: 'Good', color: 'blue', bgColor: 'bg-blue-50', textColor: 'text-blue-600', borderColor: 'border-blue-200' };
  } else if (score >= 2.5) {
    return { grade: 'C', label: 'Fair', color: 'amber', bgColor: 'bg-amber-50', textColor: 'text-amber-600', borderColor: 'border-amber-200' };
  } else {
    return { grade: 'D', label: 'Needs Improvement', color: 'rose', bgColor: 'bg-rose-50', textColor: 'text-rose-600', borderColor: 'border-rose-200' };
  }
};

// Export to PDF function (T019)
export const exportToPDF = async (review, employeeName, metrics) => {
  // Create a printable version of the report
  const printWindow = window.open('', '_blank');
  const badge = getPerformanceBadge(review.total_score);
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Performance Report - ${employeeName}</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
        .header { text-align: center; border-bottom: 3px solid #E31E24; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #E31E24; margin: 0; font-size: 24px; }
        .header p { color: #666; margin: 5px 0; font-size: 12px; }
        .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .info-box { background: #f5f5f5; padding: 15px; border-radius: 8px; flex: 1; margin: 0 10px; }
        .info-box:first-child { margin-left: 0; }
        .info-box:last-child { margin-right: 0; }
        .info-box h3 { margin: 0 0 10px 0; color: #E31E24; font-size: 14px; }
        .info-box p { margin: 5px 0; font-size: 13px; }
        .badge-section { text-align: center; margin: 30px 0; }
        .badge { display: inline-block; padding: 15px 40px; border-radius: 12px; font-size: 48px; font-weight: bold; }
        .badge-label { font-size: 18px; margin-top: 10px; font-weight: bold; }
        .score { font-size: 36px; font-weight: bold; margin: 20px 0; }
        .metrics-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        .metrics-table th { background: #E31E24; color: white; padding: 12px; text-align: left; }
        .metrics-table td { padding: 10px 12px; border-bottom: 1px solid #ddd; }
        .metrics-table tr:nth-child(even) { background: #f9f9f9; }
        .feedback-section { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 30px 0; }
        .feedback-section h3 { color: #E31E24; margin-top: 0; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 11px; }
        .grade-A { background: #10b981; color: white; }
        .grade-B { background: #3b82f6; color: white; }
        .grade-C { background: #f59e0b; color: white; }
        .grade-D { background: #ef4444; color: white; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>WKN Performance Report</h1>
        <p>Human Capital Excellence & Appraisals</p>
      </div>
      
      <div class="info-section">
        <div class="info-box">
          <h3>Employee Information</h3>
          <p><strong>Name:</strong> ${employeeName}</p>
          <p><strong>Employee ID:</strong> ${review.employee_id}</p>
          <p><strong>Review Period:</strong> ${review.period}</p>
        </div>
        <div class="info-box">
          <h3>Review Details</h3>
          <p><strong>Reviewer:</strong> ${review.reviewer_id}</p>
          <p><strong>Date:</strong> ${new Date(review.created_at).toLocaleDateString('id-ID')}</p>
          <p><strong>Status:</strong> ${review.status}</p>
        </div>
      </div>
      
      <div class="badge-section">
        <div class="badge grade-${badge.grade}">${badge.grade}</div>
        <div class="badge-label">${badge.label}</div>
        <div class="score">${review.total_score} / 5.0</div>
      </div>
      
      <h3>Competency Breakdown</h3>
      <table class="metrics-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>Weight</th>
            <th>Score</th>
            <th>Weighted Score</th>
          </tr>
        </thead>
        <tbody>
          ${metrics.map(m => {
            const score = review.scores[m.id] || 0;
            const weighted = (score * m.weight).toFixed(2);
            return `<tr>
              <td>${m.name}</td>
              <td>${(m.weight * 100).toFixed(0)}%</td>
              <td>${score}</td>
              <td>${weighted}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
      
      ${review.feedback ? `
      <div class="feedback-section">
        <h3>Manager Feedback</h3>
        <p>${review.feedback}</p>
      </div>
      ` : ''}
      
      <div class="footer">
        <p>Generated on ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p>This is an official document of WKN Human Resources Department</p>
      </div>
    </body>
    </html>
  `;
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  
  // Wait for content to load then print
  setTimeout(() => {
    printWindow.print();
  }, 500);
};

export const usePerformance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);

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

  const fetchPendingReviews = useCallback(async (period = null) => {
    try {
      setLoading(true);
      const params = {};
      if (period) params.period = period;
      
      const response = await axios.get(`${API_URL}/performance/pending-reviews`, { params });
      setPendingReviews(response.data.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addMetric = async (payload) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_URL}/performance/metrics`, payload);
      await fetchMetrics(); // Refresh data
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateMetric = async (id, payload) => {
    try {
      setLoading(true);
      const response = await axios.put(`${API_URL}/performance/metrics/${id}`, payload);
      await fetchMetrics();
      return response.data;
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteMetric = async (id) => {
    try {
      setLoading(true);
      const response = await axios.delete(`${API_URL}/performance/metrics/${id}`);
      await fetchMetrics();
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
    metrics,
    reviews,
    pendingReviews,
    fetchMetrics,
    fetchReviews,
    submitReview,
    fetchBurnoutRisk,
    fetchPendingReviews,
    addMetric,
    updateMetric,
    deleteMetric
  };
};

