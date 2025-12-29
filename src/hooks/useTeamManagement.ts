import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface TeamMember {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  avatar_url: string | null;
  roles: { id: string; role: string }[];
}

export function useTeamMembers() {
  const { profile } = useAuth();
  const clinicId = profile?.clinic_id;

  return useQuery({
    queryKey: ['team-members', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, first_name, last_name, email, avatar_url')
        .eq('clinic_id', clinicId);

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('id, user_id, role')
        .eq('clinic_id', clinicId);

      if (rolesError) throw rolesError;

      const membersWithRoles = profiles.map((profile) => ({
        ...profile,
        roles: roles.filter((r) => r.user_id === profile.user_id),
      }));

      return membersWithRoles as TeamMember[];
    },
    enabled: !!clinicId,
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'clinic_admin' | 'provider' | 'reception' | 'patient' }) => {
      if (!profile?.clinic_id) throw new Error('No clinic associated');

      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role,
          clinic_id: profile.clinic_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({ title: 'Role assigned successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useRemoveRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({ title: 'Role removed' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}