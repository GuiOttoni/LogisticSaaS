package com.omnidynamic.ingestion.controller;

import com.omnidynamic.ingestion.model.TelemetryEvent;
import com.omnidynamic.ingestion.service.KafkaProducerService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/telemetry")
public class WebhookController {

    private final KafkaProducerService kafkaProducerService;

    public WebhookController(KafkaProducerService kafkaProducerService) {
        this.kafkaProducerService = kafkaProducerService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.ACCEPTED)
    public Mono<Void> ingest(@RequestBody TelemetryEvent event) {
        return kafkaProducerService.publish(event);
    }

    @GetMapping("/health")
    public Mono<String> health() {
        return Mono.just("OmniDynamic Ingestion Layer - OK");
    }
}
