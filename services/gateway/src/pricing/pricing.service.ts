import { Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class PricingService {
  private readonly baseUrl = 'http://pricing-solver:3003/pricing-rules';

  async findAll() {
    try {
      const res = await axios.get(this.baseUrl);
      return res.data;
    } catch (e) {
      throw new Error(`Failed to fetch rules from C++ service: ${e.message}`);
    }
  }

  async findOne(id: string) {
    try {
      const res = await axios.get(`${this.baseUrl}/${id}`);
      return res.data;
    } catch (e) {
      throw new NotFoundException(`Rule ${id} not found in C++ service`);
    }
  }

  async create(dto: any) {
    try {
      const res = await axios.post(this.baseUrl, dto);
      return res.data;
    } catch (e) {
      throw new Error(`Failed to create rule in C++ service: ${e.message}`);
    }
  }

  async update(id: string, dto: any) {
    try {
      const res = await axios.put(`${this.baseUrl}/${id}`, dto);
      return res.data;
    } catch (e) {
      throw new Error(`Failed to update rule in C++ service: ${e.message}`);
    }
  }

  async remove(id: string) {
    try {
      await axios.delete(`${this.baseUrl}/${id}`);
      return { deleted: true };
    } catch (e) {
      throw new Error(`Failed to delete rule in C++ service: ${e.message}`);
    }
  }

  async calculate(payload: any) {
    try {
      const res = await axios.post('http://pricing-solver:3003/calculate', payload);
      return res.data;
    } catch (e) {
      throw new Error(`Pricing Solver error: ${e.message}`);
    }
  }
}
