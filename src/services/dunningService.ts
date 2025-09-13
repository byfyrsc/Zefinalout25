import { supabase } from '@/lib/supabase';
import type { DunningAttempt } from '@/types/billing';

export class DunningService {
  // Get dunning attempts for a tenant
  static async getDunningAttempts(tenantId: string): Promise<DunningAttempt[]> {
    try {
      const { data, error } = await supabase
        .from('dunning_attempts')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting dunning attempts:', error);
      throw error;
    }
  }

  // Create dunning attempt
  static async createDunningAttempt(
    tenantId: string,
    invoiceId: string,
    attemptNumber: number,
    method: 'email' | 'sms' | 'phone' | 'suspension'
  ): Promise<DunningAttempt> {
    try {
      const scheduledAt = new Date();
      const next