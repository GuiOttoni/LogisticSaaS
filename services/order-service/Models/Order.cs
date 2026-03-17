using System;
using Supabase.Postgrest.Attributes;
using Supabase.Postgrest.Models;

namespace OmniDynamic.OrderService.Models;

[Table("orders")]
public class Order : BaseModel
{
    [PrimaryKey("id", false)]
    public Guid Id { get; set; }

    [Column("sku")]
    public string Sku { get; set; } = string.Empty;

    [Column("quantity")]
    public int Quantity { get; set; } = 1;

    [Column("total_price")]
    public decimal TotalPrice { get; set; }

    [Column("status")]
    public string Status { get; set; } = "COMPLETED";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
