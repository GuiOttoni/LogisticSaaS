using Akka.Actor;
using Microsoft.OpenApi.Models;
using OmniDynamic.OrderService.Actors;
using OmniDynamic.OrderService.Services;
using Serilog;
using Serilog.Sinks.Grafana.Loki;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Application", "OrderService")
    .WriteTo.Console()
    .WriteTo.GrafanaLoki(
        "http://loki:3100",
        propertiesAsLabels: new[] { "Application" })
    .CreateLogger();

builder.Host.UseSerilog();

// Akka.NET ActorSystem
builder.Services.AddSingleton(_ => ActorSystem.Create("OmniDynamic",
    Akka.Configuration.ConfigurationFactory.ParseString(@"
        akka {
            loglevel = INFO
            actor.provider = local
        }
    ")));

// Supabase Client
var supabaseUrl = builder.Configuration["SUPABASE_URL"];
var supabaseKey = builder.Configuration["SUPABASE_SERVICE_ROLE_KEY"];

if (string.IsNullOrEmpty(supabaseUrl) || string.IsNullOrEmpty(supabaseKey))
{
    Log.Fatal("Supabase configuration is missing. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.");
    throw new InvalidOperationException("Supabase configuration is missing.");
}

builder.Services.AddSingleton(provider => new Supabase.Client(supabaseUrl, supabaseKey, new Supabase.SupabaseOptions { AutoRefreshToken = true }));

// Kafka Producer (singleton — shared by worker and controller)
builder.Services.AddSingleton<KafkaProducerService>();

// Background Workers
builder.Services.AddHostedService<OmniDynamic.OrderService.Workers.KafkaOrderWorker>();

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
