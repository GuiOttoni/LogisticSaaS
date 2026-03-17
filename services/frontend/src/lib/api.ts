import axios from 'axios';

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: GATEWAY_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface ConfigUpdatePayload {
  basePrice: number;
  surgeMultiplier: number;
}

export interface PricingRule {
  id: string;
  name: string;
  target_scope: 'GLOBAL' | 'SKU' | 'CATEGORY' | 'REGION';
  target_id: string;
  conditions: any;
  action_logic: any;
  priority: number;
  is_active: boolean;
  weight: number;
  multiplier: number;
  base_markup: number;
  updated_at?: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  quantity: number;
  locationId: string;
}

export interface CreateOrderPayload {
  customerId: string;
  items: { productId: string; quantity: number }[];
}

export const PricingService = {
  getRules: async () => {
    const res = await api.get('/pricing-rules');
    return res.data;
  },
  getOne: async (id: string) => {
    const res = await api.get(`/pricing-rules/${id}`);
    return res.data;
  },
  createRule: async (payload: any) => {
    const res = await api.post('/pricing-rules', payload);
    return res.data;
  },
  updateRule: async (id: string, payload: any) => {
    const res = await api.put(`/pricing-rules/${id}`, payload);
    return res.data;
  },
  deleteRule: async (id: string) => {
    const res = await api.delete(`/pricing-rules/${id}`);
    return res.data;
  },
  calculatePrice: async (payload: { base_price: number, stock_level: number, sku?: string, category?: string }) => {
    const res = await api.post('/pricing-rules/calculate', payload);
    return res.data;
  },
  // Legacy support for older components
  getConfig: async () => {
    try {
      const rules = await PricingService.getRules();
      return rules[0] || { basePrice: 15.0, surgeMultiplier: 1.2 };
    } catch (e) { return null; }
  },
  updateConfig: async (payload: any) => {
    return PricingService.createRule({
      name: "Global Config Update",
      target_scope: "GLOBAL",
      priority: 100,
      is_active: true,
      conditions: {},
      action_logic: payload
    });
  }
};

export const OrdersService = {
  getOrders: async () => {
    const res = await api.get('/orders');
    return res.data;
  },
  createOrder: async (payload: { sku_id: string, order_id: string }) => {
    const res = await api.post('/orders/reservations', payload);
    return res.data;
  },
  simulateLoad: async (count: number) => {
    const promises = Array.from({ length: count }).map((_, i) =>
      api.post('/orders/reservations', {
        order_id: (Math.random()*1e16).toString(36), // Replace crypto.randomUUID for build safety
        sku_id: "SKU-992",
      })
    );
    const results = await Promise.allSettled(promises);
    return results;
  }
};

export interface Product {
  id: string;
  sku: string;
  name: string;
  basePrice: number;
  stockQuantity: number;
  createdAt: string;
}

export const CatalogService = {
  getProducts: async (): Promise<Product[]> => {
    const res = await api.get('/catalog/products');
    return res.data;
  },
  createProduct: async (product: Partial<Product>): Promise<Product> => {
    const res = await api.post('/catalog/products', product);
    return res.data;
  },
  updatePrice: async (id: string, newPrice: number): Promise<Product> => {
    const res = await api.put(`/catalog/products/${id}/price`, { newPrice });
    return res.data;
  },
  updateStock: async (id: string, payload: { changeAmount: number, reason: string }): Promise<Product> => {
    const res = await api.put(`/catalog/products/${id}/stock`, payload);
    return res.data;
  },
  deleteProduct: async (id: string): Promise<void> => {
    const res = await api.delete(`/catalog/products/${id}`);
    return res.data;
  }
};

export const IngestionService = {
  sendTelemetry: async (event: { skuId: string, warehouseId: string, eventType: string, quantityDelta: number }) => {
    const payload = {
      ...event,
      sensorId: `SIM-${Math.random().toString(36).substring(7).toUpperCase()}`,
      timestamp: new Date().toISOString()
    };
    const res = await api.post('/telemetry', payload);
    return res.data;
  }
};
