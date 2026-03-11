import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { Subject, Observable } from 'rxjs';
import { MessageEvent } from '@nestjs/common';

@Injectable()
export class KafkaStreamService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;
  private eventSubject = new Subject<MessageEvent>();

  constructor() {
    this.kafka = new Kafka({
      clientId: 'gateway-sse-client',
      brokers: [(process.env.KAFKA_BOOTSTRAP_SERVERS || 'kafka:9092')],
    });
    this.consumer = this.kafka.consumer({ groupId: 'gateway-sse-group' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    
    // Subscribe to interesting topics
    await this.consumer.subscribe({ topic: 'inventory-events', fromBeginning: false });
    await this.consumer.subscribe({ topic: 'order-events', fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const payload = message.value?.toString() || '{}';
        
        this.eventSubject.next({
          data: JSON.stringify({
            topic,
            timestamp: message.timestamp,
            payload: JSON.parse(payload)
          })
        });
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }

  getEventStream(): Observable<MessageEvent> {
    return this.eventSubject.asObservable();
  }
}
