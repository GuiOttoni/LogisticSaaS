import { Injectable, Inject } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.module';

@Injectable()
export class InventoryService {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  async getSnapshot(skuId?: string) {
    let query = this.supabase.schema('orders').from('inventory_snapshot').select('*');
    if (skuId) query = query.eq('sku_id', skuId);
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return data;
  }
}
