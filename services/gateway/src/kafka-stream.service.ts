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
    this.connectWithRetry();
  }

  private async connectWithRetry(retries = 20) {
    for (let i = 0; i < retries; i++) {
      try {
        console.log(`Connecting to Kafka (attempt ${i + 1}/${retries})...`);
        await this.consumer.connect();
        
        // Subscribe to interesting topics
        await this.consumer.subscribe({ topic: 'inventory-events', fromBeginning: false });
        await this.consumer.subscribe({ topic: 'order-events', fromBeginning: false });

        await this.consumer.run({
          eachMessage: async ({ topic, partition, message }) => {
            try {
              const payload = message.value?.toString() || '{}';
              this.eventSubject.next({
                data: JSON.stringify({
                  topic,
                  timestamp: message.timestamp,
                  payload: JSON.parse(payload)
                })
              });
            } catch (e) {
              console.error(`Error processing Kafka message: ${e.message}`);
            }
          },
        });
        
        console.log('Successfully connected to Kafka');
        return;
      } catch (e) {
        console.error(`Failed to connect to Kafka: ${e.message}. Retrying in 5 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
    console.error('Failed to connect to Kafka after multiple retries.');
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }

  getEventStream(): Observable<MessageEvent> {
    return this.eventSubject.asObservable();
  }
}
