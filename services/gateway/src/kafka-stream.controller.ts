import { Controller, Sse, MessageEvent } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { KafkaStreamService } from './kafka-stream.service';

@ApiTags('stream')
@Controller('stream')
export class KafkaStreamController {
  constructor(private readonly kafkaService: KafkaStreamService) {}

  @Sse('kafka')
  streamEvents(): Observable<MessageEvent> {
    return this.kafkaService.getEventStream();
  }
}
