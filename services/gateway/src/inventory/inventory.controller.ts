import { Controller, Get, Post, Param, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('snapshot')
  getSnapshot(@Query('sku_id') skuId?: string) {
    return this.inventoryService.getSnapshot(skuId);
  }

  @Get('snapshot/:skuId')
  getSkuSnapshot(@Param('skuId') skuId: string) {
    return this.inventoryService.getSnapshot(skuId);
  }
}
