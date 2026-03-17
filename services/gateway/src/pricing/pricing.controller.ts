import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('pricing')
@ApiBearerAuth()
// TODO [SECURITY]: Re-enable @UseGuards(JwtAuthGuard) before any public/production deployment.
// @UseGuards(JwtAuthGuard) // Temporarily disabled for local dev — pricing endpoints are UNPROTECTED
@Controller('pricing-rules')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get()
  findAll() {
    return this.pricingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pricingService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateRuleDto) {
    return this.pricingService.create(dto);
  }

  @Post('calculate')
  calculate(@Body() payload: any) {
    return this.pricingService.calculate(payload);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateRuleDto>) {
    return this.pricingService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pricingService.remove(id);
  }
}
