using Akka.Actor;
using Microsoft.AspNetCore.Mvc;
using OmniDynamic.OrderService.Actors;
using OmniDynamic.OrderService.Services;

namespace OmniDynamic.OrderService.Controllers;

[ApiController]
[Route("reservations")]
public class OrderController : ControllerBase
{
    private readonly ActorSystem _actorSystem;
    private readonly Supabase.Client _supabase;
    private readonly KafkaProducerService _producer;

    public OrderController(ActorSystem actorSystem, Supabase.Client supabase, KafkaProducerService producer)
    {
        _actorSystem = actorSystem;
        _supabase    = supabase;
        _producer    = producer;
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders()
    {
        try
        {
            var result = await _supabase.From<Models.Order>().Get();
            return Ok(result.Models);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = "Database error", message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateReservation([FromBody] CreateReservationRequest req)
    {
        var supervisor = _actorSystem.ActorSelection("/user/reservation-supervisor");
        var result = await supervisor.Ask<ReservationCreated>(
            new CreateReservation(req.SkuId, req.OrderId),
            TimeSpan.FromSeconds(5));

        var response = new
        {
            order_id   = result.OrderId,
            sku_id     = result.SkuId,
            expires_at = result.ExpiresAt,
            status     = "RESERVED"
        };

        // Publish reservation event so Gateway SSE broadcasts to frontend
        _ = _producer.PublishAsync(result.SkuId, new
        {
            event_type = "RESERVATION_CREATED",
            order_id   = result.OrderId,
            sku_id     = result.SkuId,
            expires_at = result.ExpiresAt,
            timestamp  = DateTimeOffset.UtcNow
        });

        return Ok(response);
    }

    [HttpGet("{orderId}")]
    public async Task<IActionResult> GetReservation(string orderId)
    {
        var supervisor = _actorSystem.ActorSelection("/user/reservation-supervisor");
        var result = await supervisor.Ask<ReservationCreated?>(
            new GetReservation(orderId), TimeSpan.FromSeconds(3));

        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("health")]
    public IActionResult Health() => Ok(new { status = "OmniDynamic Order Service - OK" });
}

public record CreateReservationRequest(string SkuId, string OrderId);
