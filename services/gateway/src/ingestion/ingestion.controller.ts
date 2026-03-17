import { Controller, Post, Body } from '@nestjs/common';
import axios from 'axios';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('ingestion')
@Controller('telemetry')
export class IngestionController {
  private readonly baseUrl = 'http://ingestion:3002/telemetry';

  @Post()
  async proxyTelemetry(@Body() payload: any) {
    try {
      const res = await axios.post(this.baseUrl, payload);
      return res.data;
    } catch (e) {
      throw new Error(`Failed to forward telemetry: ${e.message}`);
    }
  }
}
