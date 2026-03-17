using Confluent.Kafka;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;

namespace OmniDynamic.OrderService.Services;

/// <summary>
/// Singleton Kafka producer for publishing order lifecycle events to 'order-events' topic.
/// Injected into KafkaOrderWorker and OrderController.
/// </summary>
public class KafkaProducerService : IDisposable
{
    private readonly IProducer<string, string> _producer;
    private readonly ILogger<KafkaProducerService> _logger;
    private readonly string _orderTopic;

    public KafkaProducerService(ILogger<KafkaProducerService> logger, IConfiguration configuration)
    {
        _logger      = logger;
        _orderTopic  = configuration["KAFKA_TOPIC_ORDERS"] ?? "order-events";

        var config = new ProducerConfig
        {
            BootstrapServers = configuration["KAFKA_BOOTSTRAP_SERVERS"] ?? "kafka:9092",
            Acks             = Acks.Leader,          // fast ack — not critical path
            MessageTimeoutMs = 5000
        };

        _producer = new ProducerBuilder<string, string>(config).Build();
    }

    /// <summary>
    /// Publishes an order event JSON payload keyed by SKU.
    /// </summary>
    public async Task PublishAsync(string key, object payload)
    {
        var json = JsonConvert.SerializeObject(payload);
        try
        {
            await _producer.ProduceAsync(_orderTopic, new Message<string, string>
            {
                Key   = key,
                Value = json
            });
            _logger.LogInformation("[order-events] Published event key={Key}", key);
        }
        catch (ProduceException<string, string> ex)
        {
            _logger.LogError("[order-events] Produce failed: {Error}", ex.Error.Reason);
        }
    }

    public void Dispose()
    {
        _producer.Flush(TimeSpan.FromSeconds(5));
        _producer.Dispose();
    }
}
