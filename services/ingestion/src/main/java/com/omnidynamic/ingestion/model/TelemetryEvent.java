package com.omnidynamic.ingestion.model;

import java.time.Instant;

public record TelemetryEvent(
    String skuId,
    String warehouseId,
    String eventType,  // check_in | check_out | movement | physical_count
    double quantityDelta,
    String sensorId,
    Instant timestamp
) {}
