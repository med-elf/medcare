import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { InventoryItem, InventoryCategory } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export function useInventoryItems() {
  const { profile } = useAuth();
  const clinicId = profile?.clinic_id;

  return useQuery({
    queryKey: ['inventory-items', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          category:inventory_categories(id, name)
        `)
        .eq('clinic_id', clinicId)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as (InventoryItem & { category: InventoryCategory | null })[];
    },
    enabled: !!clinicId,
  });
}

export function useInventoryCategories() {
  const { profile } = useAuth();
  const clinicId = profile?.clinic_id;

  return useQuery({
    queryKey: ['inventory-categories', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from('inventory_categories')
        .select('*')
        .eq('clinic_id', clinicId)
        .order('name', { ascending: true });

      if (error) throw error;
      return data as InventoryCategory[];
    },
    enabled: !!clinicId,
  });
}

export function useLowStockItems() {
  const { profile } = useAuth();
  const clinicId = profile?.clinic_id;

  return useQuery({
    queryKey: ['low-stock-items', clinicId],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          category:inventory_categories(id, name)
        `)
        .eq('clinic_id', clinicId)
        .eq('is_active', true)
        .lte('quantity', supabase.rpc ? 10 : 10) // Items where quantity <= min_quantity
        .order('quantity', { ascending: true });

      if (error) throw error;
      
      // Filter client-side for items below min_quantity
      return (data as (InventoryItem & { category: InventoryCategory | null })[])
        .filter(item => item.quantity <= item.min_quantity);
    },
    enabled: !!clinicId,
  });
}

export function useExpiringItems(daysAhead = 30) {
  const { profile } = useAuth();
  const clinicId = profile?.clinic_id;
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return useQuery({
    queryKey: ['expiring-items', clinicId, daysAhead],
    queryFn: async () => {
      if (!clinicId) return [];
      
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          category:inventory_categories(id, name)
        `)
        .eq('clinic_id', clinicId)
        .eq('is_active', true)
        .not('expiry_date', 'is', null)
        .lte('expiry_date', futureDate.toISOString().split('T')[0])
        .order('expiry_date', { ascending: true });

      if (error) throw error;
      return data as (InventoryItem & { category: InventoryCategory | null })[];
    },
    enabled: !!clinicId,
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (item: Omit<InventoryItem, 'id' | 'clinic_id' | 'created_at' | 'updated_at' | 'category'>) => {
      if (!profile?.clinic_id) throw new Error('No clinic associated');

      const { data, error } = await supabase
        .from('inventory_items')
        .insert({
          ...item,
          clinic_id: profile.clinic_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as InventoryItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-items'] });
      toast({
        title: 'Item Added',
        description: 'Inventory item has been added successfully.',
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

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...item }: Partial<InventoryItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('inventory_items')
        .update(item)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as InventoryItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-items'] });
      queryClient.invalidateQueries({ queryKey: ['expiring-items'] });
      toast({
        title: 'Item Updated',
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

export function useUpdateStock() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, quantity, operation }: { id: string; quantity: number; operation: 'add' | 'subtract' | 'set' }) => {
      const { data: current, error: fetchError } = await supabase
        .from('inventory_items')
        .select('quantity')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      let newQuantity: number;
      switch (operation) {
        case 'add':
          newQuantity = current.quantity + quantity;
          break;
        case 'subtract':
          newQuantity = Math.max(0, current.quantity - quantity);
          break;
        case 'set':
          newQuantity = quantity;
          break;
      }

      const { data, error } = await supabase
        .from('inventory_items')
        .update({ quantity: newQuantity })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as InventoryItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-items'] });
      toast({ title: 'Stock Updated' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (category: { name: string; description?: string }) => {
      if (!profile?.clinic_id) throw new Error('No clinic associated');

      const { data, error } = await supabase
        .from('inventory_categories')
        .insert({
          ...category,
          clinic_id: profile.clinic_id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as InventoryCategory;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-categories'] });
      toast({ title: 'Category Added' });
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });
}
