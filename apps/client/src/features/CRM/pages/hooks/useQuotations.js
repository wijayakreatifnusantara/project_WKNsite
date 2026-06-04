import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/apiClient';

export const useQuotations = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const { data: res } = await apiClient.get('/api/crm/clients');
      const data = res.data;
      
      setClients(data || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveQuotation = async (quotationData, items) => {
    try {
      setLoading(true);
      
      // 2. Insert Items
      const formattedItems = items.map(item => ({
        description: item.description,
        qty: item.qty,
        rate: item.rate
      }));

      const { data: res } = await apiClient.post('/api/crm/quotations', {
        quotation: {
          reference_number: quotationData.reference_number,
          client_id: quotationData.client_id,
          subtotal: quotationData.subtotal,
          tax_rate: quotationData.tax_rate,
          tax_total: quotationData.tax_total,
          grand_total: quotationData.grand_total,
          status: 'Draft'
        },
        items: formattedItems
      });

      const quote = res.data;

      return { success: true, data: quote };
    } catch (err) {
      console.error('Error saving quotation:', err);
      return { error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    clients,
    loading,
    fetchClients,
    saveQuotation
  };
};
