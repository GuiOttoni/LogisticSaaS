import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('catalog')
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get('products')
  getProducts() {
    return this.catalogService.getProducts();
  }

  @Post('products')
  createProduct(@Body() payload: any) {
    return this.catalogService.createProduct(payload);
  }

  @Put('products/:id/price')
  updatePrice(@Param('id') id: string, @Body('newPrice') newPrice: number) {
    return this.catalogService.updatePrice(id, newPrice);
  }

  @Put('products/:id/stock')
  updateStock(@Param('id') id: string, @Body() payload: { changeAmount: number, reason: string }) {
    return this.catalogService.updateStock(id, payload);
  }

  @Delete('products/:id')
  deleteProduct(@Param('id') id: string) {
    return this.catalogService.deleteProduct(id);
  }
}
