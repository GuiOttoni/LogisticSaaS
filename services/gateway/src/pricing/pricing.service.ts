import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.module';
import { CreateRuleDto } from './dto/create-rule.dto';

@Injectable()
export class PricingService {
  constructor(@Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient) {}

  async findAll() {
    const { data, error } = await this.supabase
      .schema('pricing')
      .from('pricing_rules')
      .select('*')
      .order('priority');
    if (error) throw new Error(error.message);
    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabase
      .schema('pricing')
      .from('pricing_rules')
      .select('*')
      .eq('id', id)
      .single();
    if (error || !data) throw new NotFoundException(`Rule ${id} not found`);
    return data;
  }

  async create(dto: CreateRuleDto) {
    const { data, error } = await this.supabase
      .schema('pricing')
      .from('pricing_rules')
      .insert(dto)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async update(id: string, dto: Partial<CreateRuleDto>) {
    const { data, error } = await this.supabase
      .schema('pricing')
      .from('pricing_rules')
      .update(dto)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }

  async remove(id: string) {
    const { error } = await this.supabase.schema('pricing').from('pricing_rules').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return { deleted: true };
  }
}
