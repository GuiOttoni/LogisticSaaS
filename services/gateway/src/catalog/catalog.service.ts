import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CatalogService {
  private readonly baseUrl = process.env.CATALOG_SERVICE_URL || 'http://catalog-service:3005';

  constructor(private readonly httpService: HttpService) {}

  async getProducts() {
    try {
      const response = await firstValueFrom(this.httpService.get(`${this.baseUrl}/api/products`));
      return response.data;
    } catch (e: any) {
      throw new InternalServerErrorException(e.response?.data || 'Failed to fetch products');
    }
  }

  async createProduct(payload: any) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/api/products`, payload),
      );
      return response.data;
    } catch (e: any) {
      throw new InternalServerErrorException(e.response?.data || 'Failed to create product');
    }
  }

  async updatePrice(id: string, newPrice: number) {
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${this.baseUrl}/api/products/${id}/price?newPrice=${newPrice}`),
      );
      return response.data;
    } catch (e: any) {
       throw new InternalServerErrorException(e.response?.data || 'Failed to update price');
    }
  }

  async updateStock(id: string, payload: { changeAmount: number, reason: string }) {
    try {
      const response = await firstValueFrom(
        this.httpService.put(`${this.baseUrl}/api/products/${id}/stock`, payload),
      );
      return response.data;
    } catch (e: any) {
       throw new InternalServerErrorException(e.response?.data || 'Failed to update stock');
    }
  }

  async deleteProduct(id: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete(`${this.baseUrl}/api/products/${id}`),
      );
      return response.data;
    } catch (e: any) {
      throw new InternalServerErrorException(e.response?.data || 'Failed to delete product');
    }
  }
}
