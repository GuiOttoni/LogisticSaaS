import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class OrdersService {
  private readonly orderServiceUrl: string;

  constructor(private readonly config: ConfigService) {
    this.orderServiceUrl = this.config.get<string>('ORDER_SERVICE_URL', 'http://order-service:3004');
  }

  async findAll() {
    try {
      const res = await axios.get(`${this.orderServiceUrl}/reservations`); // The .NET service has [Route("reservations")]
      return res.data;
    } catch (e) {
      throw new Error(`Order Service Error: ${e.message}`);
    }
  }

  async createReservation(dto: CreateReservationDto) {
    const response = await axios.post(`${this.orderServiceUrl}/reservations`, dto);
    return response.data;
  }

  async getReservation(orderId: string) {
    const response = await axios.get(`${this.orderServiceUrl}/reservations/${orderId}`);
    return response.data;
  }
}
