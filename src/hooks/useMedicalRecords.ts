import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface MedicalRecord {
  id: string;
  patient_id: string;
  clinic_id: string;
  record_date: string;
  chief_complaint: string;
  history_of_complaint: string | null;
  dental_history: string | null;
  medical_history: string | null;
  family_history: string | null;
  current_medications: string | null;
  allergies: string | null;
  extra_oral_examination: string | null;
  intra_oral_examination: string | null;
  diagnosis: string | null;
  treatment_plan: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useMedicalRecords(patientId: string | null) {
  const { profile } = useAuth();
  const clinicId = profile?.clinic_id;

  return useQuery({
    queryKey: ['medical-records', patientId],
    queryFn: async () => {
      if (!patientId || !clinicId) return [];
      
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', patientId)
        .eq('clinic_id', clinicId)
        .order('record_date', { ascending: false });

      if (error) throw error;
      return data as MedicalRecord[];
    },
    enabled: !!patientId && !!clinicId,
  });
}

export function useMedicalRecord(recordId: string | null) {
  return useQuery({
    queryKey: ['medical-record', recordId],
    queryFn: async () => {
      if (!recordId) return null;
      
      const { data, error } = await supabase
        .from('medical_records')
        .select(`
          *,
          patient:patients(id, first_name, last_name),
          attachments:medical_record_attachments(*)
        `)
        .eq('id', recordId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!recordId,
  });
}

export function useCreateMedicalRecord() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (record: Omit<MedicalRecord, 'id' | 'clinic_id' | 'created_at' | 'updated_at' | 'created_by'>) => {
      if (!profile?.clinic_id) throw new Error('No clinic associated');

      const { data, error } = await supabase
        .from('medical_records')
        .insert({
          ...record,
          clinic_id: profile.clinic_id,
          created_by: profile.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as MedicalRecord;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['medical-records', data.patient_id] });
      toast({
        title: 'Record Created',
        description: 'Medical record has been saved successfully.',
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

export function useUpdateMedicalRecord() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...record }: Partial<MedicalRecord> & { id: string }) => {
      const { data, error } = await supabase
        .from('medical_records')
        .update(record)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as MedicalRecord;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['medical-records', data.patient_id] });
      queryClient.invalidateQueries({ queryKey: ['medical-record', data.id] });
      toast({ title: 'Record Updated' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}