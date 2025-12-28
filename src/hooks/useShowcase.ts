import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface PortfolioItem {
  id: string;
  clinic_id: string;
  title: string;
  category: string;
  description: string | null;
  before_image_url: string | null;
  after_image_url: string | null;
  is_published: boolean;
  display_order: number | null;
  created_at: string;
}

interface Testimonial {
  id: string;
  clinic_id: string;
  patient_name: string;
  patient_photo_url: string | null;
  content: string;
  rating: number | null;
  treatment_type: string | null;
  is_approved: boolean;
  is_published: boolean;
  created_at: string;
}

interface TeamMember {
  id: string;
  clinic_id: string;
  profile_id: string | null;
  name: string;
  title: string;
  specialization: string | null;
  bio: string | null;
  photo_url: string | null;
  qualifications: string[] | null;
  display_order: number | null;
  is_active: boolean;
  created_at: string;
}

export function useShowcasePortfolio() {
  const { profile } = useAuth();
  const clinicId = profile?.clinic_id;

  return useQuery({
    queryKey: ['showcase-portfolio', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];

      const { data, error } = await supabase
        .from('showcase_portfolio')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as PortfolioItem[];
    },
    enabled: !!clinicId,
  });
}

export function useShowcaseTestimonials() {
  const { profile } = useAuth();
  const clinicId = profile?.clinic_id;

  return useQuery({
    queryKey: ['showcase-testimonials', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];

      const { data, error } = await supabase
        .from('showcase_testimonials')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Testimonial[];
    },
    enabled: !!clinicId,
  });
}

export function useTeamMembers() {
  const { profile } = useAuth();
  const clinicId = profile?.clinic_id;

  return useQuery({
    queryKey: ['team-members', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];

      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('clinic_id', clinicId)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as TeamMember[];
    },
    enabled: !!clinicId,
  });
}

export function useCreatePortfolioItem() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (item: Omit<PortfolioItem, 'id' | 'clinic_id' | 'created_at'>) => {
      if (!profile?.clinic_id) throw new Error('No clinic associated');

      const { data, error } = await supabase
        .from('showcase_portfolio')
        .insert({ ...item, clinic_id: profile.clinic_id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['showcase-portfolio'] });
      toast({ title: 'Portfolio item added' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateTestimonialStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, is_approved, is_published }: { id: string; is_approved?: boolean; is_published?: boolean }) => {
      const updates: Partial<Testimonial> = {};
      if (is_approved !== undefined) updates.is_approved = is_approved;
      if (is_published !== undefined) updates.is_published = is_published;

      const { data, error } = await supabase
        .from('showcase_testimonials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['showcase-testimonials'] });
      toast({ title: 'Testimonial updated' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useCreateTeamMember() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (member: Omit<TeamMember, 'id' | 'clinic_id' | 'created_at'>) => {
      if (!profile?.clinic_id) throw new Error('No clinic associated');

      const { data, error } = await supabase
        .from('team_members')
        .insert({ ...member, clinic_id: profile.clinic_id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({ title: 'Team member added' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}
