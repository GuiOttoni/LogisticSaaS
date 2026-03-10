using Akka.Actor;
using Microsoft.AspNetCore.Mvc;
using OmniDynamic.OrderService.Actors;

namespace OmniDynamic.OrderService.Controllers;

[ApiController]
[Route("reservations")]
public class OrderController : ControllerBase
{
    private readonly ActorSystem _actorSystem;

    public OrderController(ActorSystem actorSystem) => _actorSystem = actorSystem;

    [HttpPost]
    public async Task<IActionResult> CreateReservation([FromBody] CreateReservationRequest req)
    {
        var supervisor = _actorSystem.ActorSelection("/user/reservation-supervisor");
        var result = await supervisor.Ask<ReservationCreated>(
            new CreateReservation(req.SkuId, req.OrderId),
            TimeSpan.FromSeconds(5));

        return Ok(new
        {
            order_id   = result.OrderId,
            sku_id     = result.SkuId,
            expires_at = result.ExpiresAt,
            status     = "RESERVED"
        });
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
