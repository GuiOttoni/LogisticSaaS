package com.omnidynamic.ingestion.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.omnidynamic.ingestion.model.TelemetryEvent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
public class KafkaProducerService {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${kafka.topic.inventory:inventory-events}")
    private String topic;

    public KafkaProducerService(KafkaTemplate<String, String> kafkaTemplate,
                                ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper  = objectMapper;
    }

    public Mono<Void> publish(TelemetryEvent event) {
        return Mono.fromCallable(() -> {
            try {
                String json = objectMapper.writeValueAsString(event);
                kafkaTemplate.send(topic, event.skuId(), json);
            } catch (JsonProcessingException e) {
                throw new RuntimeException("Failed to serialize telemetry event", e);
            }
            return null;
        })
        .subscribeOn(Schedulers.boundedElastic())
        .then();
    }
}
