import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Invoice, InvoiceItem, Payment, InvoiceStatus } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useInvoices() {
  const { profile } = useAuth();
  const clinicId = profile?.clinic_id;

  return useQuery({
    queryKey: ['invoices', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          patient:patients(id, first_name, last_name, email, phone)
        `)
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (Invoice & { patient: any })[];
    },
    enabled: !!clinicId,
  });
}

export function useInvoice(invoiceId: string | null) {
  return useQuery({
    queryKey: ['invoice', invoiceId],
    queryFn: async () => {
      if (!invoiceId) return null;
      
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          patient:patients(id, first_name, last_name, email, phone, address)
        `)
        .eq('id', invoiceId)
        .maybeSingle();

      if (invoiceError) throw invoiceError;
      if (!invoice) return null;

      const { data: items, error: itemsError } = await supabase
        .from('invoice_items')
        .select('*')
        .eq('invoice_id', invoiceId);

      if (itemsError) throw itemsError;

      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('payment_date', { ascending: false });

      if (paymentsError) throw paymentsError;

      return {
        ...invoice,
        items: items as InvoiceItem[],
        payments: payments as Payment[],
      } as Invoice & { patient: any; items: InvoiceItem[]; payments: Payment[] };
    },
    enabled: !!invoiceId,
  });
}

export function usePayments() {
  const { profile } = useAuth();
  const clinicId = profile?.clinic_id;

  return useQuery({
    queryKey: ['payments', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          patient:patients(id, first_name, last_name),
          invoice:invoices(id, invoice_number)
        `)
        .eq('clinic_id', clinicId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data as (Payment & { patient: any; invoice: any })[];
    },
    enabled: !!clinicId,
  });
}

export function usePendingPayments() {
  const { profile } = useAuth();
  const clinicId = profile?.clinic_id;

  return useQuery({
    queryKey: ['pending-payments', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          patient:patients(id, first_name, last_name),
          invoice:invoices(id, invoice_number)
        `)
        .eq('clinic_id', clinicId)
        .eq('is_verified', false)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data as (Payment & { patient: any; invoice: any })[];
    },
    enabled: !!clinicId,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      invoice, 
      items 
    }: { 
      invoice: Omit<Invoice, 'id' | 'clinic_id' | 'created_at' | 'updated_at' | 'patient' | 'items' | 'payments'>;
      items: Omit<InvoiceItem, 'id' | 'invoice_id' | 'created_at'>[];
    }) => {
      if (!profile?.clinic_id) throw new Error('No clinic associated');

      // Generate invoice number
      const invoiceNumber = `INV-${Date.now().toString(36).toUpperCase()}`;

      const { data: newInvoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          ...invoice,
          clinic_id: profile.clinic_id,
          invoice_number: invoiceNumber,
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Insert items
      if (items.length > 0) {
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(items.map(item => ({
            ...item,
            invoice_id: newInvoice.id,
          })));

        if (itemsError) throw itemsError;
      }

      return newInvoice as Invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({
        title: 'Invoice Created',
        description: 'Invoice has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateInvoiceStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: InvoiceStatus }) => {
      const { data, error } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Invoice;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast({ title: 'Invoice Updated' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payment: Omit<Payment, 'id' | 'clinic_id' | 'created_at'>) => {
      if (!profile?.clinic_id) throw new Error('No clinic associated');

      const { data, error } = await supabase
        .from('payments')
        .insert({
          ...payment,
          clinic_id: profile.clinic_id,
        })
        .select()
        .single();

      if (error) throw error;

      // Update invoice paid amount and status
      const { data: invoice } = await supabase
        .from('invoices')
        .select('total_amount, paid_amount')
        .eq('id', payment.invoice_id)
        .single();

      if (invoice) {
        const newPaidAmount = Number(invoice.paid_amount) + Number(payment.amount);
        const newStatus: InvoiceStatus = newPaidAmount >= Number(invoice.total_amount) ? 'paid' : 'partial';
        
        await supabase
          .from('invoices')
          .update({ 
            paid_amount: newPaidAmount,
            status: newStatus,
          })
          .eq('id', payment.invoice_id);
      }

      return data as Payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      queryClient.invalidateQueries({ queryKey: ['pending-payments'] });
      toast({
        title: 'Payment Recorded',
        description: 'Payment has been recorded successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (paymentId: string) => {
      const { data, error } = await supabase
        .from('payments')
        .update({ 
          is_verified: true,
          verified_by: profile?.id,
          verified_at: new Date().toISOString(),
        })
        .eq('id', paymentId)
        .select()
        .single();

      if (error) throw error;
      return data as Payment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['pending-payments'] });
      toast({
        title: 'Payment Verified',
        description: 'Payment has been verified successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
