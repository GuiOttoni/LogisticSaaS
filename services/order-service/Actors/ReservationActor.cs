using Akka.Actor;

namespace OmniDynamic.OrderService.Actors;

// ─────────────────────────────────── Messages ────────────────────────────────
public record CreateReservation(string SkuId, string OrderId);
public record ReservationCreated(string OrderId, string SkuId, DateTimeOffset ExpiresAt);
public record ReservationExpired(string OrderId);
public record GetReservation(string OrderId);

// ─────────────────────────────── Reservation Actor ────────────────────────────
/// <summary>
/// Manages a single stock reservation with TTL using Akka scheduling.
/// One actor instance per order (aggregate per Akka.NET best-practice).
/// </summary>
public class ReservationActor : ReceiveActor
{
    private readonly string _orderId;
    private readonly string _skuId;
    private readonly int _ttlMinutes;
    private ICancelable? _expiryCancellable;

    public ReservationActor(string orderId, string skuId, int ttlMinutes = 15)
    {
        _orderId    = orderId;
        _skuId      = skuId;
        _ttlMinutes = ttlMinutes;

        Receive<CreateReservation>(_ => HandleCreate());
        Receive<ReservationExpired>(msg => HandleExpired(msg));
        Receive<GetReservation>(_ => Sender.Tell(new ReservationCreated(
            _orderId, _skuId, DateTimeOffset.UtcNow.AddMinutes(_ttlMinutes))));
    }

    private void HandleCreate()
    {
        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(_ttlMinutes);

        // Schedule self-message to expire the reservation
        _expiryCancellable = Context.System.Scheduler.ScheduleTellOnceCancelable(
            TimeSpan.FromMinutes(_ttlMinutes),
            Self,
            new ReservationExpired(_orderId),
            Self);

        Sender.Tell(new ReservationCreated(_orderId, _skuId, expiresAt));
    }

    private void HandleExpired(ReservationExpired msg)
    {
        Context.Stop(Self); // Self-terminate after TTL
    }

    protected override void PostStop()
    {
        _expiryCancellable?.Cancel();
        base.PostStop();
    }
}

// ─────────────────────────────── Supervisor Actor ─────────────────────────────
/// <summary>Creates child ReservationActors per order.</summary>
public class ReservationSupervisorActor : ReceiveActor
{
    public ReservationSupervisorActor()
    {
        Receive<CreateReservation>(msg =>
        {
            var child = Context.Child(msg.OrderId);
            if (child.IsNobody())
            {
                child = Context.ActorOf(
                    Props.Create<ReservationActor>(msg.OrderId, msg.SkuId),
                    msg.OrderId);
            }
            child.Forward(msg);
        });

        Receive<GetReservation>(msg =>
        {
            var child = Context.Child(msg.OrderId);
            child.IsNobody()
                ? Sender.Tell(null)
                : child.Forward(msg);
        });
    }
}
