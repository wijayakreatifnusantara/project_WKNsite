import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export const useQuotations = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');
      
      if (error) throw error;
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
      
      // 1. Insert Quotation
      const { data: quote, error: quoteError } = await supabase
        .from('quotations')
        .insert([{
          reference_number: quotationData.reference_number,
          client_id: quotationData.client_id,
          subtotal: quotationData.subtotal,
          tax_rate: quotationData.tax_rate,
          tax_total: quotationData.tax_total,
          grand_total: quotationData.grand_total,
          status: 'Draft'
        }])
        .select()
        .single();

      if (quoteError) throw quoteError;

      // 2. Insert Items
      const formattedItems = items.map(item => ({
        quotation_id: quote.id,
        description: item.description,
        qty: item.qty,
        rate: item.rate
      }));

      const { error: itemsError } = await supabase
        .from('quotation_items')
        .insert(formattedItems);

      if (itemsError) throw itemsError;

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
