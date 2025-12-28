import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useDashboardStats() {
  const { profile } = useAuth();
  const clinicId = profile?.clinic_id;
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['dashboard-stats', clinicId, today],
    queryFn: async () => {
      if (!clinicId) return null;

      // Get today's appointments count
      const { count: todayAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .eq('scheduled_date', today);

      // Get total patients count
      const { count: totalPatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
        .eq('is_active', true);

      // Get today's revenue
      const { data: todayPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('clinic_id', clinicId)
        .gte('payment_date', `${today}T00:00:00`)
        .lte('payment_date', `${today}T23:59:59`);

      const todayRevenue = todayPayments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0;

      // Get pending invoices total
      const { data: pendingInvoices } = await supabase
        .from('invoices')
        .select('total_amount, paid_amount')
        .eq('clinic_id', clinicId)
        .in('status', ['sent', 'partial', 'overdue']);

      const pendingAmount = pendingInvoices?.reduce(
        (sum, inv) => sum + (Number(inv.total_amount) - Number(inv.paid_amount)), 
        0
      ) || 0;

      // Get appointment status counts for today
      const { data: appointmentStatuses } = await supabase
        .from('appointments')
        .select('status')
        .eq('clinic_id', clinicId)
        .eq('scheduled_date', today);

      const statusCounts = {
        completed: 0,
        scheduled: 0,
        cancelled: 0,
        in_progress: 0,
      };

      appointmentStatuses?.forEach(apt => {
        if (apt.status in statusCounts) {
          statusCounts[apt.status as keyof typeof statusCounts]++;
        }
      });

      // Get low stock items count
      const { data: lowStockItems } = await supabase
        .from('inventory_items')
        .select('quantity, min_quantity')
        .eq('clinic_id', clinicId)
        .eq('is_active', true);

      const lowStockCount = lowStockItems?.filter(
        item => item.quantity <= item.min_quantity
      ).length || 0;

      return {
        todayAppointments: todayAppointments || 0,
        totalPatients: totalPatients || 0,
        todayRevenue,
        pendingAmount,
        appointmentStatuses: statusCounts,
        lowStockCount,
      };
    },
    enabled: !!clinicId,
    refetchInterval: 60000, // Refresh every minute
  });
}

export function useRecentPatients(limit = 5) {
  const { profile } = useAuth();
  const clinicId = profile?.clinic_id;

  return useQuery({
    queryKey: ['recent-patients', clinicId, limit],
    queryFn: async () => {
      if (!clinicId) return [];

      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, avatar_url, created_at')
        .eq('clinic_id', clinicId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    },
    enabled: !!clinicId,
  });
}

export function useRevenueStats(days = 7) {
  const { profile } = useAuth();
  const clinicId = profile?.clinic_id;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return useQuery({
    queryKey: ['revenue-stats', clinicId, days],
    queryFn: async () => {
      if (!clinicId) return [];

      const { data, error } = await supabase
        .from('payments')
        .select('amount, payment_date, payment_method')
        .eq('clinic_id', clinicId)
        .gte('payment_date', startDate.toISOString())
        .order('payment_date', { ascending: true });

      if (error) throw error;

      // Group by date
      const grouped: Record<string, number> = {};
      data?.forEach(payment => {
        const date = payment.payment_date.split('T')[0];
        grouped[date] = (grouped[date] || 0) + Number(payment.amount);
      });

      return Object.entries(grouped).map(([date, amount]) => ({
        date,
        amount,
      }));
    },
    enabled: !!clinicId,
  });
}

export function usePaymentMethodStats() {
  const { profile } = useAuth();
  const clinicId = profile?.clinic_id;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return useQuery({
    queryKey: ['payment-method-stats', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];

      const { data, error } = await supabase
        .from('payments')
        .select('payment_method, amount')
        .eq('clinic_id', clinicId)
        .gte('payment_date', thirtyDaysAgo.toISOString());

      if (error) throw error;

      // Group by payment method
      const grouped: Record<string, number> = {};
      data?.forEach(payment => {
        grouped[payment.payment_method] = (grouped[payment.payment_method] || 0) + Number(payment.amount);
      });

      return Object.entries(grouped).map(([method, amount]) => ({
        method,
        amount,
      }));
    },
    enabled: !!clinicId,
  });
}
