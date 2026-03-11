using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace catalog_service;

// DB Model
[Table("products")]
public class Product : BaseModel
{
    [PrimaryKey("id", false)]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("sku")]
    public string Sku { get; set; } = string.Empty;

    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Column("base_price")]
    public decimal BasePrice { get; set; }

    [Column("stock_quantity")]
    public int StockQuantity { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// DB Audit Model
[Table("stock_audit")]
public class StockAudit : BaseModel
{
    [PrimaryKey("id", false)]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("product_id")]
    public Guid ProductId { get; set; }

    [Column("change_amount")]
    public int ChangeAmount { get; set; }

    [Column("new_quantity")]
    public int NewQuantity { get; set; }

    [Column("reason")]
    public string Reason { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// API DTOs
public record ProductDto(Guid Id, string Sku, string Name, decimal BasePrice, int StockQuantity, DateTime CreatedAt);
public record StockAuditDto(Guid Id, Guid ProductId, int ChangeAmount, int NewQuantity, string Reason, DateTime CreatedAt);
