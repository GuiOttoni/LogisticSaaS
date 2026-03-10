import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PricingModule } from './pricing/pricing.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrdersModule } from './orders/orders.module';
import { AuthModule } from './auth/auth.module';
import { SupabaseModule } from './supabase/supabase.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    AuthModule,
    PricingModule,
    InventoryModule,
    OrdersModule,
  ],
})
export class AppModule {}
