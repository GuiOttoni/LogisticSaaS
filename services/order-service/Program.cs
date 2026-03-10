using Akka.Actor;
using Microsoft.OpenApi.Models;
using OmniDynamic.OrderService.Actors;

var builder = WebApplication.CreateBuilder(args);

// Akka.NET ActorSystem
builder.Services.AddSingleton(_ => ActorSystem.Create("OmniDynamic",
    Akka.Configuration.ConfigurationFactory.ParseString(@"
        akka {
            loglevel = INFO
            actor.provider = local
        }
    ")));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c => c.SwaggerDoc("v1", new OpenApiInfo
{
    Title = "OmniDynamic Order Service", Version = "v1"
}));

var app = builder.Build();

// Bootstrap actor system
var actorSystem = app.Services.GetRequiredService<ActorSystem>();
var reservationSupervisor = actorSystem.ActorOf(
    Props.Create<ReservationSupervisorActor>(), "reservation-supervisor");

app.UseSwagger();
app.UseSwaggerUI();
app.MapControllers();

var port = builder.Configuration["ORDER_SERVICE_PORT"] ?? "3004";
app.Run($"http://0.0.0.0:{port}");
