import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('orders')
@ApiBearerAuth()
// @UseGuards(JwtAuthGuard) // Disabled for local simulation/frontend connection without auth provider
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('reservations')
  reserve(@Body() dto: CreateReservationDto) {
    return this.ordersService.createReservation(dto);
  }

  @Get('reservations/:orderId')
  getReservation(@Param('orderId') orderId: string) {
    return this.ordersService.getReservation(orderId);
  }
}
