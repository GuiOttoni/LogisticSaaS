using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Confluent.Kafka;
using Newtonsoft.Json;
using OmniDynamic.OrderService.Models;
using OmniDynamic.OrderService.Services;
using Supabase;

namespace OmniDynamic.OrderService.Workers;

public class KafkaOrderWorker : BackgroundService
{
    private readonly ILogger<KafkaOrderWorker> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly IConfiguration _configuration;
    private readonly KafkaProducerService _producer;
    private readonly string _topic;
    private readonly string _bootstrapServers;

    public KafkaOrderWorker(
        ILogger<KafkaOrderWorker> logger,
        IServiceProvider serviceProvider,
        IConfiguration configuration,
        KafkaProducerService producer)
    {
        _logger = logger;
        _serviceProvider = serviceProvider;
        _configuration = configuration;
        _producer = producer;
        _topic = _configuration["KAFKA_TOPIC_INVENTORY"] ?? "inventory-events";
        _bootstrapServers = _configuration["KAFKA_BOOTSTRAP_SERVERS"] ?? "kafka:9092";
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var config = new ConsumerConfig
        {
            BootstrapServers = _bootstrapServers,
            GroupId = "order-service-group",
            AutoOffsetReset = AutoOffsetReset.Earliest,
            EnableAutoCommit = true
        };

        // Run the blocking consumer in a separate task
        _ = Task.Run(async () =>
        {
            using var consumer = new ConsumerBuilder<string, string>(config).Build();
            consumer.Subscribe(_topic);

            _logger.LogInformation("Kafka Order Worker started, subscribing to {Topic}", _topic);

            try
            {
                while (!stoppingToken.IsCancellationRequested)
                {
                    try
                    {
                        var result = consumer.Consume(stoppingToken);
                        if (result == null || string.IsNullOrEmpty(result.Message.Value)) continue;

                        _logger.LogInformation("Received message: {Message}", result.Message.Value);

                        var telemetryEvent = JsonConvert.DeserializeObject<TelemetryEventDto>(result.Message.Value);
                        
                        // We treat 'check_out' events as sales for the order fan-out requirement
                        if (telemetryEvent != null && (telemetryEvent.EventType == "check_out" || telemetryEvent.EventType == "SALE"))
                        {
                            await ProcessOrder(telemetryEvent);
                        }
                    }
                    catch (ConsumeException e)
                    {
                        _logger.LogError("Error consuming from Kafka: {Error}", e.Error.Reason);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error processing Kafka message");
                    }
                }
            }
            catch (OperationCanceledException)
            {
                _logger.LogInformation("Kafka consumer stopping...");
            }
            finally
            {
                consumer.Close();
                _logger.LogInformation("Kafka Order Worker stopped");
            }
        }, stoppingToken);

        return Task.CompletedTask;
    }

    private async Task ProcessOrder(TelemetryEventDto @event)
    {
        using var scope = _serviceProvider.CreateScope();
        var supabase = scope.ServiceProvider.GetRequiredService<Supabase.Client>();

        // Note: For a real app, we'd fetch the current price from Catalog or Pricing service.
        // For this lab, we'll try to find it in metadata or use a default.
        decimal price = 10.0m; // Default placeholder
        if (@event.Metadata != null && @event.Metadata.ContainsKey("price"))
        {
            decimal.TryParse(@event.Metadata["price"]?.ToString(), out price);
        }

        var order = new Order
        {
            Sku = @event.SkuId,
            Quantity = (int)Math.Abs(@event.QuantityDelta),
            TotalPrice = price * (decimal)Math.Abs(@event.QuantityDelta),
            Status = "COMPLETED",
            CreatedAt = DateTime.UtcNow
        };

        try
        {
            await supabase.From<Order>().Insert(order);
            _logger.LogInformation("Order persisted for SKU: {Sku}, Quantity: {Qty}", order.Sku, order.Quantity);

            // Publish to order-events so Gateway SSE broadcasts to frontend
            await _producer.PublishAsync(order.Sku, new
            {
                event_type = "ORDER_CREATED",
                sku        = order.Sku,
                quantity   = order.Quantity,
                total_price= order.TotalPrice,
                status     = order.Status,
                timestamp  = order.CreatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to save order to Supabase");
        }
    }
}

public class TelemetryEventDto
{
    [JsonProperty("skuId")]
    public string SkuId { get; set; } = string.Empty;

    [JsonProperty("eventType")]
    public string EventType { get; set; } = string.Empty;

    [JsonProperty("quantityDelta")]
    public double QuantityDelta { get; set; }

    [JsonProperty("metadata")]
    public Dictionary<string, object>? Metadata { get; set; }
}
