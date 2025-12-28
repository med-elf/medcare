import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Patient, PatientAllergy, PatientMedication, PatientMedicalHistory } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function usePatients() {
  const { profile } = useAuth();
  const clinicId = profile?.clinic_id;

  return useQuery({
    queryKey: ['patients', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('is_active', true)
        .order('last_name', { ascending: true });

      if (error) throw error;
      return data as Patient[];
    },
    enabled: !!clinicId,
  });
}

export function usePatient(patientId: string | null) {
  return useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      if (!patientId) return null;
      
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .maybeSingle();

      if (error) throw error;
      return data as Patient | null;
    },
    enabled: !!patientId,
  });
}

export function usePatientAllergies(patientId: string | null) {
  return useQuery({
    queryKey: ['patient-allergies', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      
      const { data, error } = await supabase
        .from('patient_allergies')
        .select('*')
        .eq('patient_id', patientId);

      if (error) throw error;
      return data as PatientAllergy[];
    },
    enabled: !!patientId,
  });
}

export function usePatientMedications(patientId: string | null) {
  return useQuery({
    queryKey: ['patient-medications', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      
      const { data, error } = await supabase
        .from('patient_medications')
        .select('*')
        .eq('patient_id', patientId)
        .eq('is_active', true);

      if (error) throw error;
      return data as PatientMedication[];
    },
    enabled: !!patientId,
  });
}

export function usePatientMedicalHistory(patientId: string | null) {
  return useQuery({
    queryKey: ['patient-medical-history', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      
      const { data, error } = await supabase
        .from('patient_medical_history')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PatientMedicalHistory[];
    },
    enabled: !!patientId,
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (patient: Omit<Patient, 'id' | 'clinic_id' | 'created_at' | 'updated_at'>) => {
      if (!profile?.clinic_id) throw new Error('No clinic associated');

      const { data, error } = await supabase
        .from('patients')
        .insert({
          ...patient,
          clinic_id: profile.clinic_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Patient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast({
        title: 'Patient Created',
        description: 'New patient has been added successfully.',
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

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...patient }: Partial<Patient> & { id: string }) => {
      const { data, error } = await supabase
        .from('patients')
        .update(patient)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Patient;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient', data.id] });
      toast({
        title: 'Patient Updated',
        description: 'Patient information has been updated.',
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

export function useDeletePatient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      // Soft delete - just mark as inactive
      const { error } = await supabase
        .from('patients')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast({
        title: 'Patient Removed',
        description: 'Patient has been removed from the active list.',
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

// Allergy mutations
export function useAddAllergy() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (allergy: Omit<PatientAllergy, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('patient_allergies')
        .insert(allergy)
        .select()
        .single();

      if (error) throw error;
      return data as PatientAllergy;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient-allergies', data.patient_id] });
      toast({ title: 'Allergy Added' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteAllergy() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, patientId }: { id: string; patientId: string }) => {
      const { error } = await supabase
        .from('patient_allergies')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return patientId;
    },
    onSuccess: (patientId) => {
      queryClient.invalidateQueries({ queryKey: ['patient-allergies', patientId] });
    },
  });
}

// Medication mutations
export function useAddMedication() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (medication: Omit<PatientMedication, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('patient_medications')
        .insert(medication)
        .select()
        .single();

      if (error) throw error;
      return data as PatientMedication;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['patient-medications', data.patient_id] });
      toast({ title: 'Medication Added' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}
