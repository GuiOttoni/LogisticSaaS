import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { PricingModule } from './pricing/pricing.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrdersModule } from './orders/orders.module';
import { CatalogModule } from './catalog/catalog.module';
import { KafkaStreamController } from './kafka-stream.controller';
import { KafkaStreamService } from './kafka-stream.service';
import { IngestionController } from './ingestion/ingestion.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SupabaseModule,
    AuthModule,
    PricingModule,
    InventoryModule,
    OrdersModule,
    CatalogModule,
  ],
  controllers: [KafkaStreamController, IngestionController],
  providers: [KafkaStreamService],
})
export class AppModule {}
