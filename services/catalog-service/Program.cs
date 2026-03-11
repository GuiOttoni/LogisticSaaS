using catalog_service;
using Serilog;
using Serilog.Sinks.Grafana.Loki;
using Supabase;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Application", "CatalogService")
    .WriteTo.Console()
    .WriteTo.GrafanaLoki(
        "http://loki:3100",
        propertiesAsLabels: new[] { "Application" })
    .CreateLogger();

builder.Host.UseSerilog();

var supabaseUrl = builder.Configuration["SUPABASE_URL"] ?? "";
var supabaseKey = builder.Configuration["SUPABASE_SERVICE_ROLE_KEY"] ?? "";

var options = new SupabaseOptions
{
    AutoRefreshToken = true,
};

builder.Services.AddSingleton(provider => new Supabase.Client(supabaseUrl, supabaseKey, options));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.MapGet("/api/products", async (Supabase.Client supabase) =>
{
    var response = await supabase.From<Product>().Get();
    var dtos = response.Models.Select(p => new ProductDto(p.Id, p.Sku, p.Name, p.BasePrice, p.StockQuantity, p.CreatedAt));
    return Results.Ok(dtos);
});

app.MapGet("/api/products/{id}", async (Guid id, Supabase.Client supabase) =>
{
    var response = await supabase.From<Product>()
        .Where(x => x.Id == id)
        .Single();
    
    if (response is null) return Results.NotFound();
    
    return Results.Ok(new ProductDto(response.Id, response.Sku, response.Name, response.BasePrice, response.StockQuantity, response.CreatedAt));
});

app.MapPost("/api/products", async (Product product, Supabase.Client supabase) =>
{
    var response = await supabase.From<Product>().Insert(product);
    var p = response.Models.FirstOrDefault();
    return p is not null 
        ? Results.Created($"/api/products/{p.Id}", new ProductDto(p.Id, p.Sku, p.Name, p.BasePrice, p.StockQuantity, p.CreatedAt))
        : Results.BadRequest("Failed to create product");
});

app.MapPut("/api/products/{id}/price", async (Guid id, decimal newPrice, Supabase.Client supabase) =>
{
    var response = await supabase.From<Product>()
        .Where(x => x.Id == id)
        .Set(x => x.BasePrice, newPrice)
        .Update();
    
    var p = response.Models.FirstOrDefault();
    return p is not null 
        ? Results.Ok(new ProductDto(p.Id, p.Sku, p.Name, p.BasePrice, p.StockQuantity, p.CreatedAt)) 
        : Results.NotFound();
});

app.MapPut("/api/products/{id}/stock", async (Guid id, StockUpdateRequest req, Supabase.Client supabase) =>
{
    var fetch = await supabase.From<Product>().Where(x => x.Id == id).Single();
    if (fetch is null) return Results.NotFound();

    fetch.StockQuantity += req.ChangeAmount;
    
    var updateResponse = await supabase.From<Product>().Update(fetch);
    var p = updateResponse.Models.FirstOrDefault();

    if (p is not null)
    {
        var audit = new StockAudit
        {
            ProductId = id,
            ChangeAmount = req.ChangeAmount,
            NewQuantity = p.StockQuantity,
            Reason = req.Reason
        };
        await supabase.From<StockAudit>().Insert(audit);
        return Results.Ok(new ProductDto(p.Id, p.Sku, p.Name, p.BasePrice, p.StockQuantity, p.CreatedAt));
    }
    
    return Results.BadRequest("Failed to update stock");
});

app.MapDelete("/api/products/{id}", async (Guid id, Supabase.Client supabase) =>
{
    await supabase.From<Product>()
        .Where(x => x.Id == id)
        .Delete();
    
    return Results.NoContent();
});

app.Run();

public record StockUpdateRequest(int ChangeAmount, string Reason);
