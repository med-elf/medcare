import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Appointment, AppointmentStatus } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useAppointments(date?: string) {
  const { profile } = useAuth();
  const clinicId = profile?.clinic_id;

  return useQuery({
    queryKey: ['appointments', clinicId, date],
    queryFn: async () => {
      if (!clinicId) return [];
      
      let query = supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(id, first_name, last_name, phone, avatar_url),
          provider:profiles(id, first_name, last_name, avatar_url)
        `)
        .eq('clinic_id', clinicId)
        .order('scheduled_date', { ascending: true })
        .order('start_time', { ascending: true });

      if (date) {
        query = query.eq('scheduled_date', date);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as (Appointment & { patient: any; provider: any })[];
    },
    enabled: !!clinicId,
  });
}

export function useTodayAppointments() {
  const today = new Date().toISOString().split('T')[0];
  return useAppointments(today);
}

export function useUpcomingAppointments(limit = 10) {
  const { profile } = useAuth();
  const clinicId = profile?.clinic_id;
  const today = new Date().toISOString().split('T')[0];

  return useQuery({
    queryKey: ['upcoming-appointments', clinicId, limit],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:patients(id, first_name, last_name, phone, avatar_url),
          provider:profiles(id, first_name, last_name, avatar_url)
        `)
        .eq('clinic_id', clinicId)
        .gte('scheduled_date', today)
        .in('status', ['scheduled', 'confirmed'])
        .order('scheduled_date', { ascending: true })
        .order('start_time', { ascending: true })
        .limit(limit);

      if (error) throw error;
      return data as (Appointment & { patient: any; provider: any })[];
    },
    enabled: !!clinicId,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (appointment: Omit<Appointment, 'id' | 'clinic_id' | 'created_at' | 'updated_at' | 'patient' | 'provider'>) => {
      if (!profile?.clinic_id) throw new Error('No clinic associated');

      const { data, error } = await supabase
        .from('appointments')
        .insert({
          ...appointment,
          clinic_id: profile.clinic_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-appointments'] });
      toast({
        title: 'Appointment Created',
        description: 'Appointment has been scheduled successfully.',
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

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...appointment }: Partial<Appointment> & { id: string }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update(appointment)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-appointments'] });
      toast({
        title: 'Appointment Updated',
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

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppointmentStatus }) => {
      const { data, error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Appointment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-appointments'] });
      toast({
        title: `Appointment ${data.status.replace('_', ' ')}`,
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

export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-appointments'] });
      toast({
        title: 'Appointment Deleted',
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
